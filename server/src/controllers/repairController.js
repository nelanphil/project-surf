import RepairRequest from "../models/RepairRequest.js";
import asyncHandler from "../utils/asyncHandler.js";

const REQUIRED_FIELDS = [
  "name",
  "email",
  "phone",
  "zipCode",
  "boardSize",
  "dingLocation",
  "dingSize",
  "deliveryMethod",
];

const DELIVERY_METHODS = ["dropoff", "pickup"];

const parseOptionalDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
};

export const createRepairRequest = asyncHandler(async (req, res) => {
  const payload = req.body || {};

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      res.status(400);
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!DELIVERY_METHODS.includes(payload.deliveryMethod)) {
    res.status(400);
    throw new Error("deliveryMethod must be either 'dropoff' or 'pickup'");
  }

  if (payload.deliveryMethod === "pickup" && !payload.pickupAddress) {
    res.status(400);
    throw new Error("pickupAddress is required when deliveryMethod is pickup");
  }

  const repairRequest = await RepairRequest.create({
    userId: req.user._id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    zipCode: payload.zipCode,
    boardSize: payload.boardSize,
    boardType: payload.boardType || "other",
    dingLocation: payload.dingLocation,
    dingSize: payload.dingSize,
    description: payload.description,
    deliveryMethod: payload.deliveryMethod,
    pickupAddress: payload.pickupAddress,
    pickupDate: parseOptionalDate(payload.pickupDate),
    pickupNotes: payload.pickupNotes,
    dropoffDate: parseOptionalDate(payload.dropoffDate),
  });

  res.status(201).json(repairRequest);
});

export const getUserRepairRequests = asyncHandler(async (req, res) => {
  const repairs = await RepairRequest.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(repairs);
});

export const getAllRepairRequests = asyncHandler(async (req, res) => {
  const repairs = await RepairRequest.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json(repairs);
});

const VALID_STATUSES = ["submitted", "in_progress", "completed", "cancelled", "delivered"];

export const updateRepairStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const repairRequest = await RepairRequest.findById(id);

  if (!repairRequest) {
    res.status(404);
    throw new Error("Repair request not found");
  }

  repairRequest.status = status;
  await repairRequest.save();

  const updatedRepair = await RepairRequest.findById(id).populate("userId", "name email");

  res.json(updatedRepair);
});


