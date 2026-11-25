import { Link } from 'react-router-dom';
import { FaBed, FaCoffee, FaParking, FaStar, FaSwimmingPool, FaUsers, FaWifi } from 'react-icons/fa';
import { Room } from '../../types';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface RoomCardProps {
  room: Room;
}

const amenityIcons: Record<string, JSX.Element> = {
  wifi: <FaWifi />,
  breakfast: <FaCoffee />,
  pool: <FaSwimmingPool />,
  parking: <FaParking />,
};

const RoomCard = memo(({ room }: RoomCardProps) => {
  const image = room.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85';
  const typeLabel = room.type.charAt(0).toUpperCase() + room.type.slice(1);

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition duration-300 hover:shadow-xl"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/rooms/${room.id}`} className="relative block aspect-[1.45] overflow-hidden bg-stone-100" aria-label={`View ${room.name}`}>
        <img
          src={image}
          alt={room.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85';
          }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm">{typeLabel}</span>
        {room.featured && <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur"><FaStar className="text-amber-300" /> Featured</span>}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-serif text-xl font-medium leading-tight sm:text-2xl">{room.name}</h2>
          <p className="shrink-0 text-right text-primary"><span className="text-xl font-semibold">${room.price}</span><span className="ml-1 text-xs text-slate-500">/ night</span></p>
        </div>

        {room.rating && <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><FaStar className="text-amber-500" /> {room.rating.toFixed(1)} <span>guest rating</span></p>}

        <p className="mb-5 line-clamp-2 text-sm leading-6">{room.description}</p>

        <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><FaBed className="text-primary/70" />{typeLabel}</span>
          <span className="inline-flex items-center gap-1.5"><FaUsers className="text-primary/70" />Up to {room.capacity}</span>
          {room.amenities?.slice(0, 2).map((amenity) => (
            <span key={amenity} title={amenity} className="inline-flex items-center gap-1.5 capitalize">
              {amenityIcons[amenity.toLowerCase()] || <FaBed className="text-primary/70" />}{amenity}
            </span>
          ))}
        </div>

        <Link to={`/rooms/${room.id}`} className="mt-auto inline-flex w-full items-center justify-center rounded-lg border border-primary/20 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white">
          View room details <span className="ml-2" aria-hidden="true">→</span>
        </Link>
      </div>
    </motion.article>
  );
});

export default RoomCard;
