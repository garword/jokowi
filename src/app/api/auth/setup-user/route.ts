import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Create new user if it doesn't exist
    const existingUser = await db.users.findUnique({
      where: { username: "windaa" }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "User windaa already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("cantik", 10);

    // Create new user
    const user = await db.users.create({
      data: {
        username: "windaa",
        password: hashedPassword,
        email: "windaa@q0083aacahe1-d.space.z.ai",
        name: "Windaa User",
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "User windaa created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}