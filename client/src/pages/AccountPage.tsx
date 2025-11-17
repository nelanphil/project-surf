import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getUserLessons, deleteLesson, Lesson } from '../services/lessonService';
import { getUserRepairs, RepairRequest } from '../services/repairService';
import { getLessonPackageById } from '../services/lessonPackages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  User,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Trash2,
  Wrench,
  MapPin,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BookCheck, BookOpenCheck } from 'lucide-react';

export function AccountPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [repairsLoading, setRepairsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLessonsLoading(true);
        const data = await getUserLessons();
        setLessons(data);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        toast.error('Failed to load your lessons');
      } finally {
        setLessonsLoading(false);
      }
    };

    const fetchRepairs = async () => {
      try {
        setRepairsLoading(true);
        const data = await getUserRepairs();
        setRepairs(data);
      } catch (error) {
        console.error('Failed to fetch repair requests:', error);
        toast.error('Failed to load your repair requests');
      } finally {
        setRepairsLoading(false);
      }
    };

    fetchLessons();
    fetchRepairs();
  }, []);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to cancel this lesson?')) {
      return;
    }

    try {
      setDeletingId(lessonId);
      await deleteLesson(lessonId);
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
      toast.success('Lesson cancelled successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel lesson';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Normalize dates to compare date + time properly
  const normalizeDate = (dateString: string, timeString: string): Date => {
    // Parse the date string (YYYY-MM-DD)
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    // Parse the time string (HH:MM)
    const [hours, minutes] = timeString.split(':').map(Number);
    // Create a date in local timezone
    return new Date(year, month - 1, day, hours, minutes);
  };

  const now = new Date();
  const upcomingLessons = lessons
    .filter((lesson) => {
      const lessonDateTime = normalizeDate(lesson.date, lesson.time);
      return lessonDateTime >= now && lesson.status !== 'cancelled';
    })
    .sort((a, b) => {
      const dateA = normalizeDate(a.date, a.time);
      const dateB = normalizeDate(b.date, b.time);
      return dateA.getTime() - dateB.getTime();
    });

  const pastLessons = lessons
    .filter((lesson) => {
      const lessonDateTime = normalizeDate(lesson.date, lesson.time);
      return lessonDateTime < now || lesson.status === 'cancelled';
    })
    .sort((a, b) => {
      const dateA = normalizeDate(a.date, a.time);
      const dateB = normalizeDate(b.date, b.time);
      return dateB.getTime() - dateA.getTime();
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRepairStatusBadge = (status: RepairRequest['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'delivered':
        return <Badge className="bg-emerald-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* User Information */}
        <Card className="mt-4 mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="lessons" className="mt-8">
          <TabsList className="grid w-full gap-2 md:w-auto md:grid-cols-2">
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="repairs" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Repairs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-6">
            <div className="space-y-10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpenCheck className="h-6 w-6" />
                    Upcoming Lessons
                  </h2>
                  <Button
                    onClick={() => navigate('/lessons')}
                    variant="outline"
                    className="mt-4 md:mt-0"
                  >
                    Book New Lesson
                  </Button>
                </div>

                {lessonsLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading lessons...</div>
                ) : upcomingLessons.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-slate-500 mt-4">
                      <p>No upcoming lessons</p>
                      <Button
                        onClick={() => navigate('/lessons')}
                        className="mt-4"
                        variant="outline"
                      >
                        Book Your First Lesson
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {upcomingLessons.map((lesson) => {
                      const lessonPackage = getLessonPackageById(lesson.lessonPackageId);
                      const lessonDateTime = normalizeDate(lesson.date, lesson.time);
                      const isPast = lessonDateTime < now;

                      return (
                        <Card key={lesson._id} className={isPast ? 'opacity-60' : ''}>
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-slate-500" />
                                  <span className="font-medium">{formatDate(lesson.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-slate-500" />
                                  <span className="text-slate-600">{formatTime(lesson.time)}</span>
                                </div>
                                {lessonPackage && (
                                  <div className="text-sm text-slate-600">
                                    {lessonPackage.title} - {lessonPackage.level}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-slate-500" />
                                  <span className="text-slate-600">${lesson.price.toFixed(2)}</span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-slate-600">
                                    {lesson.hours} hour{lesson.hours !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div>{getStatusBadge(lesson.status)}</div>
                              </div>
                              <div className="flex gap-2">
                                {!isPast && lesson.status !== 'cancelled' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteLesson(lesson._id)}
                                    disabled={deletingId === lesson._id}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {deletingId === lesson._id ? 'Cancelling...' : 'Cancel'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {pastLessons.length > 0 && (
                <div className="px-4">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 mt-4">
                    <BookCheck className="h-6 w-6" />
                    Past Lessons
                  </h2>
                  <div className="grid gap-4">
                    {pastLessons.map((lesson) => {
                      const lessonPackage = getLessonPackageById(lesson.lessonPackageId);

                      return (
                        <Card key={lesson._id} className="opacity-75 mb-4">
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">{formatDate(lesson.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-600">{formatTime(lesson.time)}</span>
                              </div>
                              {lessonPackage && (
                                <div className="text-sm text-slate-600">
                                  {lessonPackage.title} - {lessonPackage.level}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-600">${lesson.price.toFixed(2)}</span>
                              </div>
                              <div>{getStatusBadge(lesson.status)}</div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="repairs" className="mt-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Wrench className="h-6 w-6" />
                  Repair Requests
                </h2>
                <Button
                  onClick={() => navigate('/repairs')}
                  variant="outline"
                  className="mt-4 md:mt-0"
                >
                  Request Repair
                </Button>
              </div>

              {repairsLoading ? (
                <div className="text-center py-8 text-slate-500">Loading repair requests...</div>
              ) : repairs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500 mt-4">
                    <p>No repair requests submitted yet</p>
                    <Button onClick={() => navigate('/repairs')} className="mt-4" variant="outline">
                      Start a Repair
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {repairs.map((repair) => {
                    const isPickup = repair.deliveryMethod === 'pickup';
                    const methodLabel = isPickup ? 'Pick-up Service' : 'Drop-off at Gringo Surf';

                    return (
                      <Card key={repair._id}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="h-4 w-4" />
                                <span>Submitted {formatDate(repair.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">{methodLabel}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="capitalize">
                                {repair.deliveryMethod}
                              </Badge>
                              {getRepairStatusBadge(repair.status)}
                            </div>
                          </div>

                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm uppercase text-slate-500 tracking-wide">
                                  Board
                                </p>
                                <p className="font-medium text-slate-800">
                                  {repair.boardSize} • {repair.boardType}
                                </p>
                                <p className="text-sm text-slate-600">
                                  Ding: {repair.dingSize} on the {repair.dingLocation}
                                </p>
                              </div>
                              {repair.description && (
                                <p className="text-sm text-slate-500 border-l-2 border-slate-200 pl-3">
                                  {repair.description}
                                </p>
                              )}
                              <div className="text-sm text-slate-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{repair.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{repair.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{repair.zipCode}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-sm uppercase text-slate-500 tracking-wide">
                                Delivery Details
                              </p>
                              {isPickup ? (
                                <div className="space-y-2 text-sm text-slate-600">
                                  {repair.pickupAddress && (
                                    <p className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-slate-500" />
                                      <span>{repair.pickupAddress}</span>
                                    </p>
                                  )}
                                  {repair.pickupDate && (
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-slate-500" />
                                      <span>Pickup: {formatDate(repair.pickupDate)}</span>
                                    </p>
                                  )}
                                  {repair.pickupNotes && (
                                    <p className="text-slate-500">Notes: {repair.pickupNotes}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2 text-sm text-slate-600">
                                  {repair.dropoffDate ? (
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-slate-500" />
                                      <span>
                                        Preferred drop-off: {formatDate(repair.dropoffDate)}
                                      </span>
                                    </p>
                                  ) : (
                                    <p className="text-slate-500">No drop-off date selected</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
