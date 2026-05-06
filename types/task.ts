export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};