import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaHotel, FaSignOutAlt, FaBook, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lightTheme = scrolled || location.pathname !== '/';
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect with a threshold
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/rooms', label: 'Rooms' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  // Use displayName or a fallback value
  const displayName = user?.displayName || 'Profile';
  const isLoggedIn = user !== null && user !== undefined;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (path: string) => {
    setShowDropdown(false);
    setIsOpen(false);
    navigate(path);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      {/* Fixed navbar wrapper with consistent width */}
      <div 
        ref={navbarRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 ${
          lightTheme
            ? 'bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm' 
            : 'bg-gradient-to-b from-black/55 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                <FaHotel className="h-5 w-5" />
              </span>
              <span className={`ml-3 text-xl font-semibold tracking-tight ${lightTheme ? 'text-slate-900' : 'text-white'}`}>
                Serein <span className={`font-normal ${lightTheme ? 'text-slate-500' : 'text-white/75'}`}>House</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2 py-2 text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? `${lightTheme ? 'text-primary' : 'text-white font-semibold'}`
                      : lightTheme
                        ? 'text-slate-600 hover:text-primary'
                        : 'text-white/90 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 ${lightTheme ? 'bg-primary' : 'bg-white'} transform origin-left transition-transform duration-300 ${
                    location.pathname === link.path ? 'scale-x-100' : 'scale-x-0'
                  }`}></span>
                </Link>
              ))}
              
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    type="button"
                    onClick={toggleDropdown}
                    className={`flex items-center space-x-2 ${
                      lightTheme ? 'text-slate-700' : 'text-white'
                    } ${lightTheme ? 'hover:text-primary' : 'hover:text-white/80'} px-3 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                      lightTheme
                        ? 'hover:bg-gray-100' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full ${scrolled ? 'bg-primary/90' : 'bg-primary'} flex items-center justify-center`}>
                      <FaUser className="text-white" />
                    </div>
                    <span>{displayName}</span>
                    <FaChevronDown className={`h-3 w-3 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDropdown && (
                    <div 
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-1.5 bg-white ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden"
                    >
                      <div className="animate-slideDown">
                        {isAdmin && (
                          <button
                            onClick={() => handleNavigation('/admin')}
                            className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <span className="w-8 inline-flex justify-center">👑</span>
                            <span>Admin Dashboard</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleNavigation('/bookings')}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FaBook className="w-8 inline-block text-gray-500" />
                          <span>My Bookings</span>
                        </button>
                        <button
                          onClick={() => handleNavigation('/profile')}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FaUser className="w-8 inline-block text-gray-500" />
                          <span>My Profile</span>
                        </button>
                        <hr className="my-1.5 border-gray-100" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FaSignOutAlt className="w-8 inline-block" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      scrolled 
                        ? 'text-slate-700 hover:text-primary' 
                        : 'text-white hover:text-white/80'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 focus:outline-none ${
                    lightTheme
                      ? 'text-slate-700 hover:text-primary hover:bg-stone-100' 
                    : 'text-white hover:text-white/80 hover:bg-white/10'
                }`}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden absolute left-0 right-0 transition-all duration-300 ease-in-out ${
            isOpen 
              ? 'opacity-100 translate-y-0 visible' 
              : 'opacity-0 -translate-y-4 invisible h-0'
          }`}
        >
          <div className="bg-white shadow-lg mt-2 rounded-b-xl mx-4 overflow-hidden">
            <div className="px-3 py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary/5 font-medium'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {isLoggedIn ? (
                <div className="pt-2 pb-3 border-t border-gray-100">
                  <div className="px-4 py-2 text-sm text-gray-500">Logged in as <span className="font-medium">{displayName}</span></div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className="flex w-full items-center px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <span className="w-8 inline-flex justify-center">👑</span>
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleNavigation('/bookings')}
                    className="flex w-full items-center px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-lg"
                  >
                    <FaBook className="w-8 inline-block text-gray-500" />
                    <span>My Bookings</span>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="flex w-full items-center px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-lg"
                  >
                    <FaUser className="w-8 inline-block text-gray-500" />
                    <span>My Profile</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-3 mt-2 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                  >
                    <FaSignOutAlt className="w-8 inline-block" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-100">
                  <div className="flex flex-col space-y-2 px-4">
                    <Link
                      to="/login"
                      className="w-full py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-lg flex items-center justify-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add padding to the page content to prevent it from going under the navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar; 
