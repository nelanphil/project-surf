import React, {
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Lesson, getLessonsForDateRange, createBooking } from '../services/lessonService';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { getLessonPackageById } from '../services/lessonPackages';

interface BookingCalendarProps {
  lessonPackageId: number;
  onBookingSuccess?: () => void;
  onSelectionChange?: (hasSelections: boolean) => void;
}

export interface BookingCalendarRef {
  handleNext: () => void;
}

export const BookingCalendar = forwardRef<BookingCalendarRef, BookingCalendarProps>(
  ({ lessonPackageId, onBookingSuccess, onSelectionChange }, ref) => {
    const { user } = useAuthStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<Array<{ date: Date; time: string }>>([]);
    const [booking, setBooking] = useState(false);
    const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1 = selection, 2 = confirmation
    const onSelectionChangeRef = useRef(onSelectionChange);

    // Generate time slots from 8am to 4pm (hourly)
    const timeSlots = useMemo(() => {
      const slots: string[] = [];
      for (let hour = 8; hour <= 15; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      return slots;
    }, []);

    // Get all weekends (Saturdays and Sundays) for the current month
    const weekends = useMemo(() => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const weekends: Date[] = [];

      // Get today's date normalized to start of day for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Get first and last day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Iterate through all days in the month
      for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();

        // Saturday = 6, Sunday = 0
        if (dayOfWeek === 6 || dayOfWeek === 0) {
          // Normalize date to start of day for comparison
          const dateNormalized = new Date(date);
          dateNormalized.setHours(0, 0, 0, 0);
          const dateStr = dateNormalized.toISOString().split('T')[0];

          // Only include dates from today onwards
          if (dateStr >= todayStr) {
            weekends.push(date);
          }
        }
      }

      return weekends;
    }, [currentMonth]);

    // Get start and end dates for API query (first and last day of month)
    const dateRange = useMemo(() => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // Set to start and end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      };
    }, [currentMonth]);

    // Fetch lessons for the current month
    useEffect(() => {
      const fetchLessons = async () => {
        setLoading(true);
        try {
          const data = await getLessonsForDateRange(dateRange.start, dateRange.end);
          setLessons(data);
        } catch (error) {
          console.error('Failed to fetch lessons:', error);
          toast.error('Failed to load bookings');
        } finally {
          setLoading(false);
        }
      };

      fetchLessons();
    }, [dateRange.start, dateRange.end]);

    // Check if a time slot is booked
    const isTimeSlotBooked = (date: Date, time: string): boolean => {
      const dateStr = date.toISOString().split('T')[0];
      return lessons.some(
        (lesson) =>
          lesson.date.split('T')[0] === dateStr &&
          lesson.time === time &&
          (lesson.status === 'pending' || lesson.status === 'confirmed'),
      );
    };

    // Get booking for a specific date and time
    const getBookingForSlot = (date: Date, time: string): Lesson | undefined => {
      const dateStr = date.toISOString().split('T')[0];
      return lessons.find(
        (lesson) =>
          lesson.date.split('T')[0] === dateStr &&
          lesson.time === time &&
          (lesson.status === 'pending' || lesson.status === 'confirmed'),
      );
    };

    // Handle time slot click - toggle selection
    const handleTimeSlotClick = (date: Date, time: string) => {
      if (isTimeSlotBooked(date, time)) {
        const booking = getBookingForSlot(date, time);
        if (booking) {
          const userName =
            typeof booking.userId === 'object' && booking.userId?.name
              ? booking.userId.name
              : 'someone';
          toast.info(`This slot is already booked by ${userName}`);
        }
        return;
      }

      const slotKey = `${date.toISOString().split('T')[0]}_${time}`;
      setSelectedSlots((prev) => {
        const existingIndex = prev.findIndex(
          (slot) => `${slot.date.toISOString().split('T')[0]}_${slot.time}` === slotKey,
        );

        let newSlots;
        if (existingIndex >= 0) {
          // Remove if already selected
          newSlots = prev.filter((_, index) => index !== existingIndex);
          console.log('Removing slot, new length:', newSlots.length);
        } else {
          // Add if not selected
          newSlots = [...prev, { date, time }];
          console.log('Adding slot, new length:', newSlots.length);
        }
        return newSlots;
      });
    };

    // Check if a slot is selected
    const isSlotSelected = (date: Date, time: string): boolean => {
      const slotKey = `${date.toISOString().split('T')[0]}_${time}`;
      return selectedSlots.some(
        (slot) => `${slot.date.toISOString().split('T')[0]}_${slot.time}` === slotKey,
      );
    };

    // Handle booking submission - create multiple bookings
    const handleBooking = async () => {
      if (selectedSlots.length === 0 || !user) {
        return;
      }

      // Look up the lesson package to get the price
      const lessonPackage = getLessonPackageById(lessonPackageId);
      if (!lessonPackage) {
        toast.error('Invalid lesson package selected');
        return;
      }

      setBooking(true);
      try {
        // Create all bookings in parallel
        // Each booking is 1 hour long, with price from the lesson package
        const bookingPromises = selectedSlots.map((slot) =>
          createBooking({
            lessonPackageId,
            date: formatDateForAPI(slot.date),
            time: slot.time,
            price: lessonPackage.price,
            hours: 1, // All sessions are 1 hour long
          }),
        );

        await Promise.all(bookingPromises);

        toast.success(
          `Successfully booked ${selectedSlots.length} lesson${selectedSlots.length > 1 ? 's' : ''}!`,
        );

        // Refresh lessons
        const data = await getLessonsForDateRange(dateRange.start, dateRange.end);
        setLessons(data);

        // Reset selection and go back to step 1
        setSelectedSlots([]);
        setCurrentStep(1);

        if (onBookingSuccess) {
          onBookingSuccess();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to book lessons';
        toast.error(errorMessage);
      } finally {
        setBooking(false);
      }
    };

    // Check if currentMonth is the current month (or earlier)
    const isCurrentMonthOrEarlier = useMemo(() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthNum = now.getMonth();
      const viewingYear = currentMonth.getFullYear();
      const viewingMonth = currentMonth.getMonth();

      // Check if viewing month/year is before or equal to current month/year
      return (
        viewingYear < currentYear ||
        (viewingYear === currentYear && viewingMonth <= currentMonthNum)
      );
    }, [currentMonth]);

    // Navigate to previous month
    const goToPreviousMonth = () => {
      // Prevent navigation if already at or before current month
      if (isCurrentMonthOrEarlier) {
        return;
      }
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      setSelectedSlots([]);
    };

    // Navigate to next month
    const goToNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      setSelectedSlots([]);
    };

    // Format date for display
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    };

    // Format month/year for display
    const formatMonthYear = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    };

    // Format date for API (YYYY-MM-DD in local time, no timezone conversion)
    const formatDateForAPI = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Group weekends by week (Saturday-Sunday pairs)
    const weekendGroups = useMemo(() => {
      const groups: { saturday: Date; sunday: Date | null }[] = [];
      const processed = new Set<string>();

      for (const date of weekends) {
        const dateKey = date.toISOString().split('T')[0];
        if (processed.has(dateKey)) continue;

        const dayOfWeek = date.getDay();

        if (dayOfWeek === 6) {
          // Saturday - check if next day is Sunday
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayKey = nextDay.toISOString().split('T')[0];

          if (nextDay.getMonth() === currentMonth.getMonth() && nextDay.getDay() === 0) {
            groups.push({ saturday: date, sunday: nextDay });
            processed.add(dateKey);
            processed.add(nextDayKey);
          } else {
            groups.push({ saturday: date, sunday: null });
            processed.add(dateKey);
          }
        } else if (dayOfWeek === 0) {
          // Sunday - check if previous day was Saturday
          const prevDay = new Date(date);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevDayKey = prevDay.toISOString().split('T')[0];

          if (prevDay.getMonth() === currentMonth.getMonth() && prevDay.getDay() === 6) {
            // Check if Saturday was already processed
            if (!processed.has(prevDayKey)) {
              groups.push({ saturday: prevDay, sunday: date });
              processed.add(prevDayKey);
              processed.add(dateKey);
            }
          } else {
            // Standalone Sunday (first day of month) - only show if Saturday is in same month
            if (prevDay.getMonth() === currentMonth.getMonth()) {
              groups.push({ saturday: prevDay, sunday: date });
              processed.add(dateKey);
            } else {
              // Sunday is first day of month, no Saturday to pair with - show as standalone Sunday
              groups.push({ saturday: new Date(0), sunday: date }); // Use invalid date for saturday to indicate standalone
              processed.add(dateKey);
            }
          }
        }
      }

      return groups;
    }, [weekends, currentMonth]);

    // Get lesson package for price display
    const lessonPackage = useMemo(() => getLessonPackageById(lessonPackageId), [lessonPackageId]);

    // Calculate total price
    const totalPrice = useMemo(() => {
      if (!lessonPackage) return 0;
      return lessonPackage.price * selectedSlots.length;
    }, [lessonPackage, selectedSlots.length]);

    // Keep ref updated
    useEffect(() => {
      onSelectionChangeRef.current = onSelectionChange;
    }, [onSelectionChange]);

    // Notify parent when selections change
    useEffect(() => {
      const hasSelections = selectedSlots.length > 0;
      console.log('[BookingCalendar] Selection changed:', {
        selectedSlotsCount: selectedSlots.length,
        hasSelections,
        callbackExists: !!onSelectionChangeRef.current,
      });
      onSelectionChangeRef.current?.(hasSelections);
    }, [selectedSlots]);

    // Handle Next button click
    const handleNext = () => {
      if (selectedSlots.length > 0) {
        setCurrentStep(2);
      }
    };

    // Expose handleNext to parent via ref
    useImperativeHandle(ref, () => ({
      handleNext,
    }));

    // Handle Back button click
    const handleBack = () => {
      setCurrentStep(1);
    };

    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          {currentStep === 2 ? (
            <Button variant="outline" onClick={handleBack} disabled={booking}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
              disabled={isCurrentMonthOrEarlier}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold">
              {currentStep === 1 ? formatMonthYear(currentMonth) : 'Confirm Bookings'}
            </h2>
          </div>

          {currentStep === 1 ? (
            <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="w-[73px]"></div> // Spacer to maintain layout
          )}
        </div>

        {currentStep === 2 ? (
          // Confirmation Step
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>
                Confirm Booking{selectedSlots.length > 1 ? 's' : ''} ({selectedSlots.length})
              </CardTitle>
              {lessonPackage && (
                <p className="text-sm text-slate-600 mt-2">
                  {lessonPackage.title} - {lessonPackage.level}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {selectedSlots.map((slot, index) => (
                    <div
                      key={`${slot.date.toISOString()}_${slot.time}_${index}`}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{formatDate(slot.date)}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                      {lessonPackage && (
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-blue-600">
                            ${lessonPackage.price}
                          </p>
                          <p className="text-xs text-slate-500">1 hour</p>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const slotKey = `${slot.date.toISOString().split('T')[0]}_${slot.time}`;
                          setSelectedSlots((prev) => {
                            const remainingSlots = prev.filter(
                              (s) => `${s.date.toISOString().split('T')[0]}_${s.time}` !== slotKey,
                            );
                            // If no slots left, go back to step 1
                            if (remainingSlots.length === 0) {
                              setCurrentStep(1);
                            }
                            return remainingSlots;
                          });
                        }}
                        disabled={booking}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Lessons:</span>
                    <span className="font-medium">{selectedSlots.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Price per Lesson:</span>
                    {lessonPackage && <span className="font-medium">${lessonPackage.price}</span>}
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                    <span>Total Price:</span>
                    <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleBooking} disabled={booking} className="flex-1">
                    {booking
                      ? 'Booking...'
                      : `Confirm ${selectedSlots.length} Booking${selectedSlots.length > 1 ? 's' : ''}`}
                  </Button>
                  <Button variant="outline" onClick={handleBack} disabled={booking}>
                    Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-8">Loading bookings...</div>
        ) : weekends.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No weekends available in this month</div>
        ) : (
          <div className="space-y-6">
            {weekendGroups.map((group, groupIndex) => {
              const hasSaturday = group.saturday && group.saturday.getTime() > 0;
              const hasSunday = group.sunday !== null;

              return (
                <div key={groupIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Saturday */}
                  {hasSaturday && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{formatDate(group.saturday)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.map((time) => {
                            const isBooked = isTimeSlotBooked(group.saturday, time);
                            const isSelected = isSlotSelected(group.saturday, time);
                            const booking = getBookingForSlot(group.saturday, time);

                            return (
                              <Button
                                key={time}
                                variant={isBooked ? 'secondary' : 'outline'}
                                className={`h-12 ${
                                  isBooked
                                    ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 hover:bg-slate-300'
                                    : isSelected
                                      ? 'bg-blue-100 border-blue-400 border-2 text-blue-700 hover:bg-blue-200 opacity-80'
                                      : 'hover:bg-blue-100'
                                }`}
                                disabled={isBooked}
                                onClick={() => handleTimeSlotClick(group.saturday, time)}
                              >
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`text-xs font-medium ${isSelected ? 'text-blue-700' : ''}`}
                                  >
                                    {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                  {isBooked && booking && (
                                    <Badge variant="destructive" className="text-xs mt-1">
                                      Booked
                                    </Badge>
                                  )}
                                  {isSelected && !isBooked && (
                                    <Badge
                                      variant="default"
                                      className="text-xs mt-1 bg-blue-600 text-white"
                                    >
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sunday */}
                  {hasSunday && group.sunday && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{formatDate(group.sunday)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.map((time) => {
                            const isBooked = isTimeSlotBooked(group.sunday!, time);
                            const isSelected = isSlotSelected(group.sunday!, time);
                            const booking = getBookingForSlot(group.sunday!, time);

                            return (
                              <Button
                                key={time}
                                variant={isBooked ? 'secondary' : 'outline'}
                                className={`h-12 ${
                                  isBooked
                                    ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 hover:bg-slate-300'
                                    : isSelected
                                      ? 'bg-blue-100 border-blue-400 border-2 text-blue-700 hover:bg-blue-200 opacity-80'
                                      : 'hover:bg-blue-100'
                                }`}
                                disabled={isBooked}
                                onClick={() => handleTimeSlotClick(group.sunday!, time)}
                              >
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`text-xs font-medium ${isSelected ? 'text-blue-700' : ''}`}
                                  >
                                    {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                  {isBooked && booking && (
                                    <Badge variant="destructive" className="text-xs mt-1">
                                      Booked
                                    </Badge>
                                  )}
                                  {isSelected && !isBooked && (
                                    <Badge
                                      variant="default"
                                      className="text-xs mt-1 bg-blue-600 text-white"
                                    >
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
