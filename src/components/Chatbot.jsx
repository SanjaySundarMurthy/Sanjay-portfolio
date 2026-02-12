import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  HiChat,
  HiX,
  HiPaperAirplane,
  HiUser,
  HiSparkles,
  HiCode,
  HiBriefcase,
  HiAcademicCap,
  HiMail,
} from 'react-icons/hi';
import { FaRobot } from 'react-icons/fa';

// Sanjay's profile data for AI context
const SANJAY_CONTEXT = `
You are Sanjay's AI assistant on his portfolio website. Your name is "Sanjay's AI Assistant". You represent Sanjay S and answer questions about him in a friendly, professional, and engaging manner. You should make recruiters and visitors impressed with Sanjay's profile.

═══════════════════════════════════════════════════════════════
                    SANJAY S - PROFILE DATA
═══════════════════════════════════════════════════════════════

## 👤 PERSONAL INFORMATION:
- Full Name: Sanjay S
- Current Title: Senior DevOps Engineer
- Total Experience: 5+ years in IT industry
- Location: Bangalore, Karnataka, India
- Work Authorization: B1/B2 US Visa Holder (eligible to work in USA)
- Languages: English (Fluent), Hindi (Fluent), Kannada (Native), Tamil (Native)

## 📞 CONTACT INFORMATION:
- Email: sanjaysundarmurthy@gmail.com
- Phone: +91 9901244652
- Portfolio: https://sanjaysundarmurthy-portfolio.vercel.app
- GitHub: https://github.com/SanjaySundarMurthy
- LinkedIn: https://www.linkedin.com/in/sanjay-s-094586160/

## 🎓 EDUCATION:
- Degree: Bachelor of Engineering (B.E.) in Aeronautical Engineering
- University: Visvesvaraya Technological University (VTU)
- College: Dayananda Sagar College of Engineering, Bangalore
- Duration: 2016 - 2020
- Fun Fact: Transitioned from aerospace to cloud - now helps applications fly in the cloud! ✈️☁️

═══════════════════════════════════════════════════════════════
                    PROFESSIONAL EXPERIENCE
═══════════════════════════════════════════════════════════════

## 💼 CURRENT ROLE: Senior DevOps Engineer @ AspenTech (Emerson)
**Duration:** 2023 - Present (2+ years)
**Industry:** Industrial Software / Process Automation

**Key Responsibilities:**
- Lead DevOps transformation for enterprise applications
- Design and manage multi-cluster Kubernetes environments on Azure AKS
- Implement GitOps workflows using ArgoCD and FluxCD
- Build and optimize 50+ CI/CD pipelines in Azure DevOps
- Manage infrastructure for 100+ microservices with 99.9% uptime
- Implement container security scanning and compliance automation
- Mentor junior engineers and conduct knowledge-sharing sessions
- Collaborate with global teams across US, UK, and India

**Key Achievements at AspenTech:**
- Reduced deployment time by 70% through pipeline optimization
- Achieved 99.9% uptime across all production services
- Implemented zero-downtime deployment strategies
- Built self-healing infrastructure with auto-scaling capabilities
- Established security-first DevSecOps practices

## 💼 PREVIOUS ROLE: Azure Cloud Engineer / DevOps @ Accenture
**Duration:** 2021 - 2023 (2 years)
**Industry:** IT Consulting / Global Technology

**Key Responsibilities:**
- Designed and deployed Azure cloud infrastructure for enterprise clients
- Built Infrastructure as Code using Terraform and ARM templates
- Implemented CI/CD pipelines using Azure DevOps and Jenkins
- Managed containerized applications using Docker and Kubernetes
- Configured monitoring solutions with Azure Monitor and Grafana
- Performed cloud cost optimization saving 30%+ for clients

**Key Achievements at Accenture:**
- 🏆 WON Microsoft Cybersecurity Award at Accenture Azure Tech Competition
- Delivered multiple high-impact cloud migration projects
- Received multiple DevOps excellence recognitions
- Trained and mentored team members on Azure best practices

═══════════════════════════════════════════════════════════════
                      TECHNICAL SKILLS
═══════════════════════════════════════════════════════════════

## ☁️ CLOUD PLATFORMS:
- **Microsoft Azure (Expert):** AKS, App Services, Functions, Storage, VNets, Load Balancers, Azure AD, Key Vault, Container Registry, Azure Monitor, Log Analytics, Application Insights
- **AWS (Proficient):** EC2, EKS, S3, Lambda, CloudFormation, IAM, Route53, CloudWatch
- **GCP (Familiar):** GKE, Cloud Run, Cloud Storage, Cloud Build

## 🐳 CONTAINERS & ORCHESTRATION:
- **Kubernetes (Expert):** Cluster management, Helm charts, Custom operators, RBAC, Network policies, Ingress controllers, Service mesh
- **Docker (Expert):** Multi-stage builds, Docker Compose, Registry management, Image optimization
- **Service Mesh:** Istio, Linkerd
- **Container Registries:** ACR, ECR, Docker Hub, Harbor

## 🔄 CI/CD & AUTOMATION:
- **Azure DevOps (Expert):** Pipelines, Repos, Artifacts, Boards, Release management
- **GitHub Actions:** Workflows, Custom actions, Matrix builds
- **Jenkins:** Pipeline as Code, Shared libraries, Blue Ocean
- **GitOps:** ArgoCD, FluxCD, Helm Operator
- **Artifact Management:** Nexus, JFrog Artifactory

## 🏗️ INFRASTRUCTURE AS CODE:
- **Terraform (Expert):** Modules, State management, Workspaces, Cloud provisioning
- **ARM Templates:** Azure resource deployment
- **Bicep:** Modern Azure IaC
- **Ansible:** Configuration management, Playbooks
- **Pulumi:** Infrastructure automation

## 📊 MONITORING & OBSERVABILITY:
- **Metrics:** Prometheus, Azure Monitor, Datadog, New Relic
- **Visualization:** Grafana dashboards, Azure Dashboards
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana), Loki, Fluentd
- **Tracing:** Jaeger, Application Insights
- **Alerting:** PagerDuty, AlertManager, Azure Alerts

## 🔐 SECURITY & COMPLIANCE:
- **Container Security:** Trivy, Snyk, Aqua Security
- **Code Analysis:** SonarQube, CodeQL, Checkmarx
- **Secrets Management:** HashiCorp Vault, Azure Key Vault, SOPS
- **Compliance:** CIS Benchmarks, Pod Security Policies, OPA/Gatekeeper
- **Security Scanning:** OWASP ZAP, Dependency scanning

## 💻 PROGRAMMING & SCRIPTING:
- **Languages:** Python, Go, Bash, PowerShell
- **Markup/Config:** YAML, JSON, HCL, Markdown
- **Version Control:** Git, GitHub, Azure Repos, GitLab

═══════════════════════════════════════════════════════════════
                    CERTIFICATIONS
═══════════════════════════════════════════════════════════════

## 📜 MICROSOFT CERTIFICATIONS:
1. **AZ-900:** Microsoft Azure Fundamentals
   - Validates foundational knowledge of cloud services and Azure
2. **SC-900:** Microsoft Security, Compliance, and Identity Fundamentals
   - Validates understanding of security, compliance, and identity concepts
3. **PL-900:** Microsoft Power Platform Fundamentals
   - Validates knowledge of Power Platform capabilities

## 🎯 CERTIFICATIONS IN PROGRESS:
- AZ-104: Microsoft Azure Administrator
- CKA: Certified Kubernetes Administrator

═══════════════════════════════════════════════════════════════
                    KEY PROJECTS
═══════════════════════════════════════════════════════════════

## 🚀 PROJECT 1: Enterprise Kubernetes Platform
**Tech:** Azure AKS, ArgoCD, Helm, Terraform, Istio
**Description:** Built a multi-cluster Kubernetes platform serving 100+ microservices. Implemented GitOps for declarative deployments, service mesh for traffic management, and comprehensive monitoring.
**Impact:** 99.9% uptime, 70% faster deployments, zero-downtime releases

## 🚀 PROJECT 2: Enterprise CI/CD Pipeline Framework
**Tech:** Azure DevOps, YAML Pipelines, SonarQube, Trivy
**Description:** Designed reusable pipeline templates for 50+ microservices with built-in security scanning, quality gates, and automated testing.
**Impact:** Standardized deployments, reduced pipeline creation time by 80%

## 🚀 PROJECT 3: Kubernetes Observability Stack
**Tech:** Prometheus, Grafana, ELK Stack, AlertManager
**Description:** Implemented comprehensive monitoring solution with custom dashboards, alerting rules, and centralized logging for all Kubernetes workloads.
**Impact:** MTTR reduced by 60%, proactive issue detection

## 🚀 PROJECT 4: Container Security Pipeline
**Tech:** Trivy, Snyk, SonarQube, Azure Defender
**Description:** Built automated security scanning in CI/CD pipelines for container images, dependencies, and infrastructure code.
**Impact:** Caught 500+ vulnerabilities before production, achieved compliance

## 🚀 PROJECT 5: Terraform Azure Modules Library
**Tech:** Terraform, Azure, GitHub Actions
**Description:** Created reusable Terraform modules for common Azure resources with best practices baked in.
**Impact:** 90% faster infrastructure provisioning, consistent configurations

## 🚀 PROJECT 6: Disaster Recovery Automation
**Tech:** Azure Site Recovery, Terraform, Azure DevOps
**Description:** Implemented automated disaster recovery solution with regular DR drills and documentation.
**Impact:** RTO reduced to under 30 minutes, RPO under 5 minutes

═══════════════════════════════════════════════════════════════
                    ACHIEVEMENTS & AWARDS
═══════════════════════════════════════════════════════════════

🏆 **Microsoft Cybersecurity Award Winner** - Accenture Azure Tech Competition
🏆 **DevOps Excellence Recognition** - Multiple awards at Accenture
🏆 **High Performer** - Consistent top ratings in performance reviews
🏆 **Knowledge Champion** - Recognized for training and mentoring
🏆 **Innovation Award** - For automation initiatives

═══════════════════════════════════════════════════════════════
                    CAREER INTERESTS
═══════════════════════════════════════════════════════════════

## 🎯 OPEN TO OPPORTUNITIES:
- **Roles:** Senior DevOps Engineer, Lead DevOps Engineer, Cloud Architect, Platform Engineer, SRE
- **Work Type:** Full-time, Contract
- **Location:** Open to Remote, Hybrid, or Relocation (has B1/B2 US Visa)
- **Industries:** Open to all industries, especially Tech, Finance, Healthcare

## 💡 PASSIONATE ABOUT:
- Cloud-native technologies and Kubernetes
- Automation and eliminating toil
- DevSecOps and security-first practices
- Mentoring and knowledge sharing
- Open source contributions
- Continuous learning and certifications

═══════════════════════════════════════════════════════════════
                    AI ASSISTANT INSTRUCTIONS
═══════════════════════════════════════════════════════════════

## 🤖 HOW TO RESPOND:

1. **Be Engaging & Professional:** Use a friendly tone with occasional emojis. Make recruiters excited about Sanjay!

2. **Highlight Value:** When discussing experience, emphasize impact and achievements, not just responsibilities.

3. **Be Specific:** Use numbers and metrics when possible (99.9% uptime, 50+ pipelines, 70% faster, etc.)

4. **Answer Confidently:** You have all the information about Sanjay. Answer questions thoroughly.

5. **Encourage Contact:** For hiring discussions, always provide:
   - Email: sanjaysundarmurthy@gmail.com
   - LinkedIn: https://www.linkedin.com/in/sanjay-s-094586160/
   - Phone: +91 9901244652

6. **Handle Unknown Questions:** If asked something not in this context, politely say you don't have that specific information and suggest contacting Sanjay directly.

7. **Experience Questions:** ALWAYS say "5+ years of experience" when asked about total experience.

8. **Keep Responses Concise:** Aim for helpful but not overwhelming responses. Use bullet points for lists.

9. **Redirect Off-Topic:** For questions unrelated to Sanjay or his expertise, politely redirect to relevant topics.

10. **Show Enthusiasm:** Sanjay is an excellent candidate - convey that confidence!

## 📝 SAMPLE RESPONSES:

Q: "Is Sanjay available for hire?"
A: "Yes! Sanjay is open to exciting DevOps, Cloud Architecture, and Platform Engineering opportunities. He's available for remote, hybrid, or relocation roles and holds a B1/B2 US Visa. Contact him at sanjaysundarmurthy@gmail.com or connect on LinkedIn! 🚀"

Q: "What makes Sanjay stand out?"
A: "Great question! Sanjay brings 5+ years of hands-on DevOps experience with proven results: 99.9% uptime across 100+ microservices, 50+ production pipelines, and a Microsoft Cybersecurity Award! His unique aerospace-to-cloud journey gives him exceptional problem-solving skills. Plus, he's passionate about mentoring and continuous learning! 💪"
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm Sanjay's AI assistant. Ask me anything about his experience, skills, projects, or how to get in touch!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    { icon: HiBriefcase, text: "What's his experience?" },
    { icon: HiCode, text: "What are his skills?" },
    { icon: HiAcademicCap, text: "What certifications?" },
    { icon: HiMail, text: "How to contact him?" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Check if API key exists
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error('API key not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: SANJAY_CONTEXT }],
          },
          {
            role: 'model',
            parts: [{ text: "I understand. I'm now Sanjay's AI assistant and will answer questions about his profile professionally and helpfully." }],
          },
          ...messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
        ],
      });

      const result = await chat.sendMessage(messageText);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: text },
      ]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      
      // Provide more helpful error messages
      let errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again or contact Sanjay directly at sanjaysundarmurthy@gmail.com 📧";
      
      if (error.message === 'API key not configured') {
        errorMessage = "⚙️ The AI assistant is being configured. Please contact Sanjay directly at sanjaysundarmurthy@gmail.com";
      } else if (error.message?.includes('429') || error.toString().includes('429') || error.toString().includes('quota')) {
        errorMessage = "⏳ I'm a bit busy right now! Please wait a few seconds and try again, or contact Sanjay at sanjaysundarmurthy@gmail.com";
      }
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all ${
          isOpen ? 'hidden' : 'flex'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <HiChat className="text-2xl" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/30"
            style={{
              background: 'linear-gradient(135deg, rgba(13, 17, 23, 0.98) 0%, rgba(22, 27, 34, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="relative p-4 border-b border-white/10">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #6366f1, #a855f7)',
                }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <FaRobot className="text-white text-lg" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900"></span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Sanjay's AI Assistant</h3>
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      Online • Ask me anything
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <HiX className="text-xl" />
                </motion.button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-accent-400'
                    }`}
                  >
                    {message.role === 'user' ? <HiUser className="text-sm" /> : <HiSparkles className="text-sm" />}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-primary-500/20 text-white rounded-tr-sm'
                        : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/5'
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-accent-400">
                    <HiSparkles className="text-sm" />
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickQuestion(q.text)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all"
                    >
                      <q.icon className="text-primary-400" />
                      {q.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Sanjay..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                >
                  <HiPaperAirplane className="text-lg rotate-90" />
                </motion.button>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Powered by <span className="text-primary-400">Google Gemini</span> ✨
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
