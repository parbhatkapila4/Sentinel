import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export function getSessionFromRequest(
  request: NextRequest
): SessionPayload | null {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}
