import mongoose, { Schema, models } from "mongoose";

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
        default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
    type: Date,
    default: null,
},
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
  },
  { timestamps: true }
);

const Task = models.Task || mongoose.model("Task", TaskSchema);

export default Task;