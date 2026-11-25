import { useState } from 'react';
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhone, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

const contactDetails = [
  { icon: <FaPhone />, title: 'Call our team', detail: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { icon: <FaEnvelope />, title: 'Email us', detail: 'info@hotelapp.com', href: 'mailto:info@hotelapp.com' },
  { icon: <FaMapMarkerAlt />, title: 'Visit us', detail: '123 Hotel Street, City, Country' },
  { icon: <FaClock />, title: 'Front desk', detail: 'Available 24 hours a day' },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="overflow-hidden bg-stone-50">
      <section className="relative isolate flex min-h-[400px] items-center overflow-hidden bg-slate-950 sm:min-h-[470px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=2070&q=85)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/25" />
        <motion.div className="container relative z-10 py-20 text-white" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200"><span className="h-px w-9 bg-amber-300" />Contact Serein House</p>
          <h1 className="mb-5 max-w-3xl font-serif text-5xl font-medium leading-tight text-white sm:text-6xl">We’re here to make things easy.</h1>
          <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">Talk with our team about a reservation, a special request, or anything else you need.</p>
        </motion.div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container grid items-stretch gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
          <motion.aside className="relative overflow-hidden rounded-3xl bg-primary p-7 text-white shadow-xl sm:p-9" initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55 }}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rounded-full border border-white/10" />
            <div className="relative z-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Get in touch</p>
              <h2 className="mb-4 font-serif text-3xl font-medium text-white sm:text-4xl">Let’s talk about your stay.</h2>
              <p className="mb-8 max-w-md text-sm leading-7 text-white/75">A real person from our team is ready to help with your questions and plans.</p>

              <div className="divide-y divide-white/15">
                {contactDetails.map((item) => {
                  const detail = (
                    <>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-200">{item.icon}</span>
                      <span className="min-w-0">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">{item.title}</span>
                        <span className="block break-words text-sm font-medium leading-6 text-white">{item.detail}</span>
                      </span>
                    </>
                  );

                  return (
                    <div key={item.title} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      {item.href ? <a href={item.href} className="group flex min-w-0 items-center gap-4">{detail}</a> : <div className="flex min-w-0 items-center gap-4">{detail}</div>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5">
                <p className="mb-1 text-sm font-semibold text-white">Already staying with us?</p>
                <p className="text-xs leading-5 text-white/70">For immediate assistance, call the front desk any time.</p>
              </div>
            </div>
          </motion.aside>

          <motion.div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-9" initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55 }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Send a message</p>
            <h2 className="mb-3 font-serif text-3xl font-medium text-slate-900 sm:text-4xl">How can we help?</h2>
            <p className="mb-8 max-w-xl text-sm leading-7 text-slate-600">Fill out the form and share what you need. We’ll be glad to hear from you.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Your name</label>
                  <input id="name" name="name" type="text" autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" required />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" required />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Subject</label>
                <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} placeholder="What would you like to know?" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" required />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Your message</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Tell us how we can help..." className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-slate-800 transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10" required />
              </div>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md sm:w-auto">
                Send your message <FaPaperPlane className="text-xs" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <motion.section className="pb-16 sm:pb-24" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55 }}>
        <div className="container">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Find your way</p>
              <h2 className="font-serif text-3xl font-medium text-slate-900">Come and see us</h2>
            </div>
            <p className="text-sm text-slate-500">123 Hotel Street, City, Country</p>
          </div>
          <div className="h-[300px] overflow-hidden rounded-3xl border border-stone-200 bg-stone-200 shadow-lg sm:h-[400px]">
            <iframe
              title="Map showing the hotel neighborhood"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30591910525!2d-74.25986532999999!3d40.6971494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1641234567890!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Contact;
