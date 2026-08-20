import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { inventoryItems, sales } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method === "GET") {
    const params = new URL(req.url).searchParams;
    const location = params.get("location");
    const rows = location
      ? await db.select().from(sales).where(eq(sales.location, location))
      : await db.select().from(sales);
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { items, paymentMethod, paymentReference, location, soldBy } = body;

    if (!Array.isArray(items) || items.length === 0 || !paymentMethod || !location) {
      return Response.json({ error: "items, paymentMethod, and location are required" }, { status: 400 });
    }

    const created = await db.transaction(async (tx) => {
      const rows = [];
      for (const item of items) {
        const { barcode, qty } = item;
        const [invItem] = await tx.select().from(inventoryItems).where(eq(inventoryItems.barcode, barcode));
        if (!invItem) throw new Error(`Unknown barcode: ${barcode}`);
        if (invItem.stock < qty) throw new Error(`Insufficient stock for ${invItem.name}`);

        await tx
          .update(inventoryItems)
          .set({ stock: invItem.stock - qty, updatedAt: new Date() })
          .where(eq(inventoryItems.id, invItem.id));

        const [sale] = await tx
          .insert(sales)
          .values({
            inventoryItemId: invItem.id,
            barcode: invItem.barcode,
            batchCode: invItem.batchCode,
            name: invItem.name,
            qty,
            unitPrice: invItem.price,
            total: invItem.price * qty,
            paymentMethod,
            paymentReference,
            location,
            soldBy,
          })
          .returning();
        rows.push(sale);
      }
      return rows;
    });

    return Response.json(created, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/sales",
};
