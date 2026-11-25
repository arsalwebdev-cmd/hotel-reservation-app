import { useState } from 'react';

const BookingManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Booking Management</h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-center text-gray-500 py-8">Booking management functionality will be implemented soon.</p>
        </div>
      )}
    </div>
  );
};

export default BookingManagement; 