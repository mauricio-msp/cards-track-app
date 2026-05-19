CREATE TABLE "member_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"card_id" text NOT NULL,
	"target_month" integer NOT NULL,
	"target_year" integer NOT NULL,
	"amount" integer NOT NULL,
	"paid_at" timestamp NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "debts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "debts" CASCADE;--> statement-breakpoint
ALTER TABLE "installments" DROP CONSTRAINT "installments_debt_id_debts_id_fk";
--> statement-breakpoint
DROP INDEX "installments_debt_id_idx";--> statement-breakpoint
ALTER TABLE "member_payments" ADD CONSTRAINT "member_payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_payments" ADD CONSTRAINT "member_payments_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mp_member_card_period_idx" ON "member_payments" USING btree ("member_id","card_id","target_month","target_year");--> statement-breakpoint
ALTER TABLE "installments" DROP COLUMN "debt_id";