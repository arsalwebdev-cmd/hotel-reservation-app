import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface should match what's used in your SpecialOffers component
interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_night';
  discountValue: number;
  minimumStay: number;
  startDate: string;
  endDate: string;
  bookByDate: string;
  applicableRoomTypes: string[];
  termsAndConditions: string;
  promoCode: string;
  imageUrl: string;
}

export const getSpecialOffers = async (): Promise<Promotion[]> => {
  try {
    const now = new Date();
    const promoRef = collection(db, 'promotions');
    const q = query(promoRef, where('endDate', '>=', now.toISOString()));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Promotion[];
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }
};
