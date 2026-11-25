export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  type: 'standard' | 'deluxe' | 'suite';
  images: string[];
  amenities: string[];
  featured: boolean;
  breakfast: boolean;
  pets: boolean;
  available: boolean;
  imageUrl: string;
  rating?: number;
}

export interface Booking {
  id: string;
  bookingNumber?: string;
  userId: string;
  roomId: string;
  roomName: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  createdAt: string;
  paymentStatus: 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed';
  currency?: string;
  subtotal?: number;
  taxes?: number;
  specialRequests?: string;
}

export type { User } from './user';

export interface Review {
  id: string;
  userId: string;
  roomId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
} 
