import { collection, query, where, getDocs, addDoc, getDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Review {
  id?: string;
  userId: string;
  userName: string;
  roomId: string;
  rating: number;
  comment: string;
  createdAt: string;
  stayDate: string;
  isVerifiedStay: boolean;
}

export const getReviewsForRoom = async (roomId: string): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('roomId', '==', roomId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const getRoomAverageRating = async (roomId: string): Promise<number> => {
  try {
    const reviews = await getReviewsForRoom(roomId);
    if (reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
};

export const getUserReviewForRoom = async (roomId: string, userId: string): Promise<Review | null> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('roomId', '==', roomId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as Review;
  } catch (error) {
    console.error('Error fetching user review:', error);
    return null;
  }
};

export const addReview = async (review: Omit<Review, 'id'>): Promise<string> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const docRef = await addDoc(reviewsRef, review);
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};
