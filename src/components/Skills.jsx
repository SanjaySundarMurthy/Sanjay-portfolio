import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  SiKubernetes,
  SiDocker,
  SiTerraform,
  SiAnsible,
  SiJenkins,
  SiGithubactions,
  SiPrometheus,
  SiGrafana,
  SiElasticsearch,
  SiLinux,
  SiPython,
  SiGit,
  SiHelm,
  SiArgo,
  SiNginx,
} from 'react-icons/si';
import { FaAws, FaMicrosoft } from 'react-icons/fa';

const Skills = ({ setCursorVariant }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const skillCategories = [
    {
      title: 'Cloud Platform',
      description: 'Microsoft Azure - App Services, AKS, ADF, Databricks, SQL, Storage, Monitor, VM, Key Vault',
      skills: [
        { name: 'Azure', icon: FaMicrosoft, level: 95, color: '#0078D4' },
        { name: 'AWS', icon: FaAws, level: 75, color: '#FF9900' },
      ],
    },
    {
      title: 'Containerization & Orchestration',
      description: 'Docker, Kubernetes (AKS), Helm, Networking, Ingress Controllers, Secrets & ConfigMaps, Scaling & HA',
      skills: [
        { name: 'Kubernetes', icon: SiKubernetes, level: 95, color: '#326CE5' },
        { name: 'Docker', icon: SiDocker, level: 92, color: '#2496ED' },
        { name: 'Helm', icon: SiHelm, level: 88, color: '#0F1689' },
        { name: 'ArgoCD', icon: SiArgo, level: 85, color: '#EF7B4D' },
      ],
    },
    {
      title: 'Infrastructure as Code',
      description: 'Terraform (modules, remote state, best practices), ARM Templates, Ansible',
      skills: [
        { name: 'Terraform', icon: SiTerraform, level: 92, color: '#7B42BC' },
        { name: 'Ansible', icon: SiAnsible, level: 88, color: '#EE0000' },
        { name: 'ARM Templates', icon: FaMicrosoft, level: 85, color: '#0078D4' },
      ],
    },
    {
      title: 'CI/CD & Dev Productivity',
      description: 'GitHub Actions (Enterprise-scale), Azure DevOps, Jenkins, Reusable Pipelines, GitOps, Release Automation',
      skills: [
        { name: 'Azure DevOps', icon: FaMicrosoft, level: 95, color: '#0078D4' },
        { name: 'GitHub Actions', icon: SiGithubactions, level: 92, color: '#2088FF' },
        { name: 'Jenkins', icon: SiJenkins, level: 85, color: '#D24939' },
        { name: 'Git', icon: SiGit, level: 95, color: '#F05032' },
      ],
    },
    {
      title: 'Observability & SRE',
      description: 'Azure Monitor, Application Insights, Prometheus, Grafana, ELK Stack, SLOs, SLIs, Incident Response',
      skills: [
        { name: 'Prometheus', icon: SiPrometheus, level: 88, color: '#E6522C' },
        { name: 'Grafana', icon: SiGrafana, level: 90, color: '#F46800' },
        { name: 'ELK Stack', icon: SiElasticsearch, level: 85, color: '#005571' },
      ],
    },
    {
      title: 'Scripting & Automation',
      description: 'Python, PowerShell, YAML, Bash for infrastructure and deployment automation',
      skills: [
        { name: 'Python', icon: SiPython, level: 88, color: '#3776AB' },
        { name: 'Linux/Bash', icon: SiLinux, level: 92, color: '#FCC624' },
        { name: 'PowerShell', icon: FaMicrosoft, level: 90, color: '#5391FE' },
        { name: 'Nginx', icon: SiNginx, level: 85, color: '#009639' },
      ],
    },
  ];

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
    <section id="skills" className="section-padding relative overflow-hidden bg-dark-900/50">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

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
            Technical Skills
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Space Grotesk' }}
            onMouseEnter={() => setCursorVariant('text')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            My <span className="gradient-text">Tech Stack</span>
          </h2>
          <p className="max-w-2xl mx-auto text-dark-400 text-lg">
            Constantly evolving and expanding my toolkit to build better, faster,
            and more scalable applications.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="space-y-12">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              variants={itemVariants}
              className="glass rounded-3xl p-6 md:p-8"
            >
              <div className="mb-8">
                <h3
                  className="text-xl md:text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  {category.title}
                </h3>
                <p className="text-dark-400">{category.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{
                      delay: categoryIndex * 0.2 + skillIndex * 0.1,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    onMouseEnter={() => setCursorVariant('button')}
                    onMouseLeave={() => setCursorVariant('default')}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ y: -8, scale: 1.05 }}
                      className="relative bg-dark-800/50 rounded-2xl p-4 flex flex-col items-center gap-3 border border-white/5 hover:border-primary-500/30 transition-all duration-300"
                    >
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl transition-all duration-300"
                        style={{ color: skill.color }}
                      >
                        <skill.icon />
                      </motion.div>

                      {/* Name */}
                      <span className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">
                        {skill.name}
                      </span>

                      {/* Level indicator */}
                      <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                          transition={{
                            delay: categoryIndex * 0.3 + skillIndex * 0.1 + 0.5,
                            duration: 1,
                            ease: 'easeOut',
                          }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
                          }}
                        />
                      </div>

                      {/* Level percentage tooltip */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-800 rounded text-xs text-white whitespace-nowrap"
                      >
                        {skill.level}%
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Also Experienced With - Highlighted Section */}
        <motion.div
          variants={itemVariants}
          className="mt-16"
        >
          <div className="glass rounded-2xl p-8 relative overflow-hidden border border-primary-500/20">
            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/30 to-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent-500/20 to-primary-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h4
                className="text-xl md:text-2xl font-bold text-white mb-8 text-center"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                <span className="gradient-text">Also Experienced With</span>
              </h4>
              
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { name: 'Azure Functions', category: 'azure' },
                  { name: 'Service Bus', category: 'azure' },
                  { name: 'Key Vault', category: 'azure' },
                  { name: 'Container Registry', category: 'azure' },
                  { name: 'Log Analytics', category: 'azure' },
                  { name: 'Application Insights', category: 'azure' },
                  { name: 'App Service', category: 'azure' },
                  { name: 'Azure SQL', category: 'azure' },
                  { name: 'Databricks', category: 'azure' },
                  { name: 'ADF', category: 'azure' },
                  { name: 'Virtual Networks', category: 'azure' },
                  { name: 'Azure Repos', category: 'azure' },
                  { name: 'SonarQube', category: 'security' },
                  { name: 'CodeQL', category: 'security' },
                  { name: 'Trivy', category: 'security' },
                  { name: 'SSL/TLS', category: 'security' },
                  { name: 'Secrets Management', category: 'security' },
                  { name: 'JFrog Artifactory', category: 'tools' },
                  { name: 'Nexus', category: 'tools' },
                  { name: 'NPM Monorepos', category: 'tools' },
                  { name: 'Docker Registries', category: 'tools' },
                  { name: 'Jira', category: 'other' },
                  { name: 'ServiceNow', category: 'other' },
                  { name: 'Confluence', category: 'other' },
                  { name: 'Agile/Scrum', category: 'other' },
                  { name: 'MLOps Fundamentals', category: 'ai' },
                  { name: 'LLM Tooling', category: 'ai' },
                  { name: 'Model Deployment', category: 'ai' },
                  { name: 'Windows', category: 'os' },
                  { name: 'Linux', category: 'os' },
                ].map((skill, index) => (
                  <motion.span
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 1.2 + index * 0.03 }}
                    whileHover={{ 
                      scale: 1.1, 
                      y: -3,
                      boxShadow: '0 10px 30px -10px rgba(34, 211, 238, 0.3)'
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium cursor-default transition-all duration-300
                      ${skill.category === 'azure' 
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/40 text-blue-300 hover:border-blue-300 hover:text-blue-200' 
                        : skill.category === 'security'
                        ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/40 text-red-300 hover:border-red-300 hover:text-red-200'
                        : skill.category === 'tools'
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/40 text-orange-300 hover:border-orange-300 hover:text-orange-200'
                        : skill.category === 'ai'
                        ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-400/40 text-violet-300 hover:border-violet-300 hover:text-violet-200'
                        : skill.category === 'os'
                        ? 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border border-gray-400/40 text-gray-300 hover:border-gray-300 hover:text-gray-200'
                        : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 text-purple-300 hover:border-purple-300 hover:text-purple-200'
                      }`}
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
              
              <p className="text-center text-dark-400 text-sm mt-6">
                ...and continuously learning new technologies
              </p>
            </div>
          </div>
        </motion.div>

        {/* Certifications & Awards Section */}
        <motion.div
          variants={itemVariants}
          className="mt-16"
        >
          <div className="glass rounded-2xl p-8 relative overflow-hidden border border-accent-500/20">
            {/* Decorative gradients */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-accent-500/30 to-primary-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-primary-500/20 to-accent-500/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h4
                className="text-xl md:text-2xl font-bold text-white mb-8 text-center"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                <span className="gradient-text">Certifications & Awards</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { 
                    name: 'Microsoft Azure Fundamentals', 
                    code: 'AZ-900', 
                    type: 'cert',
                    icon: '🏆'
                  },
                  { 
                    name: 'Microsoft Security, Compliance & Identity', 
                    code: 'SC-900', 
                    type: 'cert',
                    icon: '🛡️'
                  },
                  { 
                    name: 'Microsoft Power Platform Fundamentals', 
                    code: 'PL-900', 
                    type: 'cert',
                    icon: '⚡'
                  },
                  { 
                    name: 'Microsoft Cybersecurity Award', 
                    code: 'Accenture Azure Tech Competition', 
                    type: 'award',
                    icon: '🥇'
                  },
                  { 
                    name: 'High-Impact DevOps Contributions', 
                    code: 'Multiple Awards & Recognitions', 
                    type: 'award',
                    icon: '⭐'
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.5 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                    }}
                    className={`p-4 rounded-xl cursor-default transition-all duration-300
                      ${item.type === 'cert'
                        ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 hover:border-blue-300/50'
                        : 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/30 hover:border-amber-300/50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h5 className={`font-semibold text-sm ${item.type === 'cert' ? 'text-blue-300' : 'text-amber-300'}`}>
                          {item.name}
                        </h5>
                        <p className="text-dark-400 text-xs mt-1">{item.code}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Skills;
