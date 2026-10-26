/**
 * Ufq sayti uchun bronlar: Google jadval + Telegram xabari.
 *
 * Sayt bronni shu skriptga yuboradi. Skript uni "Bronlar" varag‘iga yozadi va Telegram’ingizga xabar jo‘natadi.
 * "Holat" ustunini o‘zgartirsangiz (Yangi / Tasdiqlandi / Bekor qilindi), mijoz buni saytdagi "Bronlarim" bo‘limida ko‘radi.
 * "Narxlar" varag‘idagi narxlarni o‘zgartirsangiz, sayt ularni o‘zi oladi.
 *
 * O‘rnatish tartibi README.md faylida.
 */

// 1) @BotFather bergan bot tokeni. Bu yerda turadi, saytga va GitHub’ga chiqmaydi.
const TELEGRAM_TOKEN = '';
// 2) Xabar boradigan chat raqami. Botga /start yozing, so‘ng getChatId() ni ishga tushiring.
const TELEGRAM_CHAT_ID = '';

const SHEET_BOOKINGS = 'Bronlar';
const SHEET_PRICES = 'Narxlar';
const HEAD = ['Qabul qilindi', 'Bron raqami', 'Holat', 'Ism', 'Telefon', 'Tur', 'Jo‘nash sanasi', 'Tunlar', 'Kattalar', 'Bolalar', 'Summa, so‘m', 'Izoh'];
const STATUS = { 'Yangi': 'yangi', 'Tasdiqlandi': 'tasdiqlandi', 'Bekor qilindi': 'bekor' };
// id, nomi, yo‘l (kishi boshiga), bir tun (kishi boshiga), odatiy tunlar — so‘mda
const TOURS = [
  ['skd', 'Samarqand', 540000, 450000, 2],
  ['bhk', 'Buxoro', 760000, 420000, 2],
  ['khv', 'Xiva', 1600000, 400000, 2],
  ['shr', 'Shahrisabz', 600000, 400000, 1],
  ['chv', 'Chorvoq va Chimyon', 250000, 650000, 1],
  ['ayd', 'Aydarko‘l va Nurota', 600000, 550000, 1],
  ['mnq', 'Mo‘ynoq va Orol', 1900000, 450000, 2],
  ['fgn', 'Farg‘ona vodiysi', 500000, 380000, 2]
];

/** Bir marta ishga tushiring: varaqlarni, sarlavhalarni va "Holat" ro‘yxatini yaratadi. */
function setup() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET_BOOKINGS) || ss.insertSheet(SHEET_BOOKINGS);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#0f1f4d').setFontColor('#f6efe0');
    sh.setColumnWidths(1, HEAD.length, 130);
  }
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(Object.keys(STATUS), true).build();
  sh.getRange(2, 3, 2000, 1).setDataValidation(rule);

  const pr = ss.getSheetByName(SHEET_PRICES) || ss.insertSheet(SHEET_PRICES);
  if (pr.getLastRow() === 0) {
    pr.appendRow(['id (o‘zgartirmang)', 'Tur', 'Yo‘l, so‘m', 'Bir tun, so‘m', 'Tunlar', 'Saytda']);
    TOURS.forEach(function (t) { pr.appendRow(t.concat([true])); });
    pr.setFrozenRows(1);
    pr.getRange(1, 1, 1, 6).setFontWeight('bold');
    pr.getRange(2, 6, TOURS.length, 1).insertCheckboxes();
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.website) return json({ ok: true });            // bot to‘ldirgan yashirin maydon
    if (body.action === 'book') return json(book(body.booking || {}));
    if (body.action === 'cancel') return json(cancel(String(body.id || ''), String(body.phone || '')));
    return json({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json({ ok: false, error: 'bad_request' });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'status') return json({ ok: true, statuses: statuses(String(p.ids || '').split(',').slice(0, 30)) });
  if (p.action === 'prices') return json({ ok: true, prices: prices() });
  return json({ ok: true, service: 'ufq-bookings' });
}

