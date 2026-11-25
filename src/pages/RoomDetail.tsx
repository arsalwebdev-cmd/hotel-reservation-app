import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaBed, FaUsers, FaWifi, FaUtensils, FaSwimmingPool, FaParking, FaCoffee, FaTv } from 'react-icons/fa';
import { getRoomById } from '../services/roomService';
import { Room } from '../types';

// Lazy load the booking form to improve initial load time
const BookingForm = lazy(() => import('../components/booking/BookingForm'));

// Skeleton loading component for images
const ImageSkeleton = () => (
  <div className="animate-pulse bg-gray-300 rounded-xl w-full h-full"></div>
);

// Preload image function
const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const loadRoom = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Check localStorage for cached room data
        const cachedRoomData = localStorage.getItem(`room_${id}`);
        let roomData: Room | null = null;
        
        if (cachedRoomData) {
          try {
            // Use cached data while fetching fresh data
            roomData = JSON.parse(cachedRoomData) as Room;
            setRoom(roomData);
            if (roomData && roomData.images && roomData.images.length > 0) {
              setSelectedImage(roomData.images[0]);
            }
            setIsLoading(false);
          } catch (e) {
            console.error('Error parsing cached room data:', e);
            // Continue with fetching fresh data
          }
        }
        
        // Fetch fresh data in the background
        const freshRoomData = await getRoomById(id);
        
        if (!freshRoomData) {
          if (!roomData) {
            setError('Room not found');
            setIsLoading(false);
          }
          return;
        }
        
        // Cache the fresh data
        localStorage.setItem(`room_${id}`, JSON.stringify(freshRoomData));
        
        // Update state with fresh data
        setRoom(freshRoomData);
        if (freshRoomData.images && freshRoomData.images.length > 0 && !selectedImage) {
          setSelectedImage(freshRoomData.images[0]);
        }
        setIsLoading(false);
        
        // Preload images in the background
        if (freshRoomData.images) {
          Promise.all(freshRoomData.images.map(url => preloadImage(url)))
            .then(() => {
              const loadedImages = freshRoomData.images.reduce((acc, url) => {
                acc[url] = true;
                return acc;
              }, {} as {[key: string]: boolean});
              setImagesLoaded(loadedImages);
            })
            .catch(err => console.error('Error preloading images:', err));
        }
      } catch (error) {
        console.error('Error loading room:', error);
        setError('Failed to load room details');
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [id, selectedImage]);

  // Function to display amenity icon
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FaWifi className="text-primary" />;
      case 'breakfast':
        return <FaUtensils className="text-primary" />;
      case 'pool':
        return <FaSwimmingPool className="text-primary" />;
      case 'parking':
        return <FaParking className="text-primary" />;
      case 'coffee':
        return <FaCoffee className="text-primary" />;
      case 'tv':
        return <FaTv className="text-primary" />;
      default:
        return null;
    }
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading && !room) {
    return (
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4 rounded-xl overflow-hidden h-64 md:h-96">
              <ImageSkeleton />
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-24 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-full"></div>
              <div className="h-64 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container py-16">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Room not found'}
          </h2>
          <p className="mb-6">The room you are looking for could not be found.</p>
          <Link to="/rooms" className="btn-primary">
            Browse All Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button 
          onClick={handleGoBack} 
          className="text-primary hover:underline flex items-center"
        >
          &larr; Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column for images and details */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className="mb-4 rounded-xl overflow-hidden h-64 md:h-96 relative">
            {!imagesLoaded[selectedImage || room.images[0]] && <ImageSkeleton />}
            <img 
              src={selectedImage || room.images[0] || 'https://via.placeholder.com/800x600?text=No+Image'} 
              alt={room.name} 
              className={`w-full h-full object-cover ${!imagesLoaded[selectedImage || room.images[0]] ? 'opacity-0' : 'opacity-100'}`}
              style={{ transition: 'opacity 0.3s ease-in-out' }}
              onLoad={() => {
                setImagesLoaded(prev => ({...prev, [selectedImage || room.images[0]]: true}));
              }}
              loading="eager" // Load this image immediately
            />
          </div>
          
          {/* Thumbnail gallery */}
          {room.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-6">
              {room.images.map((image, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer rounded-lg overflow-hidden h-20 relative ${
                    selectedImage === image ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  {!imagesLoaded[image] && <ImageSkeleton />}
                  <img 
                    src={image} 
                    alt={`${room.name} ${index + 1}`} 
                    className={`w-full h-full object-cover ${!imagesLoaded[image] ? 'opacity-0' : 'opacity-100'}`}
                    style={{ transition: 'opacity 0.3s ease-in-out' }}
                    onLoad={() => {
                      setImagesLoaded(prev => ({...prev, [image]: true}));
                    }}
                    loading="lazy" // Lazy load thumbnails
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Room details */}
          <div className="card mb-6">
            <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center text-gray-600">
                <FaBed className="mr-1" />
                <span className="capitalize">{room.type}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaUsers className="mr-1" />
                <span>{room.capacity} {room.capacity > 1 ? 'People' : 'Person'}</span>
              </div>
              <div className="text-gray-600">
                {room.size} m²
              </div>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <h3 className="text-xl font-bold mb-3">Description</h3>
              <p className="text-gray-700">{room.description}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    {getAmenityIcon(amenity)}
                    <span className="ml-2 text-gray-700 capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Additional information */}
          <div className="card">
            <h3 className="text-xl font-bold mb-3">Additional Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-40">Check-in:</span>
                <span>After 2:00 PM</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-40">Check-out:</span>
                <span>Before 11:00 AM</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-40">Pets:</span>
                <span>{room.pets ? 'Allowed' : 'Not allowed'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-40">Breakfast:</span>
                <span>{room.breakfast ? 'Included' : 'Not included'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column for booking */}
        <div>
          <div className="sticky top-24">
            <div className="card mb-4 bg-primary/5 border border-primary/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Price Details</h3>
                <div className="text-2xl font-bold text-primary">${room.price} <span className="text-sm text-gray-600 font-normal">/ night</span></div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 mb-2">Price includes:</p>
                <ul className="text-gray-700 space-y-1 mb-4">
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> All taxes and fees
                  </li>
                  {room.breakfast && (
                    <li className="flex items-center">
                      <span className="mr-2 text-green-500">✓</span> Breakfast included
                    </li>
                  )}
                  <li className="flex items-center">
                    <span className="mr-2 text-green-500">✓</span> Free cancellation up to 48 hours before check-in
                  </li>
                </ul>
              </div>
            </div>
            
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>}>
              <BookingForm room={room} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail; 