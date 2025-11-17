const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export interface Lesson {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  lessonPackageId: number;
  date: string;
  time: string;
  price: number;
  hours: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonData {
  lessonPackageId: number;
  date: string; // ISO date string
  time: string; // HH:MM format
  price: number;
  hours: number;
}

export interface UpdateLessonData {
  date?: string;
  time?: string;
  price?: number;
  hours?: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('gringo_surf_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const createBooking = async (data: CreateLessonData): Promise<Lesson> => {
  const response = await fetch(`${API_BASE_URL}/lessons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to create booking');
  }

  return result;
};

export const getLessonsForDateRange = async (
  startDate: string,
  endDate: string
): Promise<Lesson[]> => {
  const response = await fetch(
    `${API_BASE_URL}/lessons?startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch lessons');
  }

  return response.json();
};

export const getUserLessons = async (): Promise<Lesson[]> => {
  const response = await fetch(`${API_BASE_URL}/lessons/my`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch user lessons');
  }

  return response.json();
};

export const updateLesson = async (
  lessonId: string,
  data: UpdateLessonData
): Promise<Lesson> => {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to update lesson');
  }

  return result;
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to delete lesson');
  }
};

