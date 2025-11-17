const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('gringo_surf_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AdminRepairRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  boardSize: string;
  boardType: string;
  dingLocation: string;
  dingSize: string;
  description?: string;
  deliveryMethod: 'dropoff' | 'pickup';
  pickupAddress?: string;
  pickupDate?: string;
  pickupNotes?: string;
  dropoffDate?: string;
  status: 'submitted' | 'in_progress' | 'completed' | 'cancelled' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface AdminLesson {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  lessonPackageId: number;
  date: string;
  time: string;
  price: number;
  hours: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch users');
  }

  return response.json();
};

export const getAllRepairs = async (): Promise<AdminRepairRequest[]> => {
  const response = await fetch(`${API_BASE_URL}/repairs/all`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch repair requests');
  }

  return response.json();
};

export const getAllLessons = async (): Promise<AdminLesson[]> => {
  const response = await fetch(`${API_BASE_URL}/lessons/all`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch lessons');
  }

  return response.json();
};

export const updateRepairStatus = async (
  repairId: string,
  status: AdminRepairRequest['status']
): Promise<AdminRepairRequest> => {
  const response = await fetch(`${API_BASE_URL}/repairs/${repairId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to update repair status');
  }

  return response.json();
};

