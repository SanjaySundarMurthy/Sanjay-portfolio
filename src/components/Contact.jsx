import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiPaperAirplane,
  HiCheck,
  HiExclamation,
} from 'react-icons/hi';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';

const Contact = ({ setCursorVariant }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactInfo = [
    {
      icon: HiMail,
      label: 'Email',
      value: 'sanjaysundarmurthy@gmail.com',
      href: 'mailto:sanjaysundarmurthy@gmail.com',
    },
    {
      icon: HiPhone,
      label: 'Phone',
      value: '+91 9901244652',
      href: 'tel:+919901244652',
    },
    {
      icon: HiLocationMarker,
      label: 'Location',
      value: 'Bangalore, Karnataka, India',
      href: '#',
    },
  ];

  const socialLinks = [
    { icon: FaGithub, href: 'https://github.com/SanjaySundarMurthy', label: 'GitHub' },
    { icon: FaLinkedinIn, href: 'https://www.linkedin.com/in/sanjay-s-094586160/', label: 'LinkedIn' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo purposes, always succeed
    setSubmitStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);

    // Reset status after 5 seconds
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <section id="contact" className="section-padding relative overflow-hidden bg-dark-900/50">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="container-custom relative z-10"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass text-primary-400 text-sm font-medium mb-4">
            Get In Touch
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Space Grotesk' }}
            onMouseEnter={() => setCursorVariant('text')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            Let's Work <span className="gradient-text">Together</span>
          </h2>
          <p className="max-w-2xl mx-auto text-dark-400 text-lg">
            Have a project in mind or just want to say hello? I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className="glass rounded-2xl p-6 md:p-8">
              <h3
                className="text-xl font-bold text-white mb-6"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Contact Information
              </h3>

              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    whileHover={{ x: 5 }}
                    onMouseEnter={() => setCursorVariant('button')}
                    onMouseLeave={() => setCursorVariant('default')}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-accent-500/30 transition-all">
                      <info.icon className="text-primary-400 text-xl" />
                    </div>
                    <div>
                      <span className="text-dark-500 text-sm">{info.label}</span>
                      <p className="text-white font-medium group-hover:text-primary-400 transition-colors">
                        {info.value}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-dark-500 text-sm mb-4">Find me on</p>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setCursorVariant('button')}
                      onMouseLeave={() => setCursorVariant('default')}
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-xl bg-dark-800/50 text-dark-300 hover:text-primary-400 hover:bg-primary-500/10 border border-white/5 transition-all"
                    >
                      <social.icon size={20} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 font-medium">Open to opportunities</span>
              </div>
              <p className="text-dark-400 text-sm">
                Interested in DevOps, Cloud, and Infrastructure roles
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-6 md:p-8"
            >
              <h3
                className="text-xl font-bold text-white mb-6"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Send a Message
              </h3>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-dark-300 text-sm">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-dark-800/50 rounded-xl border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-dark-300 text-sm">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-dark-800/50 rounded-xl border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2 mb-6">
                <label htmlFor="subject" className="text-dark-300 text-sm">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Project Discussion"
                  className="w-full px-4 py-3 bg-dark-800/50 rounded-xl border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-2 mb-6">
                <label htmlFor="message" className="text-dark-300 text-sm">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell me about your project..."
                  className="w-full px-4 py-3 bg-dark-800/50 rounded-xl border border-white/10 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                onMouseEnter={() => setCursorVariant('button')}
                onMouseLeave={() => setCursorVariant('default')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                  isSubmitting
                    ? 'bg-dark-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <HiPaperAirplane className="rotate-90" />
                    Send Message
                  </>
                )}
              </motion.button>

              {/* Status messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
                >
                  <HiCheck className="text-green-500 text-xl" />
                  <span className="text-green-400">
                    Message sent successfully! I'll get back to you soon.
                  </span>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                >
                  <HiExclamation className="text-red-500 text-xl" />
                  <span className="text-red-400">
                    Something went wrong. Please try again.
                  </span>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
