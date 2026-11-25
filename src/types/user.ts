export interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: 'guest' | 'admin';
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
  phoneNumber?: string;
  photoURL?: string;
  address?: string;
  favoriteRooms?: string[]; // Array of room IDs
} 
