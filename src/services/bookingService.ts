import { apiRequest } from '../lib/api';
import type { Booking, Room } from '../types';
import { checkRoomAvailability } from './roomService';

export { checkRoomAvailability };

export interface CreateBookingInput {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  specialRequests?: string;
}

const toDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const calculateTotalPrice = (room: Room, startDate: Date, endDate: Date): number => {
  const nights = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000));
  const discount = nights >= 7 ? 0.9 : nights >= 3 ? 0.95 : 1;
  return Number((room.price * nights * discount).toFixed(2));
};

export async function createBooking(input: CreateBookingInput) {
  const result = await apiRequest<{ booking: { id: string; bookingNumber: string; total: number; status: Booking['status'] } }>('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      checkIn: toDate(input.checkIn),
      checkOut: toDate(input.checkOut),
    }),
  });
  return result.booking;
}

interface ApiBooking {
  id: string;
  bookingNumber: string;
  userId: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  total: number;
  status: Booking['status'];
  paymentStatus: Booking['paymentStatus'];
  createdAt: string;
}

const toLegacyBookingShape = (booking: ApiBooking): Booking => ({
  id: booking.id,
  bookingNumber: booking.bookingNumber,
  userId: booking.userId,
  roomId: booking.roomId,
  roomName: booking.roomName,
  startDate: booking.checkIn,
  endDate: booking.checkOut,
  adults: booking.adults,
  children: booking.children,
  totalPrice: booking.total,
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  createdAt: booking.createdAt,
});

export async function getUserBookings(_userId?: string): Promise<Booking[]> {
  const result = await apiRequest<{ bookings: ApiBooking[] }>('/bookings/mine');
  return result.bookings.map(toLegacyBookingShape);
}

export async function getBookingById(id: string) {
  const result = await apiRequest<{ booking: ApiBooking }>(`/bookings/${encodeURIComponent(id)}`);
  return toLegacyBookingShape(result.booking);
}

export async function cancelBooking(id: string) {
  return apiRequest<{ booking: { id: string; bookingNumber: string; status: string } }>(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
}

export async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed') {
  return apiRequest<{ booking: { id: string; bookingNumber: string; status: string } }>(`/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
