import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaGoogle, FaFacebook } from 'react-icons/fa';

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 10) {
      setError('Password should be at least 10 characters');
      return;
    }
    
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await signUp(email, password, name);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle social sign up (placeholder)
  const handleSocialSignUp = (provider: string) => {
    // This would be implemented with actual social auth
    console.log(`Sign up with ${provider}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12 order-2 md:order-1">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h2>
            <p className="text-gray-600">
              Join us to enjoy exclusive benefits and faster bookings
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {/* Social Sign Up Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => handleSocialSignUp('google')}
              className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <FaGoogle className="text-red-500 mr-2" />
              <span className="text-gray-700">Google</span>
            </button>
            <button
              onClick={() => handleSocialSignUp('facebook')}
              className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <FaFacebook className="text-blue-600 mr-2" />
              <span className="text-gray-700">Facebook</span>
            </button>
          </div>
          
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-gray-300 w-full"></div>
            <div className="absolute bg-white px-3 text-sm text-gray-500">Or continue with</div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Enter your password"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <FaCheckCircle className={`mr-1 ${password.length >= 10 ? 'text-green-500' : 'text-gray-300'}`} />
                  Password must be at least 10 characters
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Confirm your password"
                  />
                </div>
                {password && confirmPassword && (
                  <p className="text-xs mt-1 flex items-center">
                    <FaCheckCircle className={`mr-1 ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={password === confirmPassword ? 'text-green-500' : 'text-red-500'}>
                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </p>
                )}
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:text-primary-dark">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary-dark">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:text-primary-dark">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative overflow-hidden order-1 md:order-2">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1606046604972-77cc76aee944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-black/40"></div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">Join Our Members</h1>
          <p className="text-xl mb-8 max-w-md text-white/95 drop-shadow">
            Create your account and unlock a world of exclusive benefits and personalized experiences.
          </p>
          <div className="bg-white/15 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-white drop-shadow-sm">Why Create an Account?</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary mr-3"></div>
                <span className="text-white/90 text-lg">Save your favorite hotels</span>
              </li>
              <li className="flex items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary mr-3"></div>
                <span className="text-white/90 text-lg">Receive special offers and discounts</span>
              </li>
              <li className="flex items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary mr-3"></div>
                <span className="text-white/90 text-lg">Faster booking process</span>
              </li>
              <li className="flex items-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary mr-3"></div>
                <span className="text-white/90 text-lg">Manage all your reservations in one place</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 