function book(b) {
  const id = clean(b.id, 20), name = clean(b.name, 60), phone = clean(b.phone, 20);
  const tour = clean(b.tourName, 60), date = clean(b.date, 10), note = clean(b.note, 400);
  if (!/^UFQ-[A-Z0-9]{3,10}$/.test(id) || name.length < 2 || !/^[+\d\s()-]{9,20}$/.test(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: 'invalid' };
  }
  const nights = toInt(b.nights, 1, 21), adults = toInt(b.adults, 1, 30), kids = toInt(b.kids, 0, 20), total = toInt(b.total, 0, 1e10);
  const sh = sheet(SHEET_BOOKINGS);
  if (findRow(sh, id)) return { ok: true, id: id };          // shu bron qayta yuborilgan
  sh.appendRow([new Date(), id, 'Yangi', safe(name), "'" + phone, safe(tour), date, nights, adults, kids, total, safe(note)]);
  notify('Yangi bron ' + id + '\n' + name + ', ' + phone + '\n' + tour + ', ' + date.split('-').reverse().join('.') + ', ' + nights + ' tun\n' +
    adults + ' katta' + (kids ? ', ' + kids + ' bola' : '') + '\nSumma: ' + money(total) + (note ? '\nIzoh: ' + note : ''));
  return { ok: true, id: id };
}

function cancel(id, phone) {
  const sh = sheet(SHEET_BOOKINGS), row = findRow(sh, id);
  if (!row) return { ok: false, error: 'not_found' };
  const v = sh.getRange(row, 1, 1, HEAD.length).getValues()[0];
  if (digits(v[4]) !== digits(phone)) return { ok: false, error: 'not_found' };
  if (v[2] !== 'Yangi') return { ok: false, error: 'locked' };
  sh.getRange(row, 3).setValue('Bekor qilindi');
  notify('Bron bekor qilindi: ' + id + '\n' + v[3] + ', ' + v[5]);
  return { ok: true };
}

function statuses(ids) {
  const want = {}; ids.forEach(function (i) { want[i.trim()] = true; });
  const sh = sheet(SHEET_BOOKINGS), out = {};
  if (sh.getLastRow() < 2) return out;
  sh.getRange(2, 2, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (want[r[0]]) out[r[0]] = STATUS[r[1]] || 'yangi';
  });
  return out;
}

function prices() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_PRICES), out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().forEach(function (r) {
    if (!r[0]) return;
    out[r[0]] = { f: toInt(r[2], 0, 1e9), h: toInt(r[3], 0, 1e9), n: toInt(r[4], 1, 14), on: r[5] !== false };
  });
  return out;
}

/** Botga /start yozgach shu funksiyani ishga tushiring: chat raqamini jurnalda (Execution log) ko‘rsatadi. */
function getChatId() {
  if (!TELEGRAM_TOKEN) { Logger.log('Avval TELEGRAM_TOKEN ni yozing.'); return; }
  const r = UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/getUpdates', { muteHttpExceptions: true });
  const data = JSON.parse(r.getContentText());
  (data.result || []).forEach(function (u) {
    const c = (u.message || u.channel_post || {}).chat;
    if (c) Logger.log('Chat: ' + (c.title || c.first_name || '') + ' -> TELEGRAM_CHAT_ID = ' + c.id);
  });
  if (!(data.result || []).length) Logger.log('Xabar topilmadi. Botingizga /start yozing va qayta ishga tushiring.');
}

/** Telegram sozlamasini tekshirish uchun sinov xabari. */
function testTelegram() { notify('Ufq: Telegram xabarlari ishlayapti.'); }

function notify(text) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
    method: 'post', payload: { chat_id: TELEGRAM_CHAT_ID, text: text }, muteHttpExceptions: true
  });
}

function sheet(name) { const s = SpreadsheetApp.getActive().getSheetByName(name); if (!s) { setup(); return SpreadsheetApp.getActive().getSheetByName(name); } return s; }
function findRow(sh, id) {
  const n = sh.getLastRow(); if (n < 2) return 0;
  const ids = sh.getRange(2, 2, n - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) if (ids[i][0] === id) return i + 2;
  return 0;
}
function clean(v, n) { return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n); }
function safe(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }       // jadvalda formula bo‘lib ketmasin
function toInt(v, lo, hi) { const x = Math.round(Number(v) || 0); return Math.max(lo, Math.min(hi, x)); }
function digits(s) { return String(s).replace(/\D/g, '').slice(-9); }
function money(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m'; }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
