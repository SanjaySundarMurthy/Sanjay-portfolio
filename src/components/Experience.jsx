import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiBriefcase, HiAcademicCap } from 'react-icons/hi';

const Experience = ({ setCursorVariant }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const experiences = [
    {
      type: 'work',
      title: 'Senior DevOps Engineer',
      company: 'AspenTech (Emerson)',
      period: '2023 - Present',
      description:
        'Leading cloud infrastructure initiatives on Azure, designing and implementing AKS clusters for enterprise applications. Architecting CI/CD pipelines with Azure DevOps and GitHub Actions (Enterprise-scale), reducing deployment times by 70%. Managing infrastructure as code using Terraform and ARM templates. Implementing observability solutions with Azure Monitor, Application Insights, and Grafana.',
      technologies: ['Azure', 'AKS', 'Terraform', 'Azure DevOps', 'GitHub Actions', 'Docker', 'Helm', 'Prometheus', 'Grafana'],
    },
    {
      type: 'work',
      title: 'Azure Cloud Engineer / DevOps Engineer',
      company: 'Accenture',
      period: '2021 - 2023',
      description:
        'Implemented containerization strategies using Docker and Kubernetes on Azure. Built automated CI/CD pipelines with Azure DevOps and Jenkins. Managed Azure infrastructure including App Services, AKS, ADF, Databricks, and Storage solutions. Developed monitoring solutions with Azure Monitor and Prometheus, achieving 99.9% uptime.',
      technologies: ['Azure', 'Docker', 'Kubernetes', 'Azure DevOps', 'Jenkins', 'Terraform', 'Prometheus', 'PowerShell'],
    },
    {
      type: 'education',
      title: 'B.E. Aeronautical Engineering',
      company: 'Dayananda Sagar College of Engineering (VTU)',
      period: '2016 - 2020',
      description:
        'Graduated with a degree in Aeronautical Engineering from Dayananda Sagar College of Engineering, affiliated to Visvesvaraya Technological University. Developed strong analytical and problem-solving skills. Self-taught programming and cloud technologies, transitioning into the DevOps domain with focus on Azure Cloud and automation.',
      technologies: ['Engineering Fundamentals', 'Problem Solving', 'Python', 'Linux', 'Cloud Computing'],
    },
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
    <section id="experience" className="section-padding relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

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
            Career Journey
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Space Grotesk' }}
            onMouseEnter={() => setCursorVariant('text')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            Experience & <span className="gradient-text">Education</span>
          </h2>
          <p className="max-w-2xl mx-auto text-dark-400 text-lg">
            My professional journey and the milestones that shaped my career.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500 to-primary-500 md:-translate-x-1/2" />

          {/* Timeline items */}
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: index * 0.2 + 0.5, type: 'spring' }}
                  className={`absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full flex items-center justify-center z-10 ${
                    exp.type === 'work'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                      : 'bg-gradient-to-br from-accent-500 to-accent-600'
                  } shadow-lg shadow-primary-500/25`}
                >
                  {exp.type === 'work' ? (
                    <HiBriefcase className="text-white text-sm" />
                  ) : (
                    <HiAcademicCap className="text-white text-sm" />
                  )}
                </motion.div>

                {/* Content card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  onMouseEnter={() => setCursorVariant('button')}
                  onMouseLeave={() => setCursorVariant('default')}
                  className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                    index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                  }`}
                >
                  <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group">
                    {/* Period badge */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                        exp.type === 'work'
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-accent-500/20 text-accent-400'
                      }`}
                    >
                      {exp.period}
                    </span>

                    <h3
                      className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors"
                      style={{ fontFamily: 'Space Grotesk' }}
                    >
                      {exp.title}
                    </h3>

                    <p className="text-dark-400 font-medium mb-4">{exp.company}</p>

                    <p className="text-dark-300 text-sm leading-relaxed mb-4">
                      {exp.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-dark-800/50 rounded-full text-xs text-dark-300 border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Empty space for alternating layout */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Experience;
