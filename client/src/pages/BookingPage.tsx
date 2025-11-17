import React, { useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookingCalendar, BookingCalendarRef } from '../components/BookingCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hasSelections, setHasSelections] = useState(false);
  const bookingCalendarRef = useRef<BookingCalendarRef>(null);

  // Memoize the callback to avoid recreation
  const handleSelectionChange = useCallback((hasSelections: boolean) => {
    console.log('[BookingPage] handleSelectionChange called with:', hasSelections);
    setHasSelections(hasSelections);
  }, []);

  // Debug: log when hasSelections changes
  console.log('[BookingPage] Render - hasSelections:', hasSelections);

  // Get lesson package ID from URL parameter, default to 1
  const lessonPackageId = parseInt(searchParams.get('packageId') || '1', 10);

  const handleBookingSuccess = () => {
    // Optionally navigate or show success message
    navigate('/lessons');
  };

  const handleNext = () => {
    if (bookingCalendarRef.current) {
      bookingCalendarRef.current.handleNext();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/lessons')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
            <div className="flex items-center gap-2">
              {hasSelections ? (
                <>
                  {/* <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    style={{
                      display: 'inline-flex',
                      visibility: 'visible',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Next (Plain)
                  </button> */}
                  <Button
                    onClick={handleNext}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '80px', height: '36px' }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <div className="text-gray-500">No selections yet</div>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Book Your Lesson</CardTitle>
              <CardDescription>
                Select a date and time for your surf lesson. Only weekends (Saturday and Sunday) are
                available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingCalendar
                ref={bookingCalendarRef}
                lessonPackageId={lessonPackageId}
                onBookingSuccess={handleBookingSuccess}
                onSelectionChange={handleSelectionChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
