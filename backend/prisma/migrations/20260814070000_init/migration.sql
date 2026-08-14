-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "AttemptType" AS ENUM ('TICKET', 'EXAM');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SUPPORT_MESSAGE', 'PAYMENT_REQUEST', 'PREMIUM_EXPIRING', 'NEW_REGISTRATION');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('REGISTERED', 'TEST_COMPLETED', 'PREMIUM_GRANTED', 'PREMIUM_EXTENDED', 'PREMIUM_EXPIRED', 'DISCOUNT_GRANTED', 'PAYMENT_SUBMITTED', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'SUPPORT_MESSAGE', 'BLOCKED', 'UNBLOCKED', 'MADE_ADMIN', 'MADE_MODERATOR', 'REMOVED_ADMIN', 'REFERRAL_JOINED', 'REFERRAL_REWARD_GIVEN');

-- CreateEnum
CREATE TYPE "AdminLogAction" AS ENUM ('PREMIUM_GRANTED', 'PREMIUM_REMOVED', 'PREMIUM_EXTENDED', 'DISCOUNT_GRANTED', 'DISCOUNT_REMOVED', 'USER_BLOCKED', 'USER_UNBLOCKED', 'ADMIN_GRANTED', 'ADMIN_REMOVED', 'ACCOUNT_DELETED', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'SUPPORT_REPLIED', 'SUPPORT_CLOSED', 'SUPPORT_REOPENED', 'BROADCAST_SENT', 'PAYMENT_SETTINGS_UPDATED');

-- CreateEnum
CREATE TYPE "BroadcastAudience" AS ENUM ('ALL', 'PREMIUM', 'VIP', 'BLOCKED', 'SELECTED');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ExamEventType" AS ENUM ('CREATED', 'RESUMED', 'FOCUS_LOST', 'SUBMITTED', 'EXPIRED', 'ABANDONED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "premium_plan" TEXT,
    "premium_started_at" TIMESTAMP(3),
    "premium_expires_at" TIMESTAMP(3),
    "exam_readiness" INTEGER NOT NULL DEFAULT 0,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_reason" TEXT,
    "last_online_at" TIMESTAMP(3),
    "avatar_url" TEXT,
    "admin_notes" TEXT,
    "referral_code" TEXT,
    "exam_date" TIMESTAMP(3),
    "age" INTEGER,
    "daily_study_minutes" INTEGER,
    "registration_completed_at" TIMESTAMP(3),
    "referred_by_id" INTEGER,
    "show_on_leaderboard" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "AttemptType" NOT NULL,
    "ticket_number" INTEGER,
    "correct_count" INTEGER NOT NULL,
    "total_count" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "duration_sec" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "unread_for_admin" INTEGER NOT NULL DEFAULT 0,
    "unread_for_user" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "sender" "SenderType" NOT NULL,
    "text" TEXT,
    "image_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_key" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "original_amount" INTEGER NOT NULL,
    "discount_percent" INTEGER NOT NULL DEFAULT 0,
    "receipt_image_url" TEXT NOT NULL,
    "receipt_hash" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "ocr_extracted_text" TEXT,
    "ocr_extracted_amount" INTEGER,
    "ocr_extracted_card" TEXT,
    "ocr_extracted_date" TIMESTAMP(3),
    "ocr_warnings" TEXT,
    "ocr_confidence" INTEGER,
    "rejection_reason" TEXT,
    "reviewed_by_id" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" SERIAL NOT NULL,
    "actor_id" INTEGER NOT NULL,
    "action" "AdminLogAction" NOT NULL,
    "target_user_id" INTEGER,
    "target_label" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link_type" TEXT,
    "link_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broadcast_messages" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "audience" "BroadcastAudience" NOT NULL,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broadcast_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "card_number" TEXT NOT NULL,
    "card_owner" TEXT NOT NULL,
    "updated_by_id" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "exam_version" INTEGER NOT NULL DEFAULT 1,
    "question_seed" INTEGER NOT NULL,
    "question_ids" TEXT NOT NULL,
    "answers" TEXT NOT NULL DEFAULT '{}',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "duration_sec" INTEGER,
    "correct_count" INTEGER,
    "wrong_count" INTEGER,
    "accuracy_pct" INTEGER,
    "passed" BOOLEAN,
    "focus_lost_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_events" (
    "id" SERIAL NOT NULL,
    "exam_attempt_id" INTEGER NOT NULL,
    "type" "ExamEventType" NOT NULL,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_questions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_mistakes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" TEXT NOT NULL,
    "wrong_count" INTEGER NOT NULL DEFAULT 1,
    "last_wrong_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "question_mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_stats" (
    "question_id" TEXT NOT NULL,
    "total_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_stats_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "premium_plans" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "badge" TEXT NOT NULL DEFAULT '',
    "features" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_by_id" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_plans_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_by_id" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_is_premium_idx" ON "users"("is_premium");

-- CreateIndex
CREATE INDEX "users_is_blocked_idx" ON "users"("is_blocked");

-- CreateIndex
CREATE INDEX "users_referred_by_id_idx" ON "users"("referred_by_id");

-- CreateIndex
CREATE INDEX "attempts_user_id_idx" ON "attempts"("user_id");

-- CreateIndex
CREATE INDEX "attempts_user_id_created_at_idx" ON "attempts"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_user_id_key" ON "conversations"("user_id");

-- CreateIndex
CREATE INDEX "conversations_status_last_message_at_idx" ON "conversations"("status", "last_message_at");

-- CreateIndex
CREATE INDEX "support_messages_conversation_id_created_at_idx" ON "support_messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "payment_requests_status_ocr_confidence_idx" ON "payment_requests"("status", "ocr_confidence");

-- CreateIndex
CREATE INDEX "payment_requests_receipt_hash_idx" ON "payment_requests"("receipt_hash");

-- CreateIndex
CREATE INDEX "payment_requests_user_id_idx" ON "payment_requests"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_user_id_key" ON "discounts"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs"("created_at");

-- CreateIndex
CREATE INDEX "admin_logs_actor_id_idx" ON "admin_logs"("actor_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "exam_attempts_user_id_status_idx" ON "exam_attempts"("user_id", "status");

-- CreateIndex
CREATE INDEX "exam_attempts_user_id_started_at_idx" ON "exam_attempts"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "exam_attempts_status_passed_correct_count_idx" ON "exam_attempts"("status", "passed", "correct_count");

-- CreateIndex
CREATE INDEX "exam_attempts_status_finished_at_idx" ON "exam_attempts"("status", "finished_at");

-- CreateIndex
CREATE INDEX "exam_events_exam_attempt_id_created_at_idx" ON "exam_events"("exam_attempt_id", "created_at");

-- CreateIndex
CREATE INDEX "saved_questions_user_id_created_at_idx" ON "saved_questions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "saved_questions_user_id_question_id_key" ON "saved_questions"("user_id", "question_id");

-- CreateIndex
CREATE INDEX "question_mistakes_user_id_resolved_at_idx" ON "question_mistakes"("user_id", "resolved_at");

-- CreateIndex
CREATE UNIQUE INDEX "question_mistakes_user_id_question_id_key" ON "question_mistakes"("user_id", "question_id");

-- CreateIndex
CREATE INDEX "question_stats_wrong_count_idx" ON "question_stats"("wrong_count");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_exam_attempt_id_fkey" FOREIGN KEY ("exam_attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_mistakes" ADD CONSTRAINT "question_mistakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

