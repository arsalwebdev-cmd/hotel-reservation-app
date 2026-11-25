import { useState } from 'react';
import { FaRegClock, FaBed, FaAccessibleIcon, FaUtensils } from 'react-icons/fa';

interface SpecialRequestsProps {
  onRequestsChange: (requests: Record<string, boolean | string>) => void;
}

const SpecialRequests = ({ onRequestsChange }: SpecialRequestsProps) => {
  const [requests, setRequests] = useState({
    earlyCheckin: false,
    lateCheckout: false,
    extraBed: false,
    accessibility: false,
    quietRoom: false,
    highFloor: false,
    dietaryRequirements: '',
    otherRequests: ''
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const updatedRequests = {
      ...requests,
      [name]: checked
    };
    setRequests(updatedRequests);
    onRequestsChange(updatedRequests);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedRequests = {
      ...requests,
      [name]: value
    };
    setRequests(updatedRequests);
    onRequestsChange(updatedRequests);
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold mb-4">Special Requests</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <input
              id="earlyCheckin"
              name="earlyCheckin"
              type="checkbox"
              checked={requests.earlyCheckin}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-primary focus:ring-primary rounded mt-1"
            />
            <label htmlFor="earlyCheckin" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <FaRegClock className="mr-2" /> Early Check-in
              </span>
              <span className="text-xs text-gray-500">
                Subject to availability, additional fees may apply
              </span>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="lateCheckout"
              name="lateCheckout"
              type="checkbox"
              checked={requests.lateCheckout}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-primary focus:ring-primary rounded mt-1"
            />
            <label htmlFor="lateCheckout" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <FaRegClock className="mr-2" /> Late Check-out
              </span>
              <span className="text-xs text-gray-500">
                Subject to availability, additional fees may apply
              </span>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="extraBed"
              name="extraBed"
              type="checkbox"
              checked={requests.extraBed}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-primary focus:ring-primary rounded mt-1"
            />
            <label htmlFor="extraBed" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <FaBed className="mr-2" /> Extra Bed/Crib
              </span>
              <span className="text-xs text-gray-500">
                Additional fees may apply
              </span>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="accessibility"
              name="accessibility"
              type="checkbox"
              checked={requests.accessibility}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-primary focus:ring-primary rounded mt-1"
            />
            <label htmlFor="accessibility" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <FaAccessibleIcon className="mr-2" /> Accessibility Features
              </span>
              <span className="text-xs text-gray-500">
                Please specify needs in other requests section
              </span>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="quietRoom"
              name="quietRoom"
              type="checkbox"
              checked={requests.quietRoom}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-primary focus:ring-primary rounded mt-1"
            />
            <label htmlFor="quietRoom" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">Quiet Room</span>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              id="highFloor"
              name="highFloor"
              type="checkbox"
              checked={requests.highFloor}
              onChange={handleCheckboxChange}
              className="h-5 w-5 text-primary focus:ring-primary rounded mt-1"
            />
            <label htmlFor="highFloor" className="ml-3 block">
              <span className="text-sm font-medium text-gray-700">High Floor</span>
            </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="dietaryRequirements" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FaUtensils className="mr-2" /> Dietary Requirements
          </label>
          <textarea
            id="dietaryRequirements"
            name="dietaryRequirements"
            value={requests.dietaryRequirements}
            onChange={handleTextChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Please specify any dietary requirements or allergies"
          />
        </div>
        
        <div>
          <label htmlFor="otherRequests" className="block text-sm font-medium text-gray-700 mb-1">
            Other Requests
          </label>
          <textarea
            id="otherRequests"
            name="otherRequests"
            value={requests.otherRequests}
            onChange={handleTextChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Any other special requests (subject to availability)"
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        * All special requests are subject to availability and cannot be guaranteed.
      </p>
    </div>
  );
};

export default SpecialRequests;
