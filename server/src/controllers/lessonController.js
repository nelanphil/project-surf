import Lesson from "../models/Lesson.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create a new lesson booking
export const createLesson = asyncHandler(async (req, res) => {
  const { lessonPackageId, date, time, price, hours } = req.body;

  if (!lessonPackageId || !date || !time || price === undefined || hours === undefined) {
    res.status(400);
    throw new Error("Missing required fields: lessonPackageId, date, time, price, and hours");
  }

  // Validate price and hours are numbers and positive
  if (typeof price !== 'number' || price < 0) {
    res.status(400);
    throw new Error("Price must be a non-negative number");
  }

  if (typeof hours !== 'number' || hours < 0) {
    res.status(400);
    throw new Error("Hours must be a non-negative number");
  }

  // Validate date is a Saturday or Sunday
  // Parse YYYY-MM-DD as local date to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number);
  const bookingDate = new Date(year, month - 1, day);
  const dayOfWeek = bookingDate.getDay();
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    res.status(400);
    throw new Error("Lessons can only be booked on Saturdays or Sundays");
  }

  // Validate time is between 8am and 4pm
  const [timeHours, minutes] = time.split(":").map(Number);
  if (timeHours < 8 || timeHours > 15 || (timeHours === 15 && minutes > 0)) {
    res.status(400);
    throw new Error("Lessons can only be booked between 8am and 4pm");
  }

  // Check if the time slot is already booked
  const existingLesson = await Lesson.findOne({
    date: bookingDate,
    time,
    status: { $in: ["pending", "confirmed"] },
  });

  if (existingLesson) {
    res.status(409);
    throw new Error("This time slot is already booked");
  }

  const lesson = await Lesson.create({
    userId: req.user._id,
    lessonPackageId,
    date: bookingDate,
    time,
    price,
    hours,
    status: "pending",
  });

  res.status(201).json(lesson);
});

// Get lessons for a date range (for calendar display)
export const getLessons = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error("startDate and endDate query parameters are required");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400);
    throw new Error("Invalid date format");
  }

  const lessons = await Lesson.find({
    date: {
      $gte: start,
      $lte: end,
    },
    status: { $in: ["pending", "confirmed"] },
  }).populate("userId", "name email");

  res.json(lessons);
});

// Get current user's lessons
export const getUserLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ userId: req.user._id })
    .sort({ date: 1, time: 1 })
    .populate("userId", "name email");

  res.json(lessons);
});

// Get all lessons (admin only)
export const getAllLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json(lessons);
});

// Update a lesson
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  // Check if user owns the lesson
  if (lesson.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this lesson");
  }

  const { date, time, price, hours, status } = req.body;
  const updates = {};

  if (date) {
    // Parse YYYY-MM-DD as local date to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day);
    const dayOfWeek = bookingDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      res.status(400);
      throw new Error("Lessons can only be booked on Saturdays or Sundays");
    }
    updates.date = bookingDate;
  }

  if (time) {
    const [timeHours, minutes] = time.split(":").map(Number);
    if (timeHours < 8 || timeHours > 15 || (timeHours === 15 && minutes > 0)) {
      res.status(400);
      throw new Error("Lessons can only be booked between 8am and 4pm");
    }
    updates.time = time;
  }

  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      res.status(400);
      throw new Error("Price must be a non-negative number");
    }
    updates.price = price;
  }

  if (hours !== undefined) {
    if (typeof hours !== 'number' || hours < 0) {
      res.status(400);
      throw new Error("Hours must be a non-negative number");
    }
    updates.hours = hours;
  }

  if (status) {
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    updates.status = status;
  }

  // If date or time is being updated, check for conflicts
  if (updates.date || updates.time) {
    const checkDate = updates.date || lesson.date;
    const checkTime = updates.time || lesson.time;

    const existingLesson = await Lesson.findOne({
      _id: { $ne: req.params.id },
      date: checkDate,
      time: checkTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingLesson) {
      res.status(409);
      throw new Error("This time slot is already booked");
    }
  }

  const updatedLesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  ).populate("userId", "name email");

  res.json(updatedLesson);
});

// Delete a lesson
export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }

  // Check if user owns the lesson
  if (lesson.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this lesson");
  }

  await lesson.deleteOne();

  res.status(204).send();
});

