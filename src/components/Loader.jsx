import { motion } from 'framer-motion';

const Loader = () => {
  const containerVariants = {
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  const letterVariants = {
    initial: { y: 100, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    }),
  };

  const name = 'PORTFOLIO';

  return (
    <motion.div
      variants={containerVariants}
      exit="exit"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-950"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.3 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 blur-3xl"
        />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-2xl shadow-primary-500/50">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-white"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              SS
            </motion.span>
          </div>
          
          {/* Orbiting dots */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-400" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-400" />
          </motion.div>
        </motion.div>

        {/* Animated text */}
        <div className="flex overflow-hidden">
          {name.split('').map((letter, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="initial"
              animate="animate"
              className="text-2xl md:text-3xl font-bold tracking-[0.3em] text-white"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-dark-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
