import { FaAward, FaHotel, FaStar, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stats = [
  { number: '100+', label: 'Rooms' },
  { number: '50+', label: 'Staff members' },
  { number: '1,000+', label: 'Happy guests' },
  { number: '15+', label: 'Years of experience' },
];

const values = [
  {
    icon: <FaHotel className="h-6 w-6" />,
    title: 'Thoughtful excellence',
    description: 'We care about the small details that make a stay feel effortless, from a warm welcome to a restful night.',
  },
  {
    icon: <FaUsers className="h-6 w-6" />,
    title: 'Genuine hospitality',
    description: 'Every guest is welcomed with warmth, respect, and personal attention throughout their stay.',
  },
  {
    icon: <FaStar className="h-6 w-6" />,
    title: 'Quality that lasts',
    description: 'We keep raising our standards across our spaces, service, and the experiences we create.',
  },
];

const awards = [
  {
    title: 'Best Luxury Hotel 2023',
    description: 'Recognized by the International Hospitality Association for outstanding service and facilities.',
  },
  {
    title: 'Excellence in Service',
    description: 'Celebrated for exceptional customer care and guest satisfaction.',
  },
  {
    title: 'Sustainable Tourism',
    description: 'Commended for our commitment to responsible hospitality and thoughtful choices.',
  },
];

const About = () => (
  <div className="overflow-hidden bg-stone-50">
    <section className="relative isolate flex min-h-[390px] items-center overflow-hidden bg-slate-950 sm:min-h-[460px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2070&q=85)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/20" />
      <motion.div
        className="container relative z-10 py-20 text-white"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200"><span className="h-px w-9 bg-amber-300" />Our story</p>
        <h1 className="mb-5 max-w-3xl font-serif text-5xl font-medium leading-tight text-white sm:text-6xl">A stay shaped by care.</h1>
        <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">Learn about the people, values, and thoughtful touches behind every Serein House stay.</p>
      </motion.div>
    </section>

    <motion.section className="bg-white py-20 sm:py-28" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
      <div className="container grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
        <div className="relative grid grid-cols-[1.1fr_0.9fr] items-center gap-4 sm:gap-6">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1100&q=85" alt="Serein House hotel exterior" className="h-72 w-full rounded-2xl object-cover shadow-xl sm:h-[430px]" />
          <div className="space-y-4 pt-10 sm:space-y-6 sm:pt-16">
            <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=85" alt="A calm, thoughtfully prepared guest room" className="h-40 w-full rounded-2xl object-cover shadow-lg sm:h-56" />
            <div className="rounded-2xl bg-primary p-4 text-white shadow-lg sm:p-6">
              <p className="font-serif text-3xl font-medium sm:text-4xl">Since 2008</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/75 sm:text-xs">Hospitality with heart</p>
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">More than a place to stay</p>
          <h2 className="mb-5 font-serif text-4xl font-medium leading-tight text-slate-900 sm:text-5xl">A little more considered. A lot more personal.</h2>
          <div className="mb-6 h-px w-16 bg-amber-500" />
          <p className="mb-4 leading-8 text-slate-600">Founded in 2008, our hotel began as a small boutique retreat for travelers who value comfort, character, and a genuine welcome. Over the years, it has grown into a destination for guests from around the world.</p>
          <p className="mb-4 leading-8 text-slate-600">We bring modern comforts together with the warmth of traditional hospitality. Our team pays attention to the details that help you settle in, slow down, and enjoy your time in the city.</p>
          <p className="mb-8 leading-8 text-slate-600">As we continue to grow, the idea at the heart of Serein House stays the same: every guest deserves to feel looked after.</p>
          <Link to="/rooms" className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md">Explore our rooms <span className="transition-transform group-hover:translate-x-1">&rarr;</span></Link>
        </div>
      </div>
    </motion.section>

    <section className="bg-slate-950 py-14 text-white sm:py-16">
      <div className="container grid grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} className="text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}>
            <p className="font-serif text-4xl font-medium text-amber-200 sm:text-5xl">{stat.number}</p>
            <p className="mt-2 text-xs font-medium text-white/65 sm:text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>

    <motion.section className="py-20 sm:py-28" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }}>
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">What guides us</p>
          <h2 className="mb-4 font-serif text-4xl font-medium text-slate-900 sm:text-5xl">The values behind your stay</h2>
          <p className="leading-7 text-slate-600">The best hospitality feels natural. These are the principles we bring to every guest experience.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((value, index) => (
            <motion.article key={value.title} className="rounded-2xl border border-stone-200/80 bg-white p-7 shadow-sm transition hover:shadow-lg sm:p-8" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.1 }} whileHover={{ y: -5 }}>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">{value.icon}</div>
              <h3 className="mb-3 font-serif text-2xl font-medium text-slate-900">{value.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{value.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>

    <motion.section className="bg-white py-20 sm:py-28" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.6 }}>
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">A little recognition</p>
            <h2 className="font-serif text-4xl font-medium text-slate-900 sm:text-5xl">Awards & recognition</h2>
          </div>
          <p className="max-w-md leading-7 text-slate-600">We are grateful for the recognition that reflects our team's care and commitment.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {awards.map((award, index) => (
            <motion.article key={award.title} className="group rounded-2xl border border-stone-200/80 bg-stone-50 p-7 transition hover:border-primary/20 hover:bg-white hover:shadow-lg sm:p-8" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.1 }} whileHover={{ y: -4 }}>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><FaAward className="h-5 w-5" /></div>
              <h3 className="mb-3 font-serif text-xl font-medium text-slate-900">{award.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{award.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  </div>
);

export default About;
