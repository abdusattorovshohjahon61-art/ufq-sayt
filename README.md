# Ufq — O‘zbekiston bo‘ylab ichki turlar

Tur agentlik sayti: turlar, narxlar, oy bo‘yicha havo va onlayn bron. GitHub Pages’da ishlaydi.
Hisoblar va bronlar Firebase’da (loyiha `ufq-sayt`) saqlanadi, shuning uchun istalgan telefon yoki kompyuterdan bir xil ko‘rinadi.

## Mijoz
1. Saytda turni tanlaydi, sana va ismini yozib **Bronni yuborish** ni bosadi.
2. Hisobi bo‘lmasa, sayt kirishni so‘raydi: **Google bilan kirish** yoki email va parol bilan ro‘yxatdan o‘tish.
   Kirgach bron o‘zi yuboriladi.
3. **Kabinet → Bronlarim** bo‘limida bronining holatini ko‘radi: “Yangi”, “Tasdiqlandi” yoki “Bekor qilindi”.
   “Yangi” bronini o‘zi bekor qila oladi.

## Agentlik egasi (admin)
1. Saytdagi **Kirish** tugmasini bosing va **Google bilan kirish** orqali `abdusattorovshohjahon61@gmail.com` hisobi bilan kiring.
   Shu hisob admin hisoblanadi; boshqa hech kim admin bo‘lolmaydi.
2. Kabinetda **Kelgan bronlar** paydo bo‘ladi: barcha mijozlarning bronlari, telefon va email bilan.
   Mijozga qo‘ng‘iroq qilgach **Tasdiqlash** yoki **Bekor qilish** ni bosing, mijoz buni darhol ko‘radi.
3. Yuqori burchakdagi **SEO** tugmasi: agentlik nomi, telefon, manzil, Telegram, narxlar va uch tildagi SEO matnlari.
   Saqlangan o‘zgarish hamma uchun darhol ko‘rinadi.
4. Brauzer bildirishnomasini yoqsangiz, sayt ochiq turganda yangi bron haqida xabar chiqadi.

## Xavfsizlik
- Ma’lumotlar qoidasi Firebase konsolida (Firestore → Rules): mijoz faqat o‘z bronlarini ko‘radi,
  barcha bronlarni va sozlamalarni faqat admin ko‘radi va o‘zgartiradi.
- `index.html` dagi Firebase `apiKey` maxfiy emas: u har bir Firebase sayti kodida ochiq turadi, himoyani qoidalar beradi.

## Fayllar
- `index.html` — saytning o‘zi (dizayn, turlar ro‘yxati, narxlar, kirish oynasi).
- `img/` — suratlar (Wikimedia Commons, mualliflari sahifa pastida).
- `google-apps-script/Code.gs` — eski variant (Google jadval + Telegram); Firebase ulangani uchun hozir ishlatilmaydi.
