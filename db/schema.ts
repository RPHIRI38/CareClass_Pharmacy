import { pgTable, serial, text, integer, numeric, timestamp, date } from "drizzle-orm/pg-core";

// Staff accounts that can log into the POS system
export const users = pgTable("users", {
  id: serial().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("cashier"), // admin | cashier
  location: text("location").notNull(), // branch name, e.g. "Lusaka", "Katete Branch"
  status: text("status").notNull().default("Active"), // Active | Suspended
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory: one row per stocked batch of a product
export const inventoryItems = pgTable("inventory_items", {
  id: serial().primaryKey(),
  barcode: text("barcode").notNull().unique(),
  batchCode: text("batch_code").notNull(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  stock: integer("stock").notNull().default(0),
  expiryDate: date("expiry_date"),
  location: text("location"), // branch this batch is stocked at
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Completed sale line items (one row per product sold in a transaction)
export const sales = pgTable("sales", {
  id: serial().primaryKey(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id),
  barcode: text("barcode").notNull(),
  batchCode: text("batch_code"),
  name: text("name").notNull(),
  qty: integer("qty").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  total: numeric("total", { precision: 10, scale: 2, mode: "number" }).notNull(),
  paymentMethod: text("payment_method").notNull(), // Cash | Airtel Money | MTN MoMo | Zamtel Mobile Money | Card
  paymentReference: text("payment_reference"),
  location: text("location").notNull(),
  soldBy: integer("sold_by").references(() => users.id),
  saleDate: timestamp("sale_date").defaultNow(),
});
