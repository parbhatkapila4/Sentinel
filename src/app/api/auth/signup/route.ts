import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, surname, email, password, confirmPassword } = body;

    if (!name || !surname || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: Record<string, unknown> = {
      name,
      surname,
      email,
      password: hashedPassword,
    };

    const user = (await prisma.user.create({
      data: userData as Parameters<typeof prisma.user.create>[0]["data"],
    })) as {
      id: string;
      name: string;
      surname: string;
      email: string;
      createdAt: Date;
    };

    await createSession({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);

    const err = error as { message?: string; code?: string; stack?: string };
    console.error("Error stack:", err?.stack);
    console.error("Error code:", err?.code);

    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

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
