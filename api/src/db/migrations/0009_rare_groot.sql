CREATE TABLE "member_coverages" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"card_id" text NOT NULL,
	"target_month" integer NOT NULL,
	"target_year" integer NOT NULL,
	"amount" integer NOT NULL,
	"covered_at" timestamp NOT NULL,
	"description" text,
	"amount_repaid" integer DEFAULT 0 NOT NULL,
	"settled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_coverages" ADD CONSTRAINT "member_coverages_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_coverages" ADD CONSTRAINT "member_coverages_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mc_member_card_period_idx" ON "member_coverages" USING btree ("member_id","card_id","target_month","target_year");