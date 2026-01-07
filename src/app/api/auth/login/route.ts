import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const userWithPassword = user as typeof user & {
      password: string;
      name: string;
      surname: string;
    };

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithPassword.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: userWithPassword.id,
          name: userWithPassword.name,
          surname: userWithPassword.surname,
          email: userWithPassword.email,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Login error:", error);

    const err = error as { message?: string; code?: string; stack?: string };
    console.error("Error stack:", err?.stack);
    console.error("Error code:", err?.code);

    if (
      err?.message?.includes("Unknown arg") ||
      err?.message?.includes("Unknown column")
    ) {
      return NextResponse.json(
        { error: "Database schema mismatch. Please run: npm run db:push" },
        { status: 500 }
      );
    }

    let errorMessage = "Internal server error";
    if (process.env.NODE_ENV === "development") {
      errorMessage = err?.message || String(error);
      if (err?.code) {
        errorMessage += ` (Code: ${err.code})`;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
