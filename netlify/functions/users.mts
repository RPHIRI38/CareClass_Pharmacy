import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { hashPassword } from "../../db/password.js";

export default async (req: Request) => {
  if (req.method === "GET") {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        location: users.location,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users);
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { username, password, role, location, status } = body;
    if (!username || !password || !location) {
      return Response.json({ error: "username, password, and location are required" }, { status: 400 });
    }
    const [created] = await db
      .insert(users)
      .values({
        username,
        passwordHash: hashPassword(password),
        role: role || "cashier",
        location,
        status: status || "Active",
      })
      .returning({ id: users.id, username: users.username, role: users.role, location: users.location, status: users.status });
    return Response.json(created, { status: 201 });
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const { id, password, ...fields } = body;
    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }
    const updates: Record<string, unknown> = { ...fields };
    if (password) updates.passwordHash = hashPassword(password);
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({ id: users.id, username: users.username, role: users.role, location: users.location, status: users.status });
    if (!updated) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(updated);
  }

  if (req.method === "DELETE") {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });
    await db.delete(users).where(eq(users.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/users",
};
