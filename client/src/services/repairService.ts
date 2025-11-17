const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('gringo_surf_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface RepairRequest {
  _id: string;
  userId: string;
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

export interface CreateRepairRequestPayload {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  boardSize: string;
  boardType?: string;
  dingLocation: string;
  dingSize: string;
  description?: string;
  deliveryMethod: 'dropoff' | 'pickup';
  pickupAddress?: string;
  pickupDate?: string;
  pickupNotes?: string;
  dropoffDate?: string;
}

export const submitRepairRequest = async (
  data: CreateRepairRequestPayload
): Promise<RepairRequest> => {
  const response = await fetch(`${API_BASE_URL}/repairs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to submit repair request');
  }

  return result;
};

export const getUserRepairs = async (): Promise<RepairRequest[]> => {
  const response = await fetch(`${API_BASE_URL}/repairs/my`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch repair requests');
  }

  return response.json();
};


