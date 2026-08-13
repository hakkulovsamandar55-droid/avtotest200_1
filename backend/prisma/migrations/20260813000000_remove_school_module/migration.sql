-- AVTOMAKTAB (DRIVING SCHOOL) MODULINI BUTUNLAY OLIB TASHLASH
--
-- Butun "Haydovchilik maktablari ekotizimi" (School/Group/Membership/
-- SchoolChat/SchoolMessage/Invitation/Homework/HomeworkSubmission) mahsulotdan
-- chiqarildi. Bu migratsiya barcha shu modullarga tegishli jadvallarni,
-- enum qiymatlarini va ularga bog'liq ma'lumotlarni butunlay o'chiradi.
--
-- DIQQAT: bu QAYTARIB BO'LMAYDIGAN amal — mavjud maktab/guruh/uy vazifasi
-- ma'lumotlari butunlay yo'qoladi.

-- 1) Shu modulga tegishli, endi ma'nosiz bo'lib qolgan bildirishnoma/tarix
--    yozuvlarini tozalash (enum qiymatlarini olib tashlashdan oldin kerak).
DELETE FROM "notifications" WHERE "type" = 'SCHOOL_MESSAGE';
DELETE FROM "activity_logs" WHERE "type" IN (
  'SCHOOL_CREATED', 'SCHOOL_JOINED', 'SCHOOL_APPROVED', 'SCHOOL_DISABLED', 'SCHOOL_DELETED'
);

-- 2) NotificationType — SCHOOL_MESSAGE qiymatini olib tashlash.
--    Postgres enumdan qiymatni to'g'ridan-to'g'ri o'chirishga ruxsat
--    bermaydi, shuning uchun yangi enum yaratib, ustunni ko'chiramiz.
CREATE TYPE "NotificationType_new" AS ENUM (
  'SUPPORT_MESSAGE', 'PAYMENT_REQUEST', 'PREMIUM_EXPIRING', 'NEW_REGISTRATION'
);
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new"
  USING ("type"::text::"NotificationType_new");
DROP TYPE "NotificationType";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";

-- 3) ActivityType — SCHOOL_* qiymatlarini olib tashlash (xuddi shu usul).
CREATE TYPE "ActivityType_new" AS ENUM (
  'REGISTERED', 'TEST_COMPLETED', 'PREMIUM_GRANTED', 'PREMIUM_EXTENDED',
  'PREMIUM_EXPIRED', 'DISCOUNT_GRANTED', 'PAYMENT_SUBMITTED', 'PAYMENT_APPROVED',
  'PAYMENT_REJECTED', 'SUPPORT_MESSAGE', 'BLOCKED', 'UNBLOCKED', 'MADE_ADMIN',
  'MADE_MODERATOR', 'REMOVED_ADMIN', 'REFERRAL_JOINED', 'REFERRAL_REWARD_GIVEN'
);
ALTER TABLE "activity_logs" ALTER COLUMN "type" TYPE "ActivityType_new"
  USING ("type"::text::"ActivityType_new");
DROP TYPE "ActivityType";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";

-- 4) Jadvallarni bolalardan boshlab (FK tartibida) o'chirish.
DROP TABLE IF EXISTS "school_homework_submissions";
DROP TABLE IF EXISTS "school_homeworks";
DROP TABLE IF EXISTS "school_group_teachers";
DROP TABLE IF EXISTS "school_messages";
DROP TABLE IF EXISTS "school_chats";
DROP TABLE IF EXISTS "school_invitations";
DROP TABLE IF EXISTS "school_memberships";
DROP TABLE IF EXISTS "school_groups";
DROP TABLE IF EXISTS "schools";

-- 5) Endi hech qanday ustun ishlatmaydigan enumlarni o'chirish.
DROP TYPE IF EXISTS "HomeworkSubmissionStatus";
DROP TYPE IF EXISTS "HomeworkType";
DROP TYPE IF EXISTS "InvitationType";
DROP TYPE IF EXISTS "MembershipStatus";
DROP TYPE IF EXISTS "SchoolMemberRole";
DROP TYPE IF EXISTS "SchoolStatus";
