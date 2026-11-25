import { Link } from 'react-router-dom';
import { FaFacebook, FaHotel, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-[#18251e] text-white">
    <div className="container grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:py-16">
      <div className="max-w-sm">
        <Link to="/" className="mb-5 inline-flex items-center gap-3" aria-label="Serein House home">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"><FaHotel /></span>
          <span className="text-xl font-semibold tracking-tight">Serein <span className="font-normal text-white/65">House</span></span>
        </Link>
        <p className="text-sm leading-7 text-white/65">A considered city retreat, shaped around thoughtful details, warm hospitality and room to slow down.</p>
        <div className="mt-6 flex gap-3">
          {[
            { label: 'Instagram', href: 'https://instagram.com', Icon: FaInstagram },
            { label: 'Facebook', href: 'https://facebook.com', Icon: FaFacebook },
            { label: 'LinkedIn', href: 'https://linkedin.com', Icon: FaLinkedin },
          ].map(({ label, href, Icon }) => (
            <a key={label} aria-label={label} href={href} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white/40 hover:text-white">
              <Icon />
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Explore</h2>
        <ul className="space-y-3 text-sm text-white/75">
          <li><Link className="transition hover:text-white" to="/rooms">Rooms & suites</Link></li>
          <li><Link className="transition hover:text-white" to="/about">Our story</Link></li>
          <li><Link className="transition hover:text-white" to="/contact">Contact</Link></li>
          <li><Link className="transition hover:text-white" to="/bookings">Your bookings</Link></li>
        </ul>
      </div>

      <div>
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Get in touch</h2>
        <ul className="space-y-4 text-sm text-white/75">
          <li className="flex items-start gap-3"><FaMapMarkerAlt className="mt-1 shrink-0 text-white/45" /><span>123 Luxury Lane<br />Downtown, City 12345</span></li>
          <li className="flex items-center gap-3"><FaPhoneAlt className="shrink-0 text-white/45" /><a href="tel:+15551234567" className="hover:text-white">+1 (555) 123-4567</a></li>
          <li className="pl-6"><a href="mailto:reservations@luxuryhotel.com" className="hover:text-white">reservations@luxuryhotel.com</a></li>
        </ul>
      </div>

      <div>
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">A better stay starts here</h2>
        <p className="mb-5 text-sm leading-6 text-white/65">Find a room that suits your stay and book directly with our team.</p>
        <Link to="/rooms" className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#18251e] transition hover:bg-stone-200">Explore rooms <span className="ml-2" aria-hidden="true">→</span></Link>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="container flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Serein House. All rights reserved.</span>
        <span>Thoughtful stays, made personal.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
