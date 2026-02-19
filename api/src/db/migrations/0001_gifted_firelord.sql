ALTER TABLE "debts" ADD COLUMN "start_installment" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "end_installment" integer;