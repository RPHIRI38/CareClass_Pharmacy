import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { inventoryItems } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method === "GET") {
    const barcode = new URL(req.url).searchParams.get("barcode");
    if (barcode) {
      const rows = await db.select().from(inventoryItems).where(eq(inventoryItems.barcode, barcode));
      return Response.json(rows[0] || null);
    }
    const rows = await db.select().from(inventoryItems);
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { barcode, batchCode, name, price, stock, expiryDate, location } = body;
    if (!barcode || !batchCode || !name || price == null) {
      return Response.json({ error: "barcode, batchCode, name, and price are required" }, { status: 400 });
    }
    const [created] = await db
      .insert(inventoryItems)
      .values({ barcode, batchCode, name, price, stock: stock ?? 0, expiryDate, location })
      .returning();
    return Response.json(created, { status: 201 });
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });
    const [updated] = await db
      .update(inventoryItems)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    if (!updated) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(updated);
  }

  if (req.method === "DELETE") {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/inventory",
};
