import { Booking } from '../types';
import { User } from '../types/user';

const API_ENDPOINT = process.env.REACT_APP_EMAIL_API_ENDPOINT || 'https://api.youremailservice.com';

export interface EmailTemplate {
  type: 'booking_confirmation' | 'booking_reminder' | 'booking_modification' | 'booking_cancellation';
  recipient: string;
  data: Record<string, any>;
}

export const sendBookingConfirmation = async (booking: Booking, user: User) => {
  const template: EmailTemplate = {
    type: 'booking_confirmation',
    recipient: user.email,
    data: {
      bookingId: booking.id,
      userName: user.displayName,
      roomName: booking.roomName,
      checkIn: new Date(booking.startDate).toLocaleDateString(),
      checkOut: new Date(booking.endDate).toLocaleDateString(),
      guests: booking.adults + (booking.children || 0),
      totalPrice: booking.totalPrice,
      status: booking.status,
    }
  };
  
  return sendEmail(template);
};

export const sendBookingReminder = async (booking: Booking, user: User, daysRemaining: number) => {
  const template: EmailTemplate = {
    type: 'booking_reminder',
    recipient: user.email,
    data: {
      bookingId: booking.id,
      userName: user.displayName,
      roomName: booking.roomName,
      checkIn: new Date(booking.startDate).toLocaleDateString(),
      checkOut: new Date(booking.endDate).toLocaleDateString(),
      daysRemaining
    }
  };
  
  return sendEmail(template);
};

export const sendBookingModification = async (booking: Booking, user: User, changes: Record<string, any>) => {
  const template: EmailTemplate = {
    type: 'booking_modification',
    recipient: user.email,
    data: {
      bookingId: booking.id,
      userName: user.displayName,
      roomName: booking.roomName,
      checkIn: new Date(booking.startDate).toLocaleDateString(),
      checkOut: new Date(booking.endDate).toLocaleDateString(),
      changes
    }
  };
  
  return sendEmail(template);
};

export const sendBookingCancellation = async (booking: Booking, user: User) => {
  const template: EmailTemplate = {
    type: 'booking_cancellation',
    recipient: user.email,
    data: {
      bookingId: booking.id,
      userName: user.displayName,
      roomName: booking.roomName,
      refundAmount: booking.totalPrice // Assuming full refund, adjust as needed
    }
  };
  
  return sendEmail(template);
};

const sendEmail = async (template: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_EMAIL_API_KEY}`
      },
      body: JSON.stringify(template)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }
    
    return {
      success: true,
      messageId: data.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
