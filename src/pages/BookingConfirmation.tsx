import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheck, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { getBookingById } from '../services/bookingService';
import type { Booking } from '../types';

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getBookingById(id)
      .then((result) => { if (active) setBooking(result); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load your booking.'); });
    return () => { active = false; };
  }, [id]);

  if (error) {
    return <div className="container py-20"><div role="alert" className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><h1 className="mb-3 font-serif text-3xl">We couldn’t open this booking</h1><p className="mb-6 text-sm">{error}</p><Link to="/bookings" className="btn-primary rounded-full">Go to my bookings</Link></div></div>;
  }

  if (!booking) {
    return <div className="container flex min-h-[360px] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-primary" aria-label="Loading booking" /></div>;
  }

  return (
    <div className="min-h-[65vh] bg-stone-50 py-14 sm:py-20">
      <div className="container max-w-3xl">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-7 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><FaCheck className="h-7 w-7" /></div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Your request is with us</p>
          <h1 className="mb-4 font-serif text-4xl font-medium text-slate-900 sm:text-5xl">Your stay is requested.</h1>
          <p className="mb-4 font-medium text-slate-700">{booking.roomName}</p>
          <p className="mx-auto mb-8 max-w-xl leading-7 text-slate-600">Your booking request has been saved. You can follow its status from your bookings page.</p>

          <div className="mb-8 grid gap-3 rounded-2xl bg-stone-50 p-5 text-left sm:grid-cols-2 sm:p-6">
            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Booking reference</p><p className="mt-1 font-semibold text-slate-900">{booking.bookingNumber || booking.id}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</p><p className="mt-1 font-semibold capitalize text-primary">{booking.status}</p></div>
            <div className="inline-flex items-start gap-2"><FaCalendarAlt className="mt-1 text-primary" /><p className="text-sm text-slate-700">{new Date(`${booking.startDate}T12:00:00`).toLocaleDateString()} – {new Date(`${booking.endDate}T12:00:00`).toLocaleDateString()}</p></div>
            <div className="inline-flex items-start gap-2"><FaUsers className="mt-1 text-primary" /><p className="text-sm text-slate-700">{booking.adults + booking.children} guests</p></div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/bookings" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">View my bookings</Link>
            <Link to="/rooms" className="rounded-full border border-stone-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary">Explore more rooms</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
