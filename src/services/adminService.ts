import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { Room, Booking, User } from '../types';

// Dashboard Statistics
export const getAdminDashboardStats = async () => {
  try {
    // Get rooms count
    const roomsSnapshot = await getDocs(collection(db, 'rooms'));
    const totalRooms = roomsSnapshot.size;
    
    // Get bookings count and revenue
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    const totalBookings = bookingsSnapshot.size;
    
    let totalRevenue = 0;
    const confirmedBookings = bookingsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'confirmed';
    });
    
    confirmedBookings.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.totalPrice || 0;
    });
    
    // Get users count
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;
    
    return {
      totalRooms,
      totalBookings,
      totalUsers,
      totalRevenue,
      confirmedBookings: confirmedBookings.length
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    throw error;
  }
};

// Room Management
export const getAllRooms = async () => {
  try {
    const roomsQuery = query(collection(db, 'rooms'), orderBy('name'));
    const roomsSnapshot = await getDocs(roomsQuery);
    
    return roomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Room[];
  } catch (error) {
    console.error("Error getting all rooms:", error);
    throw error;
  }
};

export const createRoom = async (roomData: Omit<Room, 'id'>) => {
  try {
    const roomRef = await addDoc(collection(db, 'rooms'), {
      ...roomData,
      createdAt: Timestamp.now()
    });
    
    return roomRef.id;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

export const updateRoom = async (roomId: string, roomData: Partial<Room>) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...roomData,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
};

export const deleteRoom = async (roomId: string) => {
  try {
    // Check if there are any active bookings for this room
    const bookingsQuery = query(
      collection(db, 'bookings'), 
      where('roomId', '==', roomId),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    if (!bookingsSnapshot.empty) {
      throw new Error("Cannot delete room with active bookings");
    }
    
    await deleteDoc(doc(db, 'rooms', roomId));
    return true;
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};

// Booking Management
export const getAllBookings = async () => {
  try {
    const bookingsQuery = query(
      collection(db, 'bookings'), 
      orderBy('createdAt', 'desc')
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    return bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error("Error getting all bookings:", error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

export const deleteBooking = async (bookingId: string) => {
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
    return true;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};

// User Management
export const getAllUsers = async () => {
  try {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const usersSnapshot = await getDocs(usersQuery);
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, isAdmin: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// SQL-like query interface for admin operations
export const adminQuery = async (
  collectionName: string,
  operation: 'SELECT' | 'UPDATE' | 'DELETE' | 'INSERT',
  options: {
    fields?: string[];
    where?: { field: string; operator: string; value: any }[];
    orderBy?: { field: string; direction: 'asc' | 'desc' }[];
    limit?: number;
    data?: Record<string, any>;
    id?: string;
  }
) => {
  try {
    switch (operation) {
      case 'SELECT': {
        let q = query(collection(db, collectionName));
        
        // Apply where clauses
        if (options.where) {
          options.where.forEach(clause => {
            q = query(q, where(clause.field, clause.operator as any, clause.value));
          });
        }
        
        // Apply ordering
        if (options.orderBy) {
          options.orderBy.forEach(sort => {
            q = query(q, orderBy(sort.field, sort.direction));
          });
        }
        
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return {
          success: true,
          count: results.length,
          data: results
        };
      }
      
      case 'INSERT': {
        if (!options.data) {
          throw new Error('Data is required for INSERT operation');
        }
        
        const docRef = await addDoc(collection(db, collectionName), {
          ...options.data,
          createdAt: Timestamp.now()
        });
        
        return {
          success: true,
          id: docRef.id
        };
      }
      
      case 'UPDATE': {
        if (!options.id) {
          throw new Error('ID is required for UPDATE operation');
        }
        
        if (!options.data) {
          throw new Error('Data is required for UPDATE operation');
        }
        
        const docRef = doc(db, collectionName, options.id);
        await updateDoc(docRef, {
          ...options.data,
          updatedAt: Timestamp.now()
        });
        
        return {
          success: true,
          id: options.id
        };
      }
      
      case 'DELETE': {
        if (!options.id) {
          throw new Error('ID is required for DELETE operation');
        }
        
        await deleteDoc(doc(db, collectionName, options.id));
        
        return {
          success: true,
          id: options.id
        };
      }
      
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error(`Error executing ${operation} query on ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 