# Ufq — O‘zbekiston bo‘ylab ichki turlar

Tur agentlik sayti: turlar, narxlar, oy bo‘yicha havo va onlayn bron. GitHub Pages’da ishlaydi.
Bronlar Google jadvalga yoziladi va Telegram’ingizga xabar bo‘lib keladi.

## Bronlarni ulash (bir marta, ~10 daqiqa)

### 1. Google jadval va skript
1. [sheets.new](https://sheets.new) da yangi jadval oching, nomini masalan “Ufq bronlar” qo‘ying.
2. **Kengaytmalar → Apps Script** ni oching.
3. `Code.gs` ichidagi hamma narsani o‘chirib, shu repodagi `google-apps-script/Code.gs` faylini to‘liq joylang. Saqlang.
4. Yuqoridagi ro‘yxatdan `setup` ni tanlab, **Ishga tushirish** ni bosing. Google ruxsat so‘raydi, o‘z hisobingiz bilan ruxsat bering.
   Jadvalda “Bronlar” va “Narxlar” varaqlari paydo bo‘ladi.

### 2. Telegram xabarlari
1. Telegram’da **@BotFather** ga `/newbot` yozing, botga nom bering va berilgan **tokenni** nusxalang.
2. Skriptdagi `TELEGRAM_TOKEN = ''` qatoriga tokenni qo‘ying, saqlang.
3. O‘z botingizni oching va unga `/start` yozing.
4. Skriptda `getChatId` ni ishga tushiring. **Ijro jurnali** da `TELEGRAM_CHAT_ID = 123456789` kabi raqam chiqadi.
   Shu raqamni `TELEGRAM_CHAT_ID = ''` qatoriga qo‘ying, saqlang.
5. `testTelegram` ni ishga tushiring: botdan sinov xabari kelishi kerak.

Token faqat Google skriptida turadi. U saytga ham, GitHub’ga ham chiqmaydi.

### 3. Veb-ilova sifatida joylash
1. **Joylash → Yangi joylash** (Deploy → New deployment), turi: **Veb-ilova**.
2. “Kim nomidan ishlaydi”: **Men**. “Kimga ruxsat”: **Hamma** (Anyone).
3. **Joylash** ni bosing va chiqqan `https://script.google.com/macros/s/.../exec` manzilini nusxalang.
4. Shu manzilni Claude’ga yuboring: u saytga ulab, GitHub’ga qayta joylaydi.

Skript kodini keyin o‘zgartirsangiz: **Joylash → Joylashlarni boshqarish → Tahrirlash → Yangi versiya**. Manzil o‘zgarmaydi.

## Kundalik ish
- **Yangi bron** Telegram’ga keladi va “Bronlar” varag‘ida “Yangi” holatida turadi.
- Mijozga qo‘ng‘iroq qilgach, **Holat** ustunida “Tasdiqlandi” yoki “Bekor qilindi” ni tanlang.
  Mijoz buni saytdagi “Bronlarim” bo‘limida ko‘radi.
- **Narxlar** varag‘ida narx, tunlar soni va “Saytda” belgisini o‘zgartirsangiz, sayt ularni o‘zi oladi.

## Fayllar
- `index.html` — saytning o‘zi (dizayn, turlar ro‘yxati, narxlar).
- `img/` — suratlar (Wikimedia Commons, mualliflari sahifa pastida).
- `google-apps-script/Code.gs` — bronlar uchun Google skripti.
