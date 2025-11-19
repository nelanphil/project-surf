import { useState, useEffect } from 'react';
import {
  getAllUsers,
  getAllRepairs,
  getAllLessons,
  updateRepairStatus,
  AdminUser,
  AdminRepairRequest,
  AdminLesson,
} from '../services/adminService';
import { getLessonPackageById } from '../services/lessonPackages';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Users,
  Wrench,
  BookOpenCheck,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [repairs, setRepairs] = useState<AdminRepairRequest[]>([]);
  const [repairsLoading, setRepairsLoading] = useState(true);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [updatingRepairId, setUpdatingRepairId] = useState<string | null>(null);
  const [repairStatusFilter, setRepairStatusFilter] = useState<
    AdminRepairRequest['status'] | 'all'
  >('all');
  const [repairSortField, setRepairSortField] = useState<'date' | 'status'>('date');
  const [repairSortDirection, setRepairSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all data in parallel
      try {
        setUsersLoading(true);
        setRepairsLoading(true);
        setLessonsLoading(true);

        const [usersData, repairsData, lessonsData] = await Promise.all([
          getAllUsers(),
          getAllRepairs(),
          getAllLessons(),
        ]);

        setUsers(usersData);
        setRepairs(repairsData);
        setLessons(lessonsData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setUsersLoading(false);
        setRepairsLoading(false);
        setLessonsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getRepairStatusBadge = (status: AdminRepairRequest['status']) => {
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

  const handleStatusChange = async (repairId: string, newStatus: AdminRepairRequest['status']) => {
    try {
      setUpdatingRepairId(repairId);
      await updateRepairStatus(repairId, newStatus);
      toast.success('Repair status updated successfully');

      // Refresh repairs list
      const updatedRepairs = await getAllRepairs();
      setRepairs(updatedRepairs);
    } catch (error) {
      console.error('Failed to update repair status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update repair status');
    } finally {
      setUpdatingRepairId(null);
    }
  };

  const getLessonStatusBadge = (status: AdminLesson['status']) => {
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

  const getUserName = (userId: AdminRepairRequest['userId'] | AdminLesson['userId']): string => {
    if (typeof userId === 'object' && userId !== null) {
      return userId.name || 'Unknown';
    }
    return 'Unknown';
  };

  const getUserEmail = (userId: AdminRepairRequest['userId'] | AdminLesson['userId']): string => {
    if (typeof userId === 'object' && userId !== null) {
      return userId.email || 'Unknown';
    }
    return 'Unknown';
  };

  const sortRepairs = (repairsToSort: AdminRepairRequest[]): AdminRepairRequest[] => {
    const sorted = [...repairsToSort];

    // Status order: submitted < in_progress < completed < delivered < cancelled
    const statusOrder: Record<AdminRepairRequest['status'], number> = {
      submitted: 1,
      in_progress: 2,
      completed: 3,
      delivered: 4,
      cancelled: 5,
    };

    sorted.sort((a, b) => {
      let comparison = 0;

      if (repairSortField === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateA - dateB;
      } else if (repairSortField === 'status') {
        const statusA = statusOrder[a.status] || 0;
        const statusB = statusOrder[b.status] || 0;
        comparison = statusA - statusB;
      }

      return repairSortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  return (
    <div className="min-h-screen py-4 sm:py-8">
      {/* <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="card bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-2">
            Admin Dashboard
          </h1>
        </div>
      </div> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Tabs defaultValue="users" className="mt-6 sm:mt-8">
          <TabsList className="flex w-full gap-2 md:w-auto overflow-x-auto">
            <TabsTrigger
              value="users"
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[44px] flex-1 md:flex-initial"
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">All Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="repairs"
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[44px] flex-1 md:flex-initial"
            >
              <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Repairs</span>
            </TabsTrigger>
            <TabsTrigger
              value="lessons"
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[44px] flex-1 md:flex-initial"
            >
              <BookOpenCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Sessions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xs sm:text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 sm:h-4 sm:w-4" />
                All Users ({users.length})
              </h2>
            </div>

            {usersLoading ? (
              <div className="text-center py-8 text-slate-500">Loading users...</div>
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500 mt-4 px-4 sm:px-6">
                  <p>No users found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {users.map((user) => (
                  <Card key={user._id}>
                    <CardContent className="pt-6 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                        <div className="space-y-2 sm:space-y-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="font-medium text-sm sm:text-base break-words">
                              {user.name}
                            </span>
                            {user.isAdmin && (
                              <Badge className="bg-purple-500 text-xs sm:text-sm">Admin</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600">
                            <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="break-all">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span className="break-words">
                              Registered: {formatDate(user.createdAt)}
                            </span>
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                              <Clock className="h-4 w-4 shrink-0" />
                              <span className="break-words">
                                Last login: {formatDate(user.lastLogin)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="repairs" className="mt-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xs sm:text-2xl font-bold flex items-center gap-2">
                <Wrench className="h-6 w-6 sm:h-4 sm:w-4" />
                <span className="break-words">
                  All Repair Orders (
                  {repairStatusFilter === 'all'
                    ? repairs.length
                    : repairs.filter((r) => r.status === repairStatusFilter).length}
                  )
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[140px] sm:min-w-0 sm:flex-initial">
                  <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                    Filter:
                  </span>
                  <Select
                    value={repairStatusFilter}
                    onValueChange={(value: string) =>
                      setRepairStatusFilter(value as AdminRepairRequest['status'] | 'all')
                    }
                  >
                    <SelectTrigger className="w-full min-w-[120px] sm:w-[140px] sm:min-w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[120px] sm:min-w-0 sm:flex-initial">
                  <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">Sort:</span>
                  <Select
                    value={repairSortField}
                    onValueChange={(value: string) =>
                      setRepairSortField(value as 'date' | 'status')
                    }
                  >
                    <SelectTrigger className="w-full min-w-[100px] sm:w-[120px] sm:min-w-[120px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[130px] sm:min-w-0 sm:flex-initial">
                  <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                    Order:
                  </span>
                  <Select
                    value={repairSortDirection}
                    onValueChange={(value: string) =>
                      setRepairSortDirection(value as 'asc' | 'desc')
                    }
                  >
                    <SelectTrigger className="w-full min-w-[110px] sm:w-[130px] sm:min-w-[130px] h-9">
                      <SelectValue placeholder="Order">
                        {repairSortDirection === 'asc' ? (
                          <span className="flex items-center gap-1.5">
                            <ArrowUpWideNarrow className="h-4 w-4" />
                            <span className="hidden sm:inline">Ascending</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <ArrowDownWideNarrow className="h-4 w-4" />
                            <span className="hidden sm:inline">Descending</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">
                        <span className="flex items-center gap-2">
                          <ArrowUpWideNarrow className="h-4 w-4" />
                          <span className="hidden sm:inline">Ascending</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="desc">
                        <span className="flex items-center gap-2">
                          <ArrowDownWideNarrow className="h-4 w-4" />
                          <span className="hidden sm:inline">Descending</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {repairsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading repair requests...</div>
            ) : (
              (() => {
                const filteredRepairs =
                  repairStatusFilter === 'all'
                    ? repairs
                    : repairs.filter((r) => r.status === repairStatusFilter);

                const sortedRepairs = sortRepairs(filteredRepairs);

                return sortedRepairs.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-slate-500 mt-4 px-4 sm:px-6">
                      <p>
                        No repair requests found
                        {repairStatusFilter !== 'all' ? ` with status "${repairStatusFilter}"` : ''}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 sm:gap-4">
                    {sortedRepairs.map((repair) => {
                      const isPickup = repair.deliveryMethod === 'pickup';
                      const methodLabel = isPickup ? 'Pick-up Service' : 'Drop-off at Gringo Surf';

                      return (
                        <Card key={repair._id}>
                          <CardContent className="pt-6 sm:pt-8 md:pt-10 px-6 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10">
                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
                              <div className="space-y-2.5 sm:space-y-3">
                                <div className="flex items-center gap-2 text-xs uppercase text-slate-600">
                                  <Users className="h-3.5 w-3.5 shrink-0" />
                                  <span className="font-medium break-words uppercase tracking-wide">
                                    {getUserName(repair.userId)} ({getUserEmail(repair.userId)})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs uppercase text-slate-600">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  <span className="break-words uppercase tracking-wide">
                                    Submitted {formatDate(repair.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs uppercase text-slate-600">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="font-medium break-words uppercase tracking-wide">
                                    {methodLabel}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                                <Badge
                                  variant="secondary"
                                  className="capitalize text-xs sm:text-sm"
                                >
                                  {repair.deliveryMethod}
                                </Badge>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {getRepairStatusBadge(repair.status)}
                                  <Select
                                    value={repair.status}
                                    onValueChange={(value: string) =>
                                      handleStatusChange(
                                        repair._id,
                                        value as AdminRepairRequest['status'],
                                      )
                                    }
                                    disabled={updatingRepairId === repair._id}
                                  >
                                    <SelectTrigger
                                      className="w-full min-w-[130px] sm:w-[140px] sm:min-w-[140px] h-9"
                                      disabled={updatingRepairId === repair._id}
                                    >
                                      <SelectValue
                                        placeholder={
                                          updatingRepairId === repair._id
                                            ? 'Updating...'
                                            : 'Change status'
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="submitted">Submitted</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-6 sm:gap-8 md:gap-10 md:grid-cols-2">
                              <div className="space-y-5 sm:space-y-6">
                                <div className="space-y-2">
                                  <p className="text-xs uppercase text-slate-500 tracking-wider font-semibold mb-2">
                                    Board
                                  </p>
                                  <p className="font-medium text-xs text-slate-800 break-words uppercase tracking-wide">
                                    {repair.boardSize} • {repair.boardType}
                                  </p>
                                  <p className="text-xs text-slate-600 break-words uppercase tracking-wide">
                                    Ding: {repair.dingSize} on the {repair.dingLocation}
                                  </p>
                                </div>
                                {repair.description && (
                                  <div className="pt-2">
                                    <p className="text-xs text-slate-500 border-l-2 border-slate-200 pl-3 break-words uppercase tracking-wide">
                                      {repair.description}
                                    </p>
                                  </div>
                                )}
                                <div className="pt-2 space-y-2.5">
                                  <div className="flex items-center gap-2 text-xs uppercase text-slate-600">
                                    <Phone className="h-3.5 w-3.5 shrink-0" />
                                    <span className="break-all uppercase tracking-wide">
                                      {repair.phone}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs uppercase text-slate-600">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="break-all uppercase tracking-wide">
                                      {repair.email}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs uppercase text-slate-600">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="break-words uppercase tracking-wide">
                                      {repair.zipCode}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-5 sm:space-y-6">
                                <div className="space-y-3">
                                  <p className="text-xs uppercase text-slate-500 tracking-wider font-semibold mb-2">
                                    Delivery Details
                                  </p>
                                  {isPickup ? (
                                    <div className="space-y-2.5 text-xs uppercase text-slate-600">
                                      {repair.pickupAddress && (
                                        <p className="flex items-start gap-2">
                                          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                                          <span className="break-words uppercase tracking-wide">
                                            {repair.pickupAddress}
                                          </span>
                                        </p>
                                      )}
                                      {repair.pickupDate && (
                                        <p className="flex items-center gap-2">
                                          <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                          <span className="break-words uppercase tracking-wide">
                                            Pickup: {formatDate(repair.pickupDate)}
                                          </span>
                                        </p>
                                      )}
                                      {repair.pickupNotes && (
                                        <p className="text-slate-500 break-words uppercase tracking-wide pt-1">
                                          Notes: {repair.pickupNotes}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-2.5 text-xs uppercase text-slate-600">
                                      {repair.dropoffDate ? (
                                        <p className="flex items-center gap-2">
                                          <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                          <span className="break-words uppercase tracking-wide">
                                            Preferred drop-off: {formatDate(repair.dropoffDate)}
                                          </span>
                                        </p>
                                      ) : (
                                        <p className="text-slate-500 uppercase tracking-wide">
                                          No drop-off date selected
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                All Booked Sessions ({lessons.length})
              </h2>
            </div>

            {lessonsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading lessons...</div>
            ) : lessons.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500 mt-4 px-4 sm:px-6">
                  <p>No lessons found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {lessons.map((lesson) => {
                  const lessonPackage = getLessonPackageById(lesson.lessonPackageId);

                  return (
                    <Card key={lesson._id}>
                      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 space-y-2 sm:space-y-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Users className="h-4 w-4 text-slate-500 shrink-0" />
                              <span className="font-medium text-sm sm:text-base break-words">
                                {getUserName(lesson.userId)} ({getUserEmail(lesson.userId)})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                              <span className="font-medium text-sm sm:text-base break-words">
                                {formatDate(lesson.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                              <span className="text-sm sm:text-base text-slate-600">
                                {formatTime(lesson.time)}
                              </span>
                            </div>
                            {lessonPackage && (
                              <div className="text-xs sm:text-sm text-slate-600 break-words">
                                {lessonPackage.title} - {lessonPackage.level}
                              </div>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <DollarSign className="h-4 w-4 text-slate-500 shrink-0" />
                              <span className="text-sm sm:text-base text-slate-600">
                                ${lesson.price.toFixed(2)}
                              </span>
                              <span className="text-slate-500">•</span>
                              <span className="text-sm sm:text-base text-slate-600">
                                {lesson.hours} hour{lesson.hours !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div>{getLessonStatusBadge(lesson.status)}</div>
                            <div className="text-xs sm:text-sm text-slate-500 break-words">
                              Booked: {formatDate(lesson.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
