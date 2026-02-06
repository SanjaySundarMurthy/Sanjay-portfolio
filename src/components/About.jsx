import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiCode, HiLightningBolt, HiSparkles, HiUserGroup } from 'react-icons/hi';

const About = ({ setCursorVariant }) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const stats = [
    { number: '5+', label: 'Years Experience', icon: HiLightningBolt },
    { number: '20+', label: 'Projects Completed', icon: HiCode },
    { number: '30+', label: 'Happy Clients', icon: HiUserGroup },
    { number: '10+', label: 'Awards Won', icon: HiSparkles },
  ];

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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />

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
            About Me
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Space Grotesk' }}
            onMouseEnter={() => setCursorVariant('text')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            Transforming Infrastructure Into{' '}
            <span className="gradient-text">Scalable Solutions</span>
          </h2>
          <p className="max-w-2xl mx-auto text-dark-400 text-lg">
            A passionate DevOps engineer with expertise in cloud technologies and 
            a drive for automating everything.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image/Avatar Section */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative mx-auto w-full max-w-md">
              {/* Main image container */}
              <motion.div
                className="relative aspect-square rounded-3xl overflow-hidden glass p-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-500/20 via-dark-800 to-accent-500/20 flex items-center justify-center">
                  {/* Placeholder for actual image */}
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-6xl font-bold text-white animate-pulse-glow">
                      <span style={{ fontFamily: 'Space Grotesk' }}>SS</span>
                    </div>
                    <p className="text-dark-400 text-sm">Sanjay S</p>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 p-4 rounded-2xl glass-strong shadow-xl"
                >
                  <HiCode className="text-primary-400 text-2xl" />
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -left-4 p-4 rounded-2xl glass-strong shadow-xl"
                >
                  <HiSparkles className="text-accent-400 text-2xl" />
                </motion.div>
              </motion.div>

              {/* Decorative circles */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-primary-500/20 scale-110" />
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-accent-500/10 scale-125" />
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3
              className="text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: 'Space Grotesk' }}
              onMouseEnter={() => setCursorVariant('text')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              A Senior DevOps Engineer Based in India
            </h3>

            <div className="space-y-4 text-dark-300 leading-relaxed">
              <p>
                With over 5 years of experience in DevOps and cloud engineering, I specialize
                in designing and implementing robust CI/CD pipelines, container orchestration
                with Kubernetes, and cloud infrastructure on Azure. My journey began with a
                fascination for automation and has evolved into expertise in building scalable,
                resilient systems.
              </p>
              <p>
                I believe in the power of Infrastructure as Code and GitOps practices. Every
                deployment I architect is approached with security, reliability, and efficiency
                in mind, ensuring systems that perform flawlessly under any load.
              </p>
              <p>
                When I'm not optimizing pipelines, you'll find me exploring new cloud technologies,
                contributing to DevOps communities, or mentoring teams on best practices for
                modern infrastructure management.
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="glass rounded-xl p-4">
                <span className="text-dark-500 text-sm">Location</span>
                <p className="text-white font-medium">Bangalore, Karnataka</p>
              </div>
              <div className="glass rounded-xl p-4">
                <span className="text-dark-500 text-sm">Email</span>
                <p className="text-white font-medium text-sm">sanjaysundarmurthy@gmail.com</p>
              </div>
              <div className="glass rounded-xl p-4">
                <span className="text-dark-500 text-sm">Education</span>
                <p className="text-white font-medium">B.E. Aeronautical</p>
              </div>
              <div className="glass rounded-xl p-4">
                <span className="text-dark-500 text-sm">Work Authorization</span>
                <p className="text-white font-medium">B1/B2 US Visa Holder</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl p-6 text-center group hover:bg-primary-500/10 transition-all duration-300"
              whileHover={{ y: -10, scale: 1.02 }}
              onMouseEnter={() => setCursorVariant('button')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-accent-500/30 transition-all"
              >
                <stat.icon className="text-primary-400 text-xl" />
              </motion.div>
              <motion.h4
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-3xl md:text-4xl font-bold gradient-text mb-2"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                {stat.number}
              </motion.h4>
              <p className="text-dark-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default About;
