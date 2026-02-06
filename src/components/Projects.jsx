import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HiExternalLink, HiCode, HiStar } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

const Projects = ({ setCursorVariant }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'infra', label: 'Infrastructure' },
    { id: 'cicd', label: 'CI/CD' },
    { id: 'monitoring', label: 'Monitoring' },
  ];

  const projects = [
    {
      id: 1,
      title: 'Enterprise Kubernetes Platform',
      description:
        'Designed and deployed a multi-cluster Kubernetes platform on Azure AKS with auto-scaling, RBAC, and GitOps-based deployments using ArgoCD.',
      image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
      category: 'infra',
      technologies: ['Azure AKS', 'Kubernetes', 'ArgoCD', 'Helm', 'Terraform'],
      liveUrl: '#',
      githubUrl: 'https://github.com/SanjaySundarMurthy/Enterprise-k8s-platform',
      featured: true,
    },
    {
      id: 2,
      title: 'CI/CD Pipeline Automation',
      description:
        'Built comprehensive CI/CD pipelines in Azure DevOps for 50+ microservices, reducing deployment time from hours to minutes with automated testing and security scanning.',
      image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
      category: 'cicd',
      technologies: ['Azure DevOps', 'Docker', 'SonarQube', 'Trivy', 'YAML'],
      liveUrl: '#',
      githubUrl: 'https://github.com/SanjaySundarMurthy/Azure-DevOps-Pipelines',
      featured: true,
    },
    {
      id: 3,
      title: 'Machine Learning Projects',
      description:
        'Collection of ML projects including predictive models, data analysis, and AI-powered solutions using Python, TensorFlow, and scikit-learn.',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
      category: 'monitoring',
      technologies: ['Python', 'TensorFlow', 'scikit-learn', 'Pandas', 'Jupyter'],
      liveUrl: '#',
      githubUrl: 'https://github.com/SanjaySundarMurthy/MachineLearningProjects',
      featured: true,
    },
    {
      id: 4,
      title: 'Observability Stack',
      description:
        'Implemented comprehensive monitoring solution with Prometheus, Grafana, and ELK stack, providing real-time insights and alerting for 100+ services.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      category: 'monitoring',
      technologies: ['Prometheus', 'Grafana', 'ELK Stack', 'AlertManager'],
      liveUrl: '#',
      githubUrl: 'https://github.com/SanjaySundarMurthy/k8s-observability-stack',
      featured: false,
    },
    {
      id: 5,
      title: 'Container Security Pipeline',
      description:
        'Developed automated container security scanning pipeline with vulnerability assessment, compliance checks, and automated remediation.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
      category: 'cicd',
      technologies: ['Trivy', 'Aqua Security', 'Azure DevOps', 'Docker'],
      liveUrl: '#',
      githubUrl: 'https://github.com/SanjaySundarMurthy/container-security-pipeline',
      featured: false,
    },
    {
      id: 6,
      title: 'Disaster Recovery Solution',
      description:
        'Architected and implemented cross-region disaster recovery solution with automated failover, achieving RPO of 5 minutes and RTO of 15 minutes.',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
      category: 'infra',
      technologies: ['Azure Site Recovery', 'Terraform', 'PowerShell', 'Azure Traffic Manager'],
      liveUrl: '#',
      githubUrl: 'https://github.com/SanjaySundarMurthy/azure-disaster-recovery',
      featured: false,
    },
  ];

  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="projects" className="section-padding relative overflow-hidden bg-dark-900/50">
      {/* Background decorations */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="container-custom relative z-10"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full glass text-primary-400 text-sm font-medium mb-4">
            Portfolio
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Space Grotesk' }}
            onMouseEnter={() => setCursorVariant('text')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="max-w-2xl mx-auto text-dark-400 text-lg">
            A selection of my recent work that showcases my skills and passion for
            creating exceptional digital experiences.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              onMouseEnter={() => setCursorVariant('button')}
              onMouseLeave={() => setCursorVariant('default')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25'
                  : 'glass text-dark-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {filter.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onMouseEnter={() => setCursorVariant('button')}
                onMouseLeave={() => setCursorVariant('default')}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="glass rounded-2xl overflow-hidden h-full flex flex-col"
                >
                  {/* Project Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-60" />

                    {/* Featured badge */}
                    {project.featured && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-semibold text-white">
                        <HiStar className="text-sm" />
                        Featured
                      </div>
                    )}

                    {/* Overlay links */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-dark-950/60 backdrop-blur-sm">
                      <motion.a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/50"
                      >
                        <HiExternalLink size={24} />
                      </motion.a>
                      <motion.a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 rounded-full bg-dark-800 text-white border border-white/10 shadow-lg"
                      >
                        <FaGithub size={24} />
                      </motion.a>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3
                      className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors"
                      style={{ fontFamily: 'Space Grotesk' }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-dark-400 text-sm leading-relaxed mb-4 flex-1">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="flex items-center gap-1 px-2 py-1 bg-dark-800/50 rounded-lg text-xs text-dark-300 border border-white/5"
                        >
                          <HiCode className="text-primary-400" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View all button */}
        <motion.div variants={itemVariants} className="text-center mt-12">
          <motion.a
            href="https://github.com/SanjaySundarMurthy"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setCursorVariant('button')}
            onMouseLeave={() => setCursorVariant('default')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 glass rounded-full text-white font-medium hover:bg-white/10 transition-all duration-300"
          >
            <FaGithub />
            View All Projects on GitHub
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Projects;
