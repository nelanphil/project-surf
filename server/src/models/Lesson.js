import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonPackageId: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by date and time
lessonSchema.index({ date: 1, time: 1 });
lessonSchema.index({ userId: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;

