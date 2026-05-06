"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type Priority = "low" | "medium" | "high";
type Filter = "all" | "pending" | "completed";

type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: Priority | string;
  dueDate?: string | null;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function getTaskList(data: unknown): Task[] {
  if (Array.isArray(data)) {
    return data as Task[];
  }

  if (typeof data === "object" && data !== null && "tasks" in data) {
    const tasks = (data as { tasks?: unknown }).tasks;

    if (Array.isArray(tasks)) {
      return tasks as Task[];
    }
  }

  return [];
}

async function readJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function isTaskOverdue(task: Task) {
  if (!task.dueDate || task.completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  async function fetchTasks() {
    setError("");

    const res = await fetch("/api/tasks");
    const data = await readJsonResponse(res);

    if (!res.ok) {
      setError(getErrorMessage(data, "Failed to load tasks"));
      return;
    }

    setTasks(getTaskList(data));
  }
function formatDateForInput(date?: string | null) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
}

function resetForm() {
  setTitle("");
  setDescription("");
  setPriority("medium");
  setDueDate("");
  setEditingTaskId(null);
}

function startEdit(task: Task) {
  setEditingTaskId(task._id);
  setTitle(task.title);
  setDescription(task.description || "");
  setPriority((task.priority as "low" | "medium" | "high") || "medium");
  setDueDate(formatDateForInput(task.dueDate));

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
  async function createTask(e: React.FormEvent) {
  e.preventDefault();
  setError("");

  if (!title.trim()) {
    setError("Task title is required");
    return;
  }

  const url = editingTaskId
    ? `/api/tasks/${editingTaskId}`
    : "/api/tasks";

  const method = editingTaskId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      priority,
      dueDate: dueDate || null,
    }),
  });

  const text = await res.text();

  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    setError(
      data.message ||
        (editingTaskId ? "Failed to update task" : "Failed to create task")
    );
    return;
  }

  resetForm();

  await fetchTasks();
}

  async function toggleTask(task: Task) {
    setError("");

    const res = await fetch(`/api/tasks/${task._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !task.completed,
      }),
    });

    const data = await readJsonResponse(res);

    if (!res.ok) {
      setError(getErrorMessage(data, "Failed to update task"));
      return;
    }

    await fetchTasks();
  }

  async function deleteTask(id: string) {
    setError("");

    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    const data = await readJsonResponse(res);

    if (!res.ok) {
      setError(getErrorMessage(data, "Failed to delete task"));
      return;
    }

    await fetchTasks();
  }
  const filteredTasks = tasks.filter((task) => {
  if (filter === "completed") return task.completed;
  if (filter === "pending") return !task.completed;
  return true;
});

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6">
    <div className="mx-auto max-w-4xl">
    <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
        <form
          onSubmit={createTask}
            className="mb-6 rounded-2xl bg-white p-4 shadow sm:p-6"        >
        <h2 className="mb-4 text-xl font-semibold">
         {editingTaskId ? "Edit Task" : "Create Task"}
        </h2>
          {error && <p className="mb-4 text-red-600">{error}</p>}

          <input
            className="mb-3 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="mb-3 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="mb-3 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

      <div className="flex flex-col gap-2 sm:flex-row">
  <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
    {editingTaskId ? "Save Changes" : "Add Task"}
  </button>

  {editingTaskId && (
    <button
      type="button"
      onClick={resetForm}
      className="rounded-lg bg-gray-500 px-4 py-2 font-medium text-white hover:bg-gray-600"
    >
      Cancel
    </button>
  )}
</div>
        </form>
<div className="mb-4 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => setFilter("all")}
   className={`rounded-lg px-4 py-2 font-medium ${
  filter === "all"
    ? "bg-blue-600 text-white"
    : "bg-white text-gray-700 shadow hover:bg-gray-50"
}`}
  >
    All
  </button>

  <button
    type="button"
    onClick={() => setFilter("pending")}
   className={`rounded-lg px-4 py-2 font-medium ${
  filter === "all"
    ? "bg-blue-600 text-white"
    : "bg-white text-gray-700 shadow hover:bg-gray-50"
}`}
  >
    Pending
  </button>

  <button
    type="button"
    onClick={() => setFilter("completed")}
   className={`rounded-lg px-4 py-2 font-medium ${
  filter === "all"
    ? "bg-blue-600 text-white"
    : "bg-white text-gray-700 shadow hover:bg-gray-50"
}`}
  >
    Completed
  </button>
</div>
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-gray-600 shadow">
              No tasks yet.
            </p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-4 shadow sm:flex-row sm:items-center"              >
                <div className="min-w-0">
                  <h3
                   className={`break-words font-semibold text-gray-900 ${
                     task.completed ? "text-gray-400 line-through" : ""
                    }`}>
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-gray-600">{task.description}</p>
                  )}

                  <p className="mt-1 text-sm">
                    Priority:{" "}
                    <span className="font-medium capitalize">
                      {task.priority || "medium"}
                    </span>
                  </p>

                  {task.dueDate && (
                    <p className="mt-1 text-sm text-gray-600">
                      Due: {new Date(task.dueDate).toLocaleDateString()}

                      {isTaskOverdue(task) && (
                        <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Overdue
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
  <button
  onClick={() => startEdit(task)}
  className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-600 sm:flex-none"
>
  Edit
</button>

  <button
  onClick={() => toggleTask(task)}
  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700 sm:flex-none"
>
  {task.completed ? "Undo" : "Done"}
</button>

  <button
  onClick={() => deleteTask(task._id)}
  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 sm:flex-none"
>
  Delete
</button>
</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}