import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
  Shield,
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
  const [repairStatusFilter, setRepairStatusFilter] = useState<AdminRepairRequest['status'] | 'all'>('all');
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>

        <Tabs defaultValue="users" className="mt-8">
          <TabsList className="grid w-full gap-2 md:w-auto md:grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="repairs" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              All Repair Orders
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4" />
              All Booked Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                All Users ({users.length})
              </h2>
            </div>

            {usersLoading ? (
              <div className="text-center py-8 text-slate-500">Loading users...</div>
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500 mt-4">
                  <p>No users found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <Card key={user._id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">{user.name}</span>
                            {user.isAdmin && (
                              <Badge className="bg-purple-500">Admin</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="h-4 w-4 text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            <span>Registered: {formatDate(user.createdAt)}</span>
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="h-4 w-4" />
                              <span>Last login: {formatDate(user.lastLogin)}</span>
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
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Wrench className="h-6 w-6" />
                All Repair Orders ({repairStatusFilter === 'all' ? repairs.length : repairs.filter(r => r.status === repairStatusFilter).length})
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Filter by status:</span>
                  <Select
                    value={repairStatusFilter}
                    onValueChange={(value) => setRepairStatusFilter(value as AdminRepairRequest['status'] | 'all')}
                  >
                    <SelectTrigger className="w-[160px]">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Sort by:</span>
                  <Select
                    value={repairSortField}
                    onValueChange={(value) => setRepairSortField(value as 'date' | 'status')}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Direction:</span>
                  <Select
                    value={repairSortDirection}
                    onValueChange={(value) => setRepairSortDirection(value as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {repairsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading repair requests...</div>
            ) : (() => {
              const filteredRepairs = repairStatusFilter === 'all' 
                ? repairs 
                : repairs.filter(r => r.status === repairStatusFilter);
              
              const sortedRepairs = sortRepairs(filteredRepairs);
              
              return sortedRepairs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-slate-500 mt-4">
                    <p>No repair requests found{repairStatusFilter !== 'all' ? ` with status "${repairStatusFilter}"` : ''}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sortedRepairs.map((repair) => {
                  const isPickup = repair.deliveryMethod === 'pickup';
                  const methodLabel = isPickup ? 'Pick-up Service' : 'Drop-off at Gringo Surf';

                  return (
                    <Card key={repair._id}>
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">
                                {getUserName(repair.userId)} ({getUserEmail(repair.userId)})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted {formatDate(repair.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">{methodLabel}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="secondary" className="capitalize">
                              {repair.deliveryMethod}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {getRepairStatusBadge(repair.status)}
                              <Select
                                value={repair.status}
                                onValueChange={(value) =>
                                  handleStatusChange(repair._id, value as AdminRepairRequest['status'])
                                }
                                disabled={updatingRepairId === repair._id}
                              >
                                <SelectTrigger className="w-[140px]" disabled={updatingRepairId === repair._id}>
                                  <SelectValue placeholder={updatingRepairId === repair._id ? 'Updating...' : 'Change status'} />
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

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm uppercase text-slate-500 tracking-wide">Board</p>
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
              );
            })()}
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpenCheck className="h-6 w-6" />
                All Booked Sessions ({lessons.length})
              </h2>
            </div>

            {lessonsLoading ? (
              <div className="text-center py-8 text-slate-500">Loading lessons...</div>
            ) : lessons.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500 mt-4">
                  <p>No lessons found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {lessons.map((lesson) => {
                  const lessonPackage = getLessonPackageById(lesson.lessonPackageId);

                  return (
                    <Card key={lesson._id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">
                                {getUserName(lesson.userId)} ({getUserEmail(lesson.userId)})
                              </span>
                            </div>
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
                            <div>{getLessonStatusBadge(lesson.status)}</div>
                            <div className="text-sm text-slate-500">
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

