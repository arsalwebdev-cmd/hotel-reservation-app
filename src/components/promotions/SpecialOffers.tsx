import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTag, FaClock, FaCalendarAlt, FaPercent } from 'react-icons/fa';
import { getSpecialOffers } from '../../services/promotionService';

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

const SpecialOffers = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const offers = await getSpecialOffers();
        setPromotions(offers);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setError('Failed to load special offers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, []);

  const openModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const endDate = new Date(promotion.endDate);
    const bookByDate = new Date(promotion.bookByDate);
    
    return now <= (bookByDate < endDate ? bookByDate : endDate);
  };

  const formatDiscountValue = (promotion: Promotion) => {
    switch (promotion.discountType) {
      case 'percentage':
        return `${promotion.discountValue}% off`;
      case 'fixed':
        return `$${promotion.discountValue} off`;
      case 'free_night':
        return `Stay ${promotion.minimumStay} nights, pay for ${promotion.minimumStay - promotion.discountValue}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Special Offers & Promotions</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Take advantage of our exclusive deals and save on your next stay. From seasonal promotions to package deals, we have something special for everyone.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promotions.map((promotion) => (
          <div 
            key={promotion.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={promotion.imageUrl}
                alt={promotion.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
              {isPromotionActive(promotion) && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <FaTag className="mr-1" />
                  Limited Time
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{promotion.title}</h3>
              <p className="text-gray-600 mb-4 h-20 overflow-hidden">
                {promotion.description}
              </p>
              
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <FaPercent className="mr-1" />
                  {formatDiscountValue(promotion)}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialOffers;
