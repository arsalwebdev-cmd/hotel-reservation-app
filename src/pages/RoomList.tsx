// src/pages/RoomList.tsx
import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { getRooms } from '../services/roomService';
import SearchFilters from '../components/search/SearchFilters';

// Lazy load RoomCard component
const RoomCard = lazy(() => import('../components/room/RoomCard'));

const RoomList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedGuests = Math.max(1, Number(searchParams.get('guests')) || 2);
  const parseDateParam = (value: string | null) => {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const requestedCheckIn = parseDateParam(searchParams.get('checkIn'));
  const requestedCheckOut = parseDateParam(searchParams.get('checkOut'));
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({ guests: requestedGuests });
  const [page, setPage] = useState(1);
  const [filterVersion, setFilterVersion] = useState(0);
  const roomsPerPage = 6;
  
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const priceRange = activeFilters.priceRange || [0, 1000];
        const results = await getRooms({
          search: searchTerm,
          guests: activeFilters.guests ?? requestedGuests,
          type: activeFilters.roomType || 'any',
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          amenities: activeFilters.amenities || [],
          checkIn: activeFilters.checkIn || requestedCheckIn,
          checkOut: activeFilters.checkOut || requestedCheckOut,
          sort: sortBy,
        });
        if (active) setFilteredRooms(results);
      } catch (fetchError) {
        if (active) setError(fetchError instanceof Error ? fetchError.message : 'Could not load rooms. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    
    setPage(1);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchTerm, sortBy, activeFilters, requestedGuests, requestedCheckIn, requestedCheckOut]);
  
  const handleFilterChange = useCallback((filters: any) => setActiveFilters(filters), []);
  
  // Get current page of rooms
  const indexOfLastRoom = page * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveFilters({});
    setFilterVersion((version) => version + 1);
    setSearchParams({}, { replace: true });
  };

  return (
    <div id="room-listings" className="min-h-screen bg-stone-50 pb-16">
      <div className="container pt-10 sm:pt-14">
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=85)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/35"></div>
          <div className="relative z-10 max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Stay your way</p>
            <h1 className="mb-4 font-serif text-4xl font-medium leading-tight text-white sm:text-5xl">Find your room to unwind.</h1>
            <p className="max-w-xl leading-7 text-white/80">Thoughtful spaces, warm details, and room to feel at home. Explore the stay that fits you best.</p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs font-medium text-white/90">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">{dummyRooms.length} handpicked stays</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">From ${Math.min(...dummyRooms.map((room) => room.price))} per night</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container flex flex-col gap-7 lg:flex-row">
        {/* Left sidebar - Filters */}
        <div className="w-full lg:w-[290px] lg:shrink-0">
          <button
            type="button"
            aria-expanded={showFilters}
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4 flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm lg:hidden"
          >
            <span className="flex items-center">
              <FaFilter className="mr-2" /> Filters
            </span>
            <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`${showFilters ? 'block' : 'hidden'} sticky top-24 lg:block`}>
            <SearchFilters
              key={filterVersion}
              onFilterChange={handleFilterChange}
              initialGuests={requestedGuests}
              initialCheckIn={requestedCheckIn}
              initialCheckOut={requestedCheckOut}
            />
          </div>
        </div>
        
        {/* Main content - Room listings */}
        <div className="min-w-0 flex-1">
          {/* Search and sort controls */}
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm sm:flex-row">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-0 bg-stone-50 py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="sm:w-52">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border-0 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
          
          {/* Room count and active filters */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600"><span className="text-lg font-semibold text-slate-900">{filteredRooms.length}</span> stays found</p>
            
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          
          {/* Room grid */}
          {loading && filteredRooms.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-[360px] animate-pulse rounded-2xl bg-stone-200" />)}
            </div>
          ) : filteredRooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center shadow-sm">
              <p className="text-gray-600">No rooms match your current filters.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                <Suspense fallback={<div className="h-[360px] animate-pulse rounded-2xl bg-stone-200"></div>}>
                  {currentRooms.map(room => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </Suspense>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded ${
                        page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Prev
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-full ${
                          page === i + 1
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-3 py-1 rounded ${
                        page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomList;
