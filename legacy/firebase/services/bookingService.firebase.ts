import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Booking, Room } from '../types';
import { getRoomById } from './roomService';

const BOOKINGS_COLLECTION = 'bookings';

// Cache mechanism
let bookingsCache: { [userId: string]: Booking[] } = {};
let lastFetchTime: { [userId: string]: number } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Calculate total price (cached calculation)
let priceCalculationCache: { [key: string]: number } = {};

// Get all bookings (for admin)
export const getBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const bookingsSnapshot = await getDocs(bookingsRef);
    
    return bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

// Get bookings for a specific user
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  // Return cached results if available and recent
  const now = Date.now();
  if (bookingsCache[userId] && lastFetchTime[userId] && now - lastFetchTime[userId] < CACHE_DURATION) {
    console.log('Using cached bookings data for user:', userId);
    return Promise.resolve(bookingsCache[userId]);
  }
  
  try {
    console.log('Fetching fresh bookings data for user:', userId);
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    
    // Update cache
    bookingsCache[userId] = bookings;
    lastFetchTime[userId] = now;
    
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    // If cache exists but is expired, still return it in case of error
    if (bookingsCache[userId]) {
      return bookingsCache[userId];
    }
    return [];
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Booking);
  } catch (error) {
    console.error("Error getting all bookings:", error);
    return [];
  }
};

// Get a booking by ID
export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, id);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      return null;
    }
    
    return { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
  } catch (error) {
    console.error("Error getting booking:", error);
    return null;
  }
};

// Check if room is available for given dates
export const checkRoomAvailability = async (
  roomId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(
      bookingsRef,
      where('roomId', '==', roomId),
      where('status', '!=', 'cancelled')
    );
    
    const snapshot = await getDocs(q);
    
    // Check if any booking conflicts with the selected dates
    for (const doc of snapshot.docs) {
      const booking = doc.data() as Booking;
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      // Check for overlap
      if (
        (startDate >= bookingStart && startDate < bookingEnd) ||
        (endDate > bookingStart && endDate <= bookingEnd) ||
        (startDate <= bookingStart && endDate >= bookingEnd)
      ) {
        return false; // Room is not available
      }
    }
    
    return true; // Room is available
  } catch (error) {
    console.error('Error checking room availability:', error);
    return false; // Assume not available in case of error
  }
};

// Calculate total price for a booking
export const calculateTotalPrice = (
  room: Room,
  startDate: Date,
  endDate: Date
): number => {
  const cacheKey = `${room.id}-${startDate.getTime()}-${endDate.getTime()}`;
  
  // Return cached price if available
  if (priceCalculationCache[cacheKey]) {
    return priceCalculationCache[cacheKey];
  }
  
  // Calculate number of nights
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Apply any discounts based on length of stay (example logic)
  let price = room.price;
  if (nights >= 7) {
    // 10% discount for stays of 7+ nights
    price = price * 0.9;
  } else if (nights >= 3) {
    // 5% discount for stays of 3+ nights
    price = price * 0.95;
  }
  
  const totalPrice = price * nights;
  
  // Cache the result
  priceCalculationCache[cacheKey] = totalPrice;
  
  return totalPrice;
};

// Create a new booking
export const createBooking = async (bookingData: Omit<Booking, 'id'>): Promise<string> => {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const docRef = await addDoc(bookingsRef, bookingData);
    
    // Invalidate cache for this user
    if (bookingData.userId && bookingsCache[bookingData.userId]) {
      delete bookingsCache[bookingData.userId];
      delete lastFetchTime[bookingData.userId];
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update a booking status
export const updateBookingStatus = async (
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(bookingRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (
  id: string,
  paymentStatus: 'pending' | 'paid'
): Promise<void> => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(bookingRef, {
      paymentStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (id: string): Promise<void> => {
  try {
    await updateBookingStatus(id, 'cancelled');
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

// Clear all caches (useful for testing or when user logs out)
export const clearBookingCaches = () => {
  bookingsCache = {};
  lastFetchTime = {};
  priceCalculationCache = {};
}; 