import { apiRequest } from '../lib/api';
import type { Room } from '../types';

export interface RoomSearch {
  search?: string;
  guests?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  checkIn?: Date | string | null;
  checkOut?: Date | string | null;
  sort?: string;
}

const dateParam = (date?: Date | string | null) => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export async function getRooms(filters: RoomSearch = {}): Promise<Room[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.guests) params.set('guests', String(filters.guests));
  if (filters.type && filters.type !== 'any') params.set('type', filters.type);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.amenities?.length) params.set('amenities', filters.amenities.join(','));
  const checkIn = dateParam(filters.checkIn);
  const checkOut = dateParam(filters.checkOut);
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  if (filters.sort) params.set('sort', filters.sort);

  const query = params.size ? `?${params.toString()}` : '';
  const result = await apiRequest<{ rooms: Room[] }>(`/rooms${query}`);
  return result.rooms;
}

export async function getRoomById(id: string): Promise<Room | null> {
  try {
    const result = await apiRequest<{ room: Room }>(`/rooms/${encodeURIComponent(id)}`);
    return result.room;
  } catch (error) {
    if (error instanceof Error && error.message === 'Room not found.') return null;
    throw error;
  }
}

export async function checkRoomAvailability(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
  const params = new URLSearchParams({ checkIn: dateParam(checkIn)!, checkOut: dateParam(checkOut)! });
  const result = await apiRequest<{ available: boolean }>(`/rooms/${encodeURIComponent(roomId)}/availability?${params}`);
  return result.available;
}
