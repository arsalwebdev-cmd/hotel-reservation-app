import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUtensils, FaSwimmingPool, FaSpa, FaCalendarAlt, FaAngleRight, FaMapMarkerAlt,
         FaPhoneAlt, FaEnvelope, FaStar, FaUsers, FaChevronLeft, FaChevronRight, FaSearch, FaBell } from 'react-icons/fa';
import { getRooms } from '../services/roomService';
import type { Room } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  // State for the booking widget
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  
  // State for image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showcaseRooms, setShowcaseRooms] = useState<Room[]>([]);
  
  const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  ];
  
  // Auto-advance gallery images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        prevIndex === hotelImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hotelImages.length]);

  useEffect(() => {
    let active = true;
    getRooms({ sort: 'recommended' })
      .then((rooms) => { if (active) setShowcaseRooms(rooms.slice(0, 3)); })
      .catch((error) => console.error('Could not load featured rooms:', error));
    return () => { active = false; };
  }, []);
  
  // Amenities features
  const features = [
    {
      icon: <FaSwimmingPool className="h-8 w-8" />,
      title: 'Infinity Pool',
      description: 'Stunning rooftop pool with panoramic city views.'
    },
    {
      icon: <FaSpa className="h-8 w-8" />,
      title: 'Luxury Spa',
      description: 'Indulge in premium treatments and relaxation therapies.'
    },
    {
      icon: <FaUtensils className="h-8 w-8" />,
      title: 'Fine Dining',
      description: 'Award-winning restaurants serving international cuisine.'
    },
    {
      icon: <FaBell className="h-8 w-8" />,
      title: '24/7 Concierge',
      description: 'Personalized service to enhance your stay experience.'
    }
  ];
  
  // Dining options
  const diningOptions = [
    {
      name: "The Grand Restaurant",
      type: "Fine Dining",
      description: "Experience exquisite international cuisine prepared by our award-winning chefs.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Azure Lounge",
      type: "Cocktail Bar",
      description: "Enjoy signature cocktails and premium spirits with stunning views of the city skyline.",
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
  
  // Guest reviews
  const reviews = [
    {
      name: "Emily Johnson",
      rating: 5,
      comment: "Absolutely amazing experience. The staff was attentive, the room was luxurious, and the facilities were top-notch.",
      date: "September 2023"
    },
    {
      name: "Michael Chen",
      rating: 5,
      comment: "One of the best hotels I've stayed at. The ocean view suite was breathtaking and worth every penny.",
      date: "October 2023"
    },
    {
      name: "Sarah Williams",
      rating: 4,
      comment: "Beautiful property with excellent amenities. The spa treatments were exceptional.",
      date: "August 2023"
    }
  ];

  // Function to preload next pages when user hovers over button
  const handlePreloadRooms = useCallback(() => {
    import('../pages/RoomDetail');
    import('../components/booking/BookingForm');
  }, []);
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ guests: String(adults + children) });
    const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (checkIn) params.set('checkIn', formatDate(checkIn));
    if (checkOut) params.set('checkOut', formatDate(checkOut));
    navigate(`/rooms?${params.toString()}`);
  };
  
  // Navigation for gallery
  const nextImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === hotelImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? hotelImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-white">
      {/* Hero Section with Gallery and Booking Widget */}
      <section className="relative isolate min-h-[900px] h-auto overflow-hidden bg-slate-950 sm:min-h-[780px] sm:h-[92vh] sm:max-h-[1000px]">
        {/* Image Gallery with Controls */}
        <div className="absolute inset-0 bg-black">
          {hotelImages.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-[opacity,transform] duration-[1200ms] ease-out ${
                currentImageIndex === index ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            ></div>
          ))}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-slate-950/10"></div>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/10"></div>
          
          {/* Gallery Navigation */}
          <button 
            aria-label="Previous hotel image"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-8"
            onClick={prevImage}
          >
            <FaChevronLeft className="h-6 w-6" />
          </button>
          <button 
            aria-label="Next hotel image"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-8"
            onClick={nextImage}
          >
            <FaChevronRight className="h-6 w-6" />
          </button>
          
          {/* Image Indicators */}
          <div className="absolute bottom-32 left-0 right-0 flex justify-center z-20 gap-2">
            {hotelImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show hotel image ${index + 1}`}
                aria-pressed={currentImageIndex === index}
                className={`h-2 w-2 rounded-full transition-all ${
                  currentImageIndex === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              ></button>
            ))}
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-20 mx-auto flex min-h-[610px] w-full max-w-7xl flex-col items-start justify-center px-6 pb-8 text-left text-white sm:h-full sm:min-h-0 sm:pb-40 sm:px-10 lg:px-12">
          <motion.div
            className="mb-16 max-w-3xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">
              <span className="h-px w-9 bg-amber-300" /> A quieter kind of city escape
            </p>
            <h1 className="mb-6 max-w-3xl font-serif text-5xl font-medium leading-[1.02] tracking-tight text-white drop-shadow-md sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Make room for <span className="font-normal italic text-amber-200">something</span> special.
            </h1>
            <p className="mb-8 max-w-xl text-base leading-7 text-white/85 drop-shadow-md sm:text-lg">
              Thoughtful rooms, warm hospitality, and the best of the city just beyond your door.
            </p>
            <Link to="/rooms" onMouseEnter={handlePreloadRooms} className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-slate-900 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-amber-100">
              Explore our rooms <FaAngleRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
        
        {/* Booking Widget */}
        <div className="relative z-30 px-2 pb-4 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:px-4 sm:pb-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)] ring-1 ring-black/5">
              <form onSubmit={handleSearchSubmit} className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Plan your stay</p>
                    <p className="mt-1 text-sm text-slate-500">Find the right room for your next visit</p>
                  </div>
                  <span className="hidden rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">Best rate, always</span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.15fr] lg:items-end">
                  {/* Check-in Date */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                    <div className="relative">
                      <DatePicker
                        selected={checkIn}
                        onChange={(date) => {
                          setCheckIn(date);
                          if (date && checkOut && date >= checkOut) {
                            const nextDay = new Date(date);
                            nextDay.setDate(nextDay.getDate() + 1);
                            setCheckOut(nextDay);
                          }
                        }}
                        selectsStart
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={new Date()}
                        placeholderText="Select date"
                        dateFormat="MMM d, yyyy"
                        className="w-full rounded-lg border border-stone-300 py-3 pl-10 pr-3 text-sm text-slate-800"
                      />
                      <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Check-out Date */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                    <div className="relative">
                      <DatePicker
                        selected={checkOut}
                        onChange={setCheckOut}
                        selectsEnd
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                        placeholderText="Select date"
                        dateFormat="MMM d, yyyy"
                        className="w-full rounded-lg border border-stone-300 py-3 pl-10 pr-3 text-sm text-slate-800"
                      />
                      <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <div className="flex rounded-lg border border-stone-300 divide-x divide-stone-200">
                      <div className="flex-1 px-3 py-2 text-center">
                        <span className="block text-xs text-gray-500">Adults</span>
                        <div className="flex justify-center items-center">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="text-gray-500 focus:outline-none"
                          >-</button>
                          <span className="px-2">{adults}</span>
                          <button
                            type="button"
                            onClick={() => setAdults(adults + 1)}
                            className="text-gray-500 focus:outline-none"
                          >+</button>
                        </div>
                      </div>
                      <div className="flex-1 px-3 py-2 text-center">
                        <span className="block text-xs text-gray-500">Children</span>
                        <div className="flex justify-center items-center">
                          <button
                            type="button"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="text-gray-500 focus:outline-none"
                          >-</button>
                          <span className="px-2">{children}</span>
                          <button
                            type="button"
                            onClick={() => setChildren(children + 1)}
                            className="text-gray-500 focus:outline-none"
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Search Button */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 font-semibold text-white transition hover:bg-primary-dark"
                      onMouseEnter={handlePreloadRooms}
                    >
                      <FaSearch aria-hidden="true" /> Find a room
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <motion.section className="bg-white py-24 sm:py-28" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65 }}>
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="max-w-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Stay a little differently</p>
              <h2 className="mb-6 font-serif text-4xl font-medium leading-tight text-slate-900 md:text-5xl">
                A thoughtful stay, from the moment you arrive.
              </h2>
              <div className="mb-6 h-px w-16 bg-amber-500"></div>
              <p className="mb-5 text-base leading-8 text-slate-600">
                Nestled in the heart of the city, our hotel combines elegant design, exceptional service, and premium amenities to create an unforgettable luxury experience for our guests.
              </p>
              <p className="mb-8 text-base leading-8 text-slate-600">
                With stunning views, world-class dining, and thoughtfully designed accommodations, we provide a sophisticated retreat for both business and leisure travelers. Our dedicated staff is committed to exceeding your expectations at every moment of your stay.
              </p>
              <Link 
                to="/about" 
                className="group inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary-dark"
              >
                Discover our story <FaAngleRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="relative grid grid-cols-2 items-center gap-4 sm:gap-6">
              <img src="https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=900&q=85" alt="Elegant hotel lobby" className="h-64 w-full rounded-2xl object-cover shadow-xl sm:h-80" />
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=85" alt="Warmly lit hotel lounge" className="mt-12 h-64 w-full rounded-2xl object-cover shadow-xl sm:mt-16 sm:h-80" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-xl border border-white/70 bg-white/95 px-5 py-3 text-center shadow-xl backdrop-blur sm:bottom-8">
                <p className="font-serif text-2xl font-semibold text-primary">Since 1998</p>
                <p className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-500">Hospitality with heart</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Room Showcase Section */}
      <motion.section className="bg-stone-100/80 py-24 sm:py-28" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65 }}>
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Find your place</p>
            <h2 className="mb-5 font-serif text-4xl font-medium text-slate-900 md:text-5xl">
              Rooms made for unwinding
            </h2>
            <div className="mx-auto mb-5 h-px w-16 bg-amber-500"></div>
            <p className="mx-auto max-w-2xl leading-7 text-slate-600">
              Choose from our selection of elegantly appointed rooms and suites, each offering premium amenities and exceptional comfort.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {showcaseRooms.map((room, index) => (
              <motion.div
                key={room.id}
                className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-2xl"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                whileHover={{ y: -6 }}
              >
                <div className="relative overflow-hidden">
                  <img src={room.images[0]} alt={room.name} className="h-64 w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary shadow-sm">{room.type}</span>
                  {room.featured && <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/65 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur"><FaStar className="text-amber-300" /> Guest favorite</span>}
                  <span className="absolute bottom-4 right-4 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">{room.size} m²</span>
                </div>
                <div className="p-6 sm:p-7">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="font-serif text-2xl font-medium text-slate-900">{room.name}</h3>
                    <div className="shrink-0 text-right font-semibold text-primary">${room.price}<span className="ml-1 text-xs font-normal text-slate-500">/night</span></div>
                  </div>
                  <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><FaUsers className="text-primary/80" /> Up to {room.capacity} guests</span>
                    {room.rating && <span className="inline-flex items-center gap-1.5"><FaStar className="text-amber-500" /> {room.rating.toFixed(1)} guest rating</span>}
                  </div>
                  <p className="mb-5 min-h-[3rem] text-sm leading-6 text-slate-600">{room.description}</p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {room.amenities.slice(0, 4).map((feature) => (
                      <span key={feature} className="rounded-full bg-stone-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 capitalize">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/rooms`} 
                    className="group/link flex items-center justify-center gap-2 rounded-lg border border-primary/20 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                    onMouseEnter={handlePreloadRooms}
                  >
                    View room <FaAngleRight className="transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/rooms" 
              className="inline-flex items-center text-primary font-medium hover:underline"
              onMouseEnter={handlePreloadRooms}
            >
              View All Accommodations <FaAngleRight className="ml-2" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Amenities Section */}
      <motion.section className="bg-white py-24 sm:py-28" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65 }}>
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Every detail considered</p>
            <h2 className="mb-5 font-serif text-4xl font-medium text-slate-900 md:text-5xl">
              Space to feel your best
            </h2>
            <div className="mx-auto mb-5 h-px w-16 bg-amber-500"></div>
            <p className="mx-auto max-w-2xl leading-7 text-slate-600">
              Indulge in our world-class facilities designed to enhance your stay and create memorable experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-7 text-left transition-colors hover:bg-white sm:p-8"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-serif text-xl font-medium text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Dining Section */}
      <motion.section className="bg-slate-950 py-24 text-white sm:py-28" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65 }}>
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">A taste of the good life</p>
            <h2 className="mb-5 font-serif text-4xl font-medium text-white md:text-5xl">
              Make an evening of it
            </h2>
            <div className="mx-auto mb-5 h-px w-16 bg-amber-300"></div>
            <p className="mx-auto max-w-2xl leading-7 text-slate-300">
              Savor extraordinary culinary creations at our award-winning restaurants and elegant bars.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {diningOptions.map((option, index) => (
              <motion.div
                key={index}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] md:flex"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="overflow-hidden md:w-1/2">
                  <img src={option.image} alt={option.name} className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 md:h-full" />
                </div>
                <div className="flex flex-col justify-center p-7 md:w-1/2 sm:p-8">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">{option.type}</span>
                  <h3 className="mb-3 mt-2 font-serif text-2xl font-medium text-white">{option.name}</h3>
                  <p className="mb-6 text-sm leading-7 text-slate-300">{option.description}</p>
                  <Link 
                    to="/about" 
                    className="group/link inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-amber-200"
                  >
                    Discover more <FaAngleRight className="transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Guest Reviews Section */}
      <motion.section className="bg-stone-100/80 py-24 sm:py-28" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65 }}>
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Kind words from our guests</p>
            <h2 className="mb-5 font-serif text-4xl font-medium text-slate-900 md:text-5xl">
              The moments that stay with you
            </h2>
            <div className="mx-auto h-px w-16 bg-amber-500"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-7 shadow-sm sm:p-8"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-5 flex items-center gap-1 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className={`${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="mb-8 flex-1 font-serif text-lg leading-8 text-slate-700">&ldquo;{review.comment}&rdquo;</p>
                <div className="flex items-center justify-between border-t border-stone-100 pt-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-semibold text-primary">{review.name.split(' ').map((part) => part[0]).join('')}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{review.date}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">Guest</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Location Section */}
      <motion.section className="bg-white py-24 sm:py-28" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65 }}>
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="max-w-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Right where you want to be</p>
              <h2 className="mb-6 font-serif text-4xl font-medium text-slate-900 md:text-5xl">
                The city is yours to explore.
              </h2>
              <div className="mb-6 h-px w-16 bg-amber-500"></div>
              <p className="mb-8 leading-8 text-slate-600">
                Located in the heart of the city, our hotel offers easy access to major attractions, shopping districts, and business centers. Enjoy the convenience of being minutes away from everything the city has to offer.
              </p>
              
              <ul className="mb-8 space-y-4">
                <li className="flex items-start gap-4 rounded-xl bg-stone-50 p-4">
                  <FaMapMarkerAlt className="mt-1 text-primary" />
                  <div>
                    <span className="block font-semibold">Address</span>
                    <span className="text-sm text-slate-600">123 Luxury Lane, Downtown, City 12345</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 rounded-xl bg-stone-50 p-4">
                  <FaPhoneAlt className="mt-1 text-primary" />
                  <div>
                    <span className="block font-semibold">Phone</span>
                    <span className="text-sm text-slate-600">+1 (555) 123-4567</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 rounded-xl bg-stone-50 p-4">
                  <FaEnvelope className="mt-1 text-primary" />
                  <div>
                    <span className="block font-semibold">Email</span>
                    <span className="text-sm text-slate-600">reservations@luxuryhotel.com</span>
                  </div>
                </li>
              </ul>
              
              <Link 
                to="/contact" 
                className="group inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary-dark"
              >
                Get directions <FaAngleRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/10">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85"
                  alt="Hotel exterior and surrounding grounds"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-cover bg-center py-24 text-white sm:py-32" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2070&q=85)' }}>
        <div className="absolute inset-0 bg-slate-950/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/50 to-primary/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="mx-auto max-w-3xl text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Your next escape starts here</p>
            <h2 className="mb-6 font-serif text-4xl font-medium text-white md:text-6xl">
              Experience Luxury Beyond Compare
            </h2>
            <p className="mx-auto mb-9 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Book your stay now and discover why our guests return year after year.
            </p>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-xl transition duration-300 hover:-translate-y-0.5 hover:bg-amber-100"
              onMouseEnter={handlePreloadRooms}
              onTouchStart={handlePreloadRooms}
            >
              Book your stay <FaAngleRight aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 
