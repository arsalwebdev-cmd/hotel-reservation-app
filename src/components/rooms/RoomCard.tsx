import { Link } from 'react-router-dom';
import { FaBed, FaUsers, FaWifi, FaUtensils, FaSwimmingPool, FaCoffee } from 'react-icons/fa';
import { Room } from '../../types';

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
  // Function to display amenity icon based on amenity name
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FaWifi className="text-primary" />;
      case 'breakfast':
        return <FaUtensils className="text-primary" />;
      case 'pool':
        return <FaSwimmingPool className="text-primary" />;
      case 'coffee':
        return <FaCoffee className="text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden rounded-t-xl h-48">
        <img
          src={room.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {room.featured && (
          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">{room.name}</h3>
          <p className="text-primary font-bold text-lg">${room.price}<span className="text-sm text-gray-600 font-normal">/night</span></p>
        </div>
        
        <p className="text-gray-600 line-clamp-2">{room.description}</p>
        
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="flex items-center">
            <FaBed className="mr-1" />
            <span>{room.type}</span>
          </div>
          <div className="flex items-center">
            <FaUsers className="mr-1" />
            <span>{room.capacity} {room.capacity === 1 ? 'Person' : 'People'}</span>
          </div>
          <div>
            {room.size} m²
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <div key={index} title={amenity} className="tooltip">
                  {getAmenityIcon(amenity)}
                </div>
              ))}
              {room.amenities.length > 4 && (
                <div className="text-xs text-gray-500">+{room.amenities.length - 4} more</div>
              )}
            </div>
            <Link to={`/rooms/${room.id}`} className="btn-primary text-sm">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 