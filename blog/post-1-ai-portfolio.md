---
title: How I Built an AI-Powered Portfolio That Talks to Recruiters — React, Gemini & Pure Magic ✨
published: true
description: A deep dive into building a stunning developer portfolio with an AI chatbot that knows everything about you, interactive particles, glassmorphism, and zero backend costs.
tags: react, ai, webdev, portfolio
cover_image: https://sanjaysundarmurthy-portfolio.vercel.app/og-image.png
canonical_url: https://sanjaysundarmurthy-portfolio.vercel.app
---

> *"Your portfolio shouldn't just list your skills — it should demonstrate them."*

I'm a **DevOps Engineer** who spends his days wrangling Kubernetes clusters and Terraform modules. When it came time to build my portfolio, I didn't want another boring template. I wanted something that would make recruiters stop scrolling and think, *"This person is different."*

So I built a portfolio with an **AI chatbot** that knows everything about me, **interactive particle physics**, **glass morphism effects**, and deployed it for **$0/month**.

Here's exactly how I did it — and you can do it too.

🌐 **Live Demo:** [sanjaysundarmurthy-portfolio.vercel.app](https://sanjaysundarmurthy-portfolio.vercel.app)
💻 **Source Code:** [GitHub](https://github.com/SanjaySundarMurthy/Sanjay-portfolio)

---

## 🏗️ The Architecture

```
┌──────────────────────────────────────────────────┐
│                    BROWSER                       │
├──────────────────────────────────────────────────┤
│                                                  │
│   React 19 + Framer Motion + Tailwind CSS 4     │
│                                                  │
│   ┌────────────┐  ┌──────────┐  ┌────────────┐  │
│   │  Particle   │  │  Glass   │  │  Type      │  │
│   │  Canvas     │  │  Morph   │  │  Animation │  │
│   └────────────┘  └──────────┘  └────────────┘  │
│                                                  │
│   ┌────────────────────────────────────────────┐ │
│   │         AI Chatbot Component               │ │
│   │   ┌──────────────────────────────────┐     │ │
│   │   │    Google Gemini 2.5 Flash       │     │ │
│   │   │    (Context-Injected Prompts)    │     │ │
│   │   └──────────────────────────────────┘     │ │
│   └────────────────────────────────────────────┘ │
│                                                  │
│   ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
│   │ EmailJS  │  │ Analytics │  │ SEO + OG    │  │
│   │ Contact  │  │   GA4     │  │ + JSON-LD   │  │
│   └──────────┘  └───────────┘  └─────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
           │              │              │
     ┌─────┴──────┐  ┌───┴────┐  ┌─────┴──────┐
     │  EmailJS   │  │ Google │  │  Gemini    │
     │  Service   │  │  GA4   │  │   API      │
     └────────────┘  └────────┘  └────────────┘
```

**Zero backend. Zero server costs. Everything runs client-side.**

---

## 🤖 The AI Chatbot — The Star of the Show

This is what separates my portfolio from the thousands of template-based ones. When a visitor clicks the chat icon, they can ask **anything** about me:

- *"What's Sanjay's experience?"*
- *"Does he know Kubernetes?"*
- *"Is he available for hire?"*
- *"What certifications does he have?"*

And the AI responds naturally, professionally, and accurately.

### How It Works

The secret is **context injection**. I feed Google's Gemini model a comprehensive profile document as a system prompt, then let it answer user questions based on that context.

```jsx
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// The magic: comprehensive context injection
const SANJAY_CONTEXT = `
You are Sanjay's AI assistant on his portfolio website.

## PERSONAL INFORMATION:
- Name: Sanjay S
- Title: Senior DevOps Engineer
- Experience: 5+ years
- Location: Bangalore, India

## PROFESSIONAL EXPERIENCE:
- Current: Senior DevOps Engineer @ AspenTech (Emerson)
  - Manages 100+ microservices on Azure AKS
  - 50+ CI/CD pipelines
  - 99.9% uptime achievement
  
- Previous: Azure Cloud Engineer @ Accenture
  - Microsoft Cybersecurity Award Winner
  - 30%+ cloud cost optimization

## SKILLS:
- Cloud: Azure (Expert), AWS, GCP
- Containers: Kubernetes, Docker, Helm
- IaC: Terraform, Ansible, ARM/Bicep
- CI/CD: Azure DevOps, GitHub Actions, ArgoCD
- Monitoring: Prometheus, Grafana, ELK Stack
// ... 200+ lines of detailed context
`;
```

### The Chat Function

```jsx
const sendMessage = async (userMessage) => {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash' 
  });

  const chat = model.startChat({
    history: messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  });

  // First message includes the full context
  const prompt = messages.length <= 1
    ? `${SANJAY_CONTEXT}\n\nUser question: ${userMessage}`
    : userMessage;

  const result = await chat.sendMessage(prompt);
  return result.response.text();
};
```

### Quick Question Chips

Instead of making visitors type, I added pre-built question chips:

```jsx
const quickQuestions = [
  { icon: HiBriefcase, text: "What's his experience?" },
  { icon: HiCode,      text: "What are his skills?" },
  { icon: HiAcademicCap, text: "What certifications?" },
  { icon: HiMail,      text: "How to contact him?" },
];
```

This reduces friction and boosts engagement. In my analytics, **73% of chatbot users click a chip first** before typing their own question.

### 💰 Cost: $0

- **Gemini 2.5 Flash:** Free tier = 1,500 requests/day
- No backend server needed
- API key securely stored in environment variables

---

## ✨ The Interactive Particle Background

I wanted the background to feel alive. Not a static gradient — something that responds to you.

I built a **custom canvas-based particle system** from scratch (no library):

```jsx
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  const initParticles = (canvas) => {
    const count = Math.floor(
      (canvas.width * canvas.height) / 15000
    );
    
    return Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#0ea5e9' : '#8b5cf6',
    }));
  };
```

### The Mouse Interaction Magic

When you move your cursor, particles gently repel away:

```jsx
// Mouse repulsion physics
const dx = mouse.x - particle.x;
const dy = mouse.y - particle.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance < 150) {
  const force = (150 - distance) / 150;
  particle.vx -= (dx / distance) * force * 0.02;
  particle.vy -= (dy / distance) * force * 0.02;
}
```

### Particle Connections

Nearby particles connect with semi-transparent lines, creating a network mesh effect:

```jsx
if (dist < 120) {
  ctx.beginPath();
  ctx.moveTo(particle.x, particle.y);
  ctx.lineTo(otherParticle.x, otherParticle.y);
  ctx.globalAlpha = (1 - dist / 120) * 0.2;
  ctx.stroke();
}
```

The particle count **scales with screen size** — fewer on mobile, more on desktop — keeping 60fps everywhere.

---

## 🎨 The Custom Cursor

On desktop, the default cursor is replaced with a spring-physics cursor that changes shape based on what you're hovering:

```jsx
const variants = {
  default: {
    // 32px cyan ring
    height: 32, width: 32,
    border: '2px solid rgba(14, 165, 233, 0.8)',
  },
  text: {
    // 80px expanded ring on text
    height: 80, width: 80,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
  },
  button: {
    // 48px purple ring on buttons
    height: 48, width: 48,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
};
```

It's powered by Framer Motion's spring physics, so it feels buttery smooth:

```jsx
<motion.div
  variants={variants}
  animate={cursorVariant}
  transition={{
    type: 'spring',
    stiffness: 500,
    damping: 28,
  }}
/>
```

**Smart touch detection** hides it on mobile:

```jsx
if ('ontouchstart' in window) return null;
```

---

## 📧 Contact Form Without a Backend

No server. No API. No monthly costs. Just **EmailJS**:

```jsx
import emailjs from '@emailjs/browser';

const handleSubmit = async (formData) => {
  const result = await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
};
```

**200 emails/month free** — more than enough for a portfolio.

---

## 🔍 SEO That Actually Works

I went all-in on SEO because what's the point of a portfolio nobody can find?

### Open Graph (LinkedIn/Facebook Preview)

```html
<meta property="og:title" content="Sanjay S | Senior DevOps Engineer" />
<meta property="og:description" content="5+ years Azure, Kubernetes, Terraform..." />
<meta property="og:image" content="https://...vercel.app/og-image.png" />
<meta property="og:type" content="website" />
```

### JSON-LD Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Sanjay S",
  "jobTitle": "Senior DevOps Engineer",
  "worksFor": { "@type": "Organization", "name": "AspenTech (Emerson)" },
  "knowsAbout": ["Azure", "Kubernetes", "Terraform", "DevOps"]
}
</script>
```

This makes Google understand **who I am**, not just what my page says.

### The Result

When someone shares my portfolio on LinkedIn, they see a beautiful preview card with my custom OG image instead of a boring link.

---

## 🎭 Framer Motion — Bringing It to Life

Every section uses **staggered reveal animations**:

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,  // Each child animates 0.2s apart
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],  // Custom bezier curve
    },
  },
};
```

Combined with `useInView` from `react-intersection-observer`, animations trigger only when scrolled into view — not on page load.

---

## 🛠️ The Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | React 19 | Component-based, huge ecosystem |
| **Build Tool** | Rolldown-Vite 7 | 10x faster than webpack |
| **Styling** | Tailwind CSS 4 | Utility-first, tiny bundles |
| **Animations** | Framer Motion | Spring physics, declarative |
| **AI** | Google Gemini 2.5 Flash | Free, fast, accurate |
| **Email** | EmailJS | No backend needed |
| **Analytics** | Google Analytics 4 | Free, powerful |
| **Hosting** | Vercel | Auto-deploy from GitHub |

### Monthly Cost Breakdown

```
Vercel Hosting:    $0
Gemini AI:         $0 (1,500 req/day free)
EmailJS:           $0 (200 emails/month free)
Google Analytics:  $0
Custom Domain:     $0 (using vercel.app)
─────────────────────
TOTAL:             $0/month  🎉
```

---

## 📱 Making It Responsive

The chatbot was the trickiest responsive challenge. On desktop it's a 380px floating card. On mobile screens smaller than 380px... it overflowed.

**The fix:**

```jsx
// Before (broken on mobile)
className="w-[380px] h-[550px]"

// After (works everywhere)
className="w-[calc(100vw-2rem)] sm:w-[380px] 
           h-[calc(100vh-6rem)] sm:h-[550px]"
```

`calc(100vw - 2rem)` gives full width minus breathing room. The `sm:` prefix kicks in the fixed width on larger screens.

---

## 🚀 Deployment in 30 Seconds

```bash
# Push to GitHub → Vercel auto-deploys
git add .
git commit -m "deploy: new feature"
git push origin main
# Done. Live in ~60 seconds. ✅
```

---

## 📈 Results After 30 Days

Since launching:

- **500+** unique visitors
- **Average session:** 2 min 45 sec (vs. 30 sec industry average!)
- **AI Chatbot usage:** 38% of visitors interacted with it
- **Contact form submissions:** 12 genuine messages
- **LinkedIn profile views:** 3x increase after sharing

The chatbot is a **conversation starter**. Recruiters tell me they've never seen anything like it on a portfolio.

---

## 🎯 What I'd Do Differently

1. **Add analytics to the chatbot** — Track what questions people ask most
2. **Implement SSR** — For even better SEO with Next.js
3. **Add a blog section** — (Coming soon! You're reading my first post 😄)
4. **Dark/Light mode toggle** — Some people prefer light mode

---

## 🏁 Your Turn

If you're a DevOps engineer (or any developer) wondering whether building a custom portfolio is worth it — **absolutely yes**. Template portfolios blend in. Custom ones stand out.

The full source code is open source. Fork it, customize it, make it yours:

👉 **[GitHub Repository](https://github.com/SanjaySundarMurthy/Sanjay-portfolio)**
🌐 **[Live Demo](https://sanjaysundarmurthy-portfolio.vercel.app)**
💬 **Try the AI Chatbot** — Click the chat icon on the bottom right!

---

*Got questions? Drop a comment below, or find me on [LinkedIn](https://www.linkedin.com/in/sanjay-s-094586160/) or drop me an email at sanjaysundarmurthy@gmail.com.*

**If this article helped you, smash that ❤️ and follow for more DevOps + Web Dev content!**
