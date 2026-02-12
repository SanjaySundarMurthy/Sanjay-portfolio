import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import ParticleBackground from './components/ParticleBackground';
import Loader from './components/Loader';
import Chatbot from './components/Chatbot';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cursorVariant, setCursorVariant] = useState('default');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loader key="loader" />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <CustomCursor cursorVariant={cursorVariant} />
            <ParticleBackground />
            <Navbar setCursorVariant={setCursorVariant} />
            <main>
              <Hero setCursorVariant={setCursorVariant} />
              <About setCursorVariant={setCursorVariant} />
              <Skills setCursorVariant={setCursorVariant} />
              <Experience setCursorVariant={setCursorVariant} />
              <Projects setCursorVariant={setCursorVariant} />
              <Contact setCursorVariant={setCursorVariant} />
            </main>
            <Footer setCursorVariant={setCursorVariant} />
            <Chatbot />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
