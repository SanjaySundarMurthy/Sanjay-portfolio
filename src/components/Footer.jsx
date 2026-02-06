import { motion } from 'framer-motion';
import { HiHeart, HiArrowUp } from 'react-icons/hi';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';

const Footer = ({ setCursorVariant }) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FaGithub, href: 'https://github.com/SanjaySundarMurthy', label: 'GitHub' },
    { icon: FaLinkedinIn, href: 'https://www.linkedin.com/in/sanjay-s-094586160/', label: 'LinkedIn' },
  ];

  const footerLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/5">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/50 to-transparent" />

      <div className="container-custom relative z-10 py-16 px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <motion.a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              onMouseEnter={() => setCursorVariant('text')}
              onMouseLeave={() => setCursorVariant('default')}
              className="inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <span
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  SS
                </span>
              </div>
              <span
                className="text-xl font-semibold text-white"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Sanjay S
              </span>
            </motion.a>
            <p className="text-dark-400 leading-relaxed max-w-sm">
              Crafting digital experiences that make a difference. Let's build
              something amazing together.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4
              className="text-white font-semibold"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onMouseEnter={() => setCursorVariant('button')}
                  onMouseLeave={() => setCursorVariant('default')}
                  whileHover={{ x: 5 }}
                  className="text-dark-400 hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4
              className="text-white font-semibold"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Stay Connected
            </h4>
            <p className="text-dark-400 text-sm">
              Follow me on social media for updates, tips, and behind-the-scenes content.
            </p>
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
                  className="p-3 rounded-xl glass text-dark-300 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm flex items-center gap-1">
            © {currentYear} Made with
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <HiHeart className="text-red-500" />
            </motion.span>
            by <span className="text-primary-400">Sanjay S</span>
          </p>

          {/* Back to top button */}
          <motion.button
            onClick={scrollToTop}
            onMouseEnter={() => setCursorVariant('button')}
            onMouseLeave={() => setCursorVariant('default')}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-dark-300 hover:text-primary-400 text-sm transition-all"
          >
            <HiArrowUp />
            Back to top
          </motion.button>
        </div>
      </div>

      {/* Large background text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none">
        <span
          className="text-[15vw] font-bold text-dark-900/50 tracking-tighter"
          style={{ fontFamily: 'Space Grotesk' }}
        >
          PORTFOLIO
        </span>
      </div>
    </footer>
  );
};

export default Footer;
