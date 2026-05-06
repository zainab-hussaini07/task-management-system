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

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load tasks" },
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = await params;

    const updateData: {
      title?: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      completed?: boolean;
      dueDate?: Date | null;
    } = {};

    if (typeof body.title === "string") {
      updateData.title = body.title.trim();
    }

    if (typeof body.description === "string") {
      updateData.description = body.description.trim();
    }

    if (
      body.priority === "low" ||
      body.priority === "medium" ||
      body.priority === "high"
    ) {
      updateData.priority = body.priority;
    }

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
    }

    if ("dueDate" in body) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update task",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete task",
      },
      { status: 500 }
    );
  }
}