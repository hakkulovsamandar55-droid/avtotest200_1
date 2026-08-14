# Migratsiyalar haqida eslatma

## Holat (2026-08-14 dan boshlab)

Eski tarixiy migratsiyalar (`20260722000000_official_exam` va undan keyingilari)
`users` jadvali allaqachon mavjud deb taxmin qilar edi — chunki loyiha ilgari
`prisma db push` bilan boshlangan va sxema jadvallarini yaratuvchi asl
migratsiya hech qachon fayl sifatida saqlanmagan edi. Natijada **bo'sh
bazada** (yangi server, yangi Neon loyihasi) `npx prisma migrate deploy`
xato bilan to'xtar edi: `column "users" does not exist` / shunga o'xshash.

Bu muammo hal qilindi: barcha eski migratsiyalar bitta yagona **baseline**
migratsiyaga (`20260814070000_init`) birlashtirildi — u `schema.prisma`
faylidagi joriy holatni noldan (bo'sh bazadan) to'liq yaratadi. Tekshirildi:
mahalliy PostgreSQL'da bo'sh bazaga qo'llanganda `prisma migrate diff`
"farq yo'q" (no drift) deb tasdiqladi.

## Yangi server o'rnatishda (bo'sh baza)

Boshqa hech narsa kerak emas — shunchaki:

```bash
npx prisma migrate deploy
```

## Agar sizda ESKI, allaqachon ma'lumot bor baza bo'lsa

Bu holat kamdan-kam (masalan, `20260814070000_init`dan OLDIN allaqachon
production'da ishlatilgan Neon bazasi bo'lsa). Bunday holatda:

1. Avval zaxira nusxa oling: `pg_dump $DATABASE_URL > backup-$(date +%F).sql`
2. Baseline'ni "allaqachon qo'llangan" deb belgilang (jadvallarni qayta
   yaratishga urinmasin):
   ```bash
   npx prisma migrate resolve --applied 20260814070000_init
   ```
3. Keyingi safar `npx prisma migrate deploy` faqat shu sanadan keyingi
   yangi migratsiyalarni qo'llaydi.

## Bundan keyin

Sxemani o'zgartirganda:

```bash
npx prisma migrate dev --name nima-ozgardi
```

Hosil bo'lgan faylni git'ga qo'shing. Production'da `migrate deploy` shuni
qo'llaydi. `db push` ni **production'da hech qachon ishlatmang** — u ustunlarni
ogohlantirmasdan o'chirib yuborishi mumkin.
