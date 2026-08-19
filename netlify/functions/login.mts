import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { verifyPassword } from "../../db/password.js";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { username, password, location } = await req.json();
  if (!username || !password) {
    return Response.json({ error: "username and password are required" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.username, username));

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  if (user.status === "Suspended") {
    return Response.json({ error: "Account suspended! Please contact the administrator." }, { status: 403 });
  }

  return Response.json({
    id: user.id,
    username: user.username,
    role: user.role,
    location: location || user.location,
  });
};

export const config: Config = {
  path: "/api/login",
};
