CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY,
	"barcode" text NOT NULL UNIQUE,
	"batch_code" text NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"expiry_date" date,
	"location" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY,
	"inventory_item_id" integer,
	"barcode" text NOT NULL,
	"batch_code" text,
	"name" text NOT NULL,
	"qty" integer NOT NULL,
	"unit_price" numeric(10,2) NOT NULL,
	"total" numeric(10,2) NOT NULL,
	"payment_method" text NOT NULL,
	"payment_reference" text,
	"location" text NOT NULL,
	"sold_by" integer,
	"sale_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'cashier' NOT NULL,
	"location" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_inventory_item_id_inventory_items_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id");--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_sold_by_users_id_fkey" FOREIGN KEY ("sold_by") REFERENCES "users"("id");