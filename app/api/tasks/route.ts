import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

type JwtPayload = {
  userId: string;
};

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await connectDB();

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      { tasks },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get tasks error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to load tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, priority, dueDate } = await req.json();

    if (!title) {
      return NextResponse.json(
        { message: "Task title is required" },
        { status: 400 }
      );
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false,
      userId,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create task",
      },
      { status: 500 }
    );
  }
}