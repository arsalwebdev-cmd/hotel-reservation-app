// src/components/search/SearchFilters.tsx
import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import Slider from 'rc-slider';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-slider/assets/index.css';

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
  initialGuests?: number;
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
}

const SearchFilters = ({ onFilterChange, initialGuests = 2, initialCheckIn, initialCheckOut }: SearchFiltersProps) => {
  // Today + 1 day as the default check-in date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Default check-out date is check-in date + 2 days
  const defaultCheckout = new Date(tomorrow);
  defaultCheckout.setDate(defaultCheckout.getDate() + 2);
  
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn || tomorrow);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut || defaultCheckout);
  const [adults, setAdults] = useState(Math.max(1, initialGuests));
  const [children, setChildren] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    wifi: false,
    parking: false,
    breakfast: false,
    pool: false,
    spa: false,
    gym: false,
  });
  const [roomType, setRoomType] = useState('any');
  const [formReady, setFormReady] = useState(false);

  // Initialize filter values once on component load
  useEffect(() => {
    setFormReady(true);
  }, []);

  // Only trigger filter changes when form is ready
  useEffect(() => {
    if (!formReady) return;
    
    onFilterChange({
      checkIn,
      checkOut,
      guests: adults + children,
      priceRange,
      amenities: Object.keys(amenities).filter(key => amenities[key]),
      roomType
    });
  }, [checkIn, checkOut, adults, children, priceRange, amenities, roomType, formReady, onFilterChange]);

  const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAmenities({
      ...amenities,
      [name]: checked
    });
  };
  
  const handleCheckInChange = (date: Date | null) => {
    setCheckIn(date);
    
    // If checkout date is before or equal to new checkin date,
    // set checkout date to checkin date + 1 day
    if (date && checkOut && date >= checkOut) {
      const newCheckOut = new Date(date);
      newCheckOut.setDate(date.getDate() + 1);
      setCheckOut(newCheckOut);
    }
  };
  
  const handleCheckOutChange = (date: Date | null) => {
    // Only allow checkout date if it's after checkin date
    if (date && checkIn && date > checkIn) {
      setCheckOut(date);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 border-b border-stone-100 pb-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Make it yours</p>
        <h3 className="font-serif text-xl font-medium text-slate-900">Refine your stay</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Dates</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Check-in</label>
              <div className="relative">
                <DatePicker
                  selected={checkIn}
                  onChange={handleCheckInChange}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-2 text-sm text-slate-700"
                  placeholderText="Select date"
                  dateFormat="MMM d, yyyy"
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Check-out</label>
              <div className="relative">
                <DatePicker
                  selected={checkOut}
                  onChange={handleCheckOutChange}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-2 text-sm text-slate-700"
                  placeholderText="Select date"
                  dateFormat="MMM d, yyyy"
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Guests</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Adults</label>
              <div className="flex items-center overflow-hidden rounded-lg border border-stone-200">
                <button 
                  type="button" 
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="bg-stone-50 px-3 py-2 text-slate-600 transition hover:bg-stone-100 focus:outline-none"
                >
                  -
                </button>
                <div className="flex-1 py-2 text-center text-sm font-medium text-slate-700">{adults}</div>
                <button 
                  type="button" 
                  onClick={() => setAdults(Math.min(10, adults + 1))}
                  className="bg-stone-50 px-3 py-2 text-slate-600 transition hover:bg-stone-100 focus:outline-none"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Children</label>
              <div className="flex items-center overflow-hidden rounded-lg border border-stone-200">
                <button 
                  type="button" 
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="bg-stone-50 px-3 py-2 text-slate-600 transition hover:bg-stone-100 focus:outline-none"
                >
                  -
                </button>
                <div className="flex-1 py-2 text-center text-sm font-medium text-slate-700">{children}</div>
                <button 
                  type="button" 
                  onClick={() => setChildren(Math.min(6, children + 1))}
                  className="bg-stone-50 px-3 py-2 text-slate-600 transition hover:bg-stone-100 focus:outline-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Room type</h4>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
          >
            <option value="any">Any Type</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
          </select>
        </div>
        
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </h4>
          <Slider
            range
            min={0}
            max={1000}
            defaultValue={[0, 1000]}
            value={priceRange}
            onChange={(value) => setPriceRange(value as number[])}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>$0</span>
            <span>$1000+</span>
          </div>
        </div>
        
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Amenities</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(amenities).map((amenity) => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  id={amenity}
                  name={amenity}
                  checked={amenities[amenity]}
                  onChange={handleAmenityChange}
                  className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary"
                />
                <label htmlFor={amenity} className="ml-2 text-sm text-gray-700 capitalize">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              // Reset the form
              setCheckIn(initialCheckIn || tomorrow);
              setCheckOut(initialCheckOut || defaultCheckout);
              setAdults(Math.max(1, initialGuests));
              setChildren(0);
              setPriceRange([0, 1000]);
              setAmenities({
                wifi: false,
                parking: false,
                breakfast: false,
                pool: false,
                spa: false,
                gym: false,
              });
              setRoomType('any');
            }}
            className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
