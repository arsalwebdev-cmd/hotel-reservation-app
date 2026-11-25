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
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Room } from '../types';

const ROOMS_COLLECTION = 'rooms';

// Get all rooms
export const getRooms = async (): Promise<Room[]> => {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  const snapshot = await getDocs(roomsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Room);
};

// Get featured rooms
export const getFeaturedRooms = async (count = 3): Promise<Room[]> => {
  const roomsRef = collection(db, ROOMS_COLLECTION);
  const q = query(
    roomsRef, 
    where('featured', '==', true),
    where('available', '==', true),
    limit(count)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Room);
};

// Get a single room by ID
export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, id);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      return null;
    }
    
    return { id: roomDoc.id, ...roomDoc.data() } as Room;
  } catch (error) {
    console.error("Error getting room:", error);
    return null;
  }
};

// Filter rooms by criteria
export const filterRooms = async (
  capacity = 1,
  price = 1000,
  type = 'all',
  breakfast = false,
  pets = false
): Promise<Room[]> => {
  let roomsRef = collection(db, ROOMS_COLLECTION);
  let q = query(roomsRef, where('available', '==', true));
  
  // Get all available rooms first
  const snapshot = await getDocs(q);
  let rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Room);
  
  // Apply filters
  if (capacity > 1) {
    rooms = rooms.filter(room => room.capacity >= capacity);
  }
  
  if (type !== 'all') {
    rooms = rooms.filter(room => room.type === type);
  }
  
  if (breakfast) {
    rooms = rooms.filter(room => room.breakfast === true);
  }
  
  if (pets) {
    rooms = rooms.filter(room => room.pets === true);
  }
  
  // Filter by price (max price)
  rooms = rooms.filter(room => room.price <= price);
  
  // Sort by price
  return rooms.sort((a, b) => a.price - b.price);
};

// Admin functions

// Add a new room
export const addRoom = async (roomData: Omit<Room, 'id'>, imageFiles: File[]): Promise<string> => {
  try {
    // First upload images
    const imageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const storageRef = ref(storage, `rooms/${file.name}-${Date.now()}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      })
    );
    
    // Add room with image URLs
    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
      ...roomData,
      images: imageUrls,
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding room:", error);
    throw error;
  }
};

// Update a room
export const updateRoom = async (id: string, roomData: Partial<Room>, newImageFiles?: File[]): Promise<void> => {
  try {
    let imageUrls = roomData.images || [];
    
    // Upload new images if provided
    if (newImageFiles && newImageFiles.length > 0) {
      const newUrls = await Promise.all(
        newImageFiles.map(async (file) => {
          const storageRef = ref(storage, `rooms/${file.name}-${Date.now()}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );
      
      imageUrls = [...imageUrls, ...newUrls];
    }
    
    // Update room
    const roomRef = doc(db, ROOMS_COLLECTION, id);
    await updateDoc(roomRef, {
      ...roomData,
      images: imageUrls,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
};

// Delete a room
export const deleteRoom = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ROOMS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
}; 