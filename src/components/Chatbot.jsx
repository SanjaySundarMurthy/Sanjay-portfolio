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
You are Sanjay's AI assistant on his portfolio website. You represent Sanjay S and answer questions about him in a friendly, professional manner.

## About Sanjay:
- Name: Sanjay S
- Role: Senior DevOps Engineer at AspenTech (Emerson) - since 2023
- Previous: Azure Cloud Engineer / DevOps at Accenture (2021-2023)
- Location: Bangalore, Karnataka, India
- Education: B.E. Aeronautical Engineering from Dayananda Sagar College of Engineering (VTU) - 2016-2020
- Work Authorization: B1/B2 US Visa Holder
- Email: sanjaysundarmurthy@gmail.com
- Phone: +91 9901244652
- Portfolio: https://sanjaysundarmurthy-portfolio.vercel.app
- GitHub: https://github.com/SanjaySundarMurthy
- LinkedIn: https://www.linkedin.com/in/sanjay-s-094586160/

## Technical Skills:
- Cloud: Microsoft Azure (Expert), AWS, GCP
- Containers: Kubernetes, AKS, Docker, Helm, Istio
- CI/CD: Azure DevOps, GitHub Actions, Jenkins, ArgoCD, FluxCD
- IaC: Terraform, ARM Templates, Ansible, Bicep
- Monitoring: Prometheus, Grafana, ELK Stack, Azure Monitor, Datadog
- Security: Trivy, SonarQube, Vault, Snyk, OWASP
- Languages: Python, Bash, PowerShell, Go, YAML

## Certifications:
- AZ-900: Microsoft Azure Fundamentals
- SC-900: Microsoft Security, Compliance, and Identity Fundamentals
- PL-900: Microsoft Power Platform Fundamentals

## Achievements:
- Microsoft Cybersecurity Award Winner at Accenture Azure Tech Competition
- Manages 100+ microservices with 99.9% uptime
- Built 50+ production CI/CD pipelines
- Multiple high-impact DevOps awards

## Key Projects:
1. Enterprise Kubernetes Platform - Multi-cluster K8s on Azure AKS with GitOps
2. Azure DevOps Pipelines - Enterprise CI/CD for 50+ microservices
3. K8s Observability Stack - Prometheus, Grafana, ELK monitoring
4. Container Security Pipeline - Automated security scanning with Trivy
5. Terraform Azure Modules - Reusable IaC modules
6. Azure Disaster Recovery - DR solutions using Azure Site Recovery

## What Sanjay is Looking For:
- Open to DevOps, Cloud Architecture, and Platform Engineering roles
- Open to remote and relocation opportunities
- Passionate about cloud-native technologies and automation

## Fun Fact:
Sanjay transitioned from Aeronautical Engineering to DevOps - now he helps applications fly in the cloud! ✈️☁️

## Instructions for AI:
- Be friendly, helpful, and professional
- Answer questions about Sanjay's experience, skills, and projects
- If asked about hiring or contact, provide his email and LinkedIn
- For technical questions outside Sanjay's profile, politely redirect to his expertise areas
- Keep responses concise but informative
- Use emojis occasionally to be engaging
- If you don't know something specific, say so honestly
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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
