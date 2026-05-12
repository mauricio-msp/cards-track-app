CREATE TABLE "purchase_members" (
	"id" text PRIMARY KEY NOT NULL,
	"purchase_id" text NOT NULL,
	"member_id" text NOT NULL,
	"amount" integer NOT NULL,
	"installment_amount" integer NOT NULL,
	"start_installment" integer DEFAULT 1 NOT NULL,
	"end_installment" integer,
	"anticipated_at" timestamp,
	"anticipate_from_installment" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"card_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"subscription_id" text,
	"description" text NOT NULL,
	"category" text,
	"purchase_date" date NOT NULL,
	"installments_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "installments" ADD COLUMN "purchase_member_id" text;--> statement-breakpoint
ALTER TABLE "purchase_members" ADD CONSTRAINT "purchase_members_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_members" ADD CONSTRAINT "purchase_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pm_purchase_id_idx" ON "purchase_members" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "pm_member_id_idx" ON "purchase_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "purchases_card_id_idx" ON "purchases" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "purchases_invoice_id_idx" ON "purchases" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "purchases_subscription_id_idx" ON "purchases" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "cards_owner_user_id_idx" ON "cards" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "debts_group_id_idx" ON "debts" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "debts_card_id_idx" ON "debts" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "debts_member_id_idx" ON "debts" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "debts_invoice_id_idx" ON "debts" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "installments_debt_id_idx" ON "installments" USING btree ("debt_id");--> statement-breakpoint
CREATE INDEX "installments_invoice_id_idx" ON "installments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "installments_paid_at_idx" ON "installments" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "invoices_card_id_idx" ON "invoices" USING btree ("card_id");