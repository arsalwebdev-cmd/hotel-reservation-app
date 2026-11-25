import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaCheck, FaUser, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { addReview, getReviewsForRoom, getRoomAverageRating, getUserReviewForRoom } from '../../services/reviewService';

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

interface ReviewSystemProps {
  roomId: string;
}

const ReviewSystem = ({ roomId }: ReviewSystemProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    stayDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [showWriteReview, setShowWriteReview] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const fetchedReviews = await getReviewsForRoom(roomId);
        const avgRating = await getRoomAverageRating(roomId);
        setReviews(fetchedReviews);
        setAverageRating(avgRating);
        
        if (user) {
          const userReviewData = await getUserReviewForRoom(roomId, user.uid);
          setUserReview(userReviewData);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      }
    };
    
    fetchReviews();
  }, [roomId, user]);

  const handleRatingChange = (rating: number) => {
    setNewReview({ ...newReview, rating });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (newReview.rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addReview({
        userId: user.uid,
        userName: user.displayName,
        roomId,
        rating: newReview.rating,
        comment: newReview.comment,
        stayDate: newReview.stayDate,
        createdAt: new Date().toISOString(),
        isVerifiedStay: true // This would be determined based on booking history
      });
      
      // Refresh reviews
      const fetchedReviews = await getReviewsForRoom(roomId);
      const avgRating = await getRoomAverageRating(roomId);
      setReviews(fetchedReviews);
      setAverageRating(avgRating);
      
      // Reset form
      setNewReview({
        rating: 0,
        comment: '',
        stayDate: ''
      });
      setShowWriteReview(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSortChange = (order: 'newest' | 'highest' | 'lowest') => {
    setSortOrder(order);
    
    let sortedReviews = [...reviews];
    if (order === 'newest') {
      sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (order === 'highest') {
      sortedReviews.sort((a, b) => b.rating - a.rating);
    } else {
      sortedReviews.sort((a, b) => a.rating - b.rating);
    }
    
    setReviews(sortedReviews);
  };

  const StarRating = ({ rating, size }: { rating: number, size?: string }) => {
    const stars = [];
    const starClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className={`${starClass} text-yellow-400`} />);
      } else {
        stars.push(<FaRegStar key={i} className={`${starClass} text-yellow-400`} />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="mt-12">
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Guest Reviews</h2>
          
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <StarRating rating={averageRating} size="lg" />
              <span className="ml-2 text-xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="ml-2 text-gray-500">({reviews.length} reviews)</span>
            </div>
            
            {user && !userReview && (
              <button
                type="button"
                onClick={() => setShowWriteReview(!showWriteReview)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
              >
                Write a Review
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {showWriteReview && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="p-1"
                    >
                      {star <= newReview.rating ? (
                        <FaStar className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <FaRegStar className="w-8 h-8 text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="stayDate" className="block text-sm font-medium text-gray-700 mb-1">
                  When did you stay?
                </label>
                <input
                  type="month"
                  id="stayDate"
                  value={newReview.stayDate}
                  onChange={(e) => setNewReview({ ...newReview, stayDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Share your experience staying at this room"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowWriteReview(false)}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {reviews.length > 0 ? (
          <>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Sort by:</span>
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`text-sm px-3 py-1 rounded-md mr-2 ${
                    sortOrder === 'newest' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <FaSort className="inline-block mr-1" />
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange('highest')}
                  className={`text-sm px-3 py-1 rounded-md mr-2 ${
                    sortOrder === 'highest' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <FaSortUp className="inline-block mr-1" />
                  Highest Rated
                </button>
                <button
                  onClick={() => handleSortChange('lowest')}
                  className={`text-sm px-3 py-1 rounded-md ${
                    sortOrder === 'lowest' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <FaSortDown className="inline-block mr-1" />
                  Lowest Rated
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{review.userName}</p>
                          {review.isVerifiedStay && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheck className="mr-1" /> Verified Stay
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Stayed in {new Date(review.stayDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <StarRating rating={review.rating} />
                        <span className="ml-2 text-gray-700">{review.rating}/5</span>
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-800">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
