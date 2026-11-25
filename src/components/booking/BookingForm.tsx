import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Room } from '../../types';
import { createBooking, calculateTotalPrice, checkRoomAvailability } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';

interface BookingFormProps {
  room: Room;
}

const BookingForm = ({ room }: BookingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Today + 1 day as the default start date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Default end date is start date + 1 day
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  
  const [startDate, setStartDate] = useState<Date>(tomorrow);
  const [endDate, setEndDate] = useState<Date>(dayAfterTomorrow);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(room.price);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate total price whenever dates change
  useEffect(() => {
    setTotalPrice(calculateTotalPrice(room, startDate, endDate));
    
    // Check room availability
    const checkAvailability = async () => {
      const available = await checkRoomAvailability(room.id, startDate, endDate);
      setIsAvailable(available);
    };
    
    checkAvailability();
  }, [room, startDate, endDate]);
  
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      // Ensure end date is always after start date
      if (date >= endDate) {
        const newEndDate = new Date(date);
        newEndDate.setDate(date.getDate() + 1);
        setEndDate(newEndDate);
      }
    }
  };
  
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login', { state: { from: `/rooms/${room.id}` } });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the room is still available
      const available = await checkRoomAvailability(room.id, startDate, endDate);
      
      if (!available) {
        setError('This room is no longer available for the selected dates.');
        setIsAvailable(false);
        setIsLoading(false);
        return;
      }
      
      // Create the booking
      const booking = await createBooking({
        roomId: room.id,
        checkIn: startDate,
        checkOut: endDate,
        adults,
        children,
        guestName: user.displayName,
        guestEmail: user.email,
      });
      
      // Redirect to booking confirmation page
      navigate(`/bookings/${booking.id}/confirm`, { state: { booking } });
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while creating your booking. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Book This Room</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Check In</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              className="input"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Check Out</label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={new Date(startDate.getTime() + 86400000)}
              className="input"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Adults</label>
            <select
              value={adults}
              onChange={(e) => {
                const nextAdults = parseInt(e.target.value, 10);
                setAdults(nextAdults);
                setChildren((currentChildren) => Math.min(currentChildren, Math.max(0, room.capacity - nextAdults)));
              }}
              className="select"
              required
            >
              {[...Array(room.capacity)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Children</label>
            <select
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
              className="select"
            >
              {[...Array(Math.max(0, room.capacity - adults) + 1)].map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">
              ${room.price} x {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} nights
            </span>
            <span className="font-medium">${totalPrice}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">${totalPrice}</span>
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full btn-primary ${(!isAvailable || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isAvailable || isLoading}
        >
          {isLoading ? 'Processing...' : isAvailable ? 'Book Now' : 'Not Available'}
        </button>
        
        {!isAvailable && (
          <p className="text-red-500 text-sm">
            This room is not available for the selected dates. Please choose different dates.
          </p>
        )}
        
        <p className="text-gray-500 text-sm">
          You won't be charged yet. Payment will be collected at the property.
        </p>
      </form>
    </div>
  );
};

export default BookingForm; 
