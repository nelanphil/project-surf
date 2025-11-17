import mongoose from "mongoose";

const repairRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    boardSize: {
      type: String,
      required: true,
      trim: true,
    },
    boardType: {
      type: String,
      default: "other",
      trim: true,
    },
    dingLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dingSize: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deliveryMethod: {
      type: String,
      enum: ["dropoff", "pickup"],
      required: true,
    },
    pickupAddress: {
      type: String,
      trim: true,
    },
    pickupDate: {
      type: Date,
    },
    pickupNotes: {
      type: String,
      trim: true,
    },
    dropoffDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["submitted", "in_progress", "completed", "cancelled", "delivered"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

repairRequestSchema.index({ userId: 1, createdAt: -1 });

const RepairRequest = mongoose.model("RepairRequest", repairRequestSchema);

export default RepairRequest;
