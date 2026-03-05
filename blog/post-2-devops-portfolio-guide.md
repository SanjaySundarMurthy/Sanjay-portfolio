---
title: The DevOps Engineer's Guide to Building a Portfolio That Actually Gets You Hired 🎯
published: true
description: A step-by-step technical guide for DevOps engineers to build a portfolio website that stands out. Includes architecture decisions, tech stack selection, and real code examples.
tags: devops, tutorial, webdev, career
cover_image: https://sanjaysundarmurthy-portfolio.vercel.app/og-image.png
---

> *"A DevOps engineer with a custom-built portfolio is like a chef who cooks their own meals — it demonstrates real skill, not just theory."*

Let's be honest: most DevOps engineer portfolios are either:

1. **Non-existent** — just a resume PDF
2. **A GitHub profile** — with green squares and no context
3. **A generic template** — that looks like everyone else's

I built something different, and it's getting me noticed. Here's how you can too.

🌐 **What we're building:** [Live Demo](https://sanjaysundarmurthy-portfolio.vercel.app)
💻 **Source Code:** [GitHub](https://github.com/SanjaySundarMurthy/Sanjay-portfolio)

---

## 🤔 "But I'm a DevOps Engineer, Not a Frontend Developer"

Neither am I. My day job is Kubernetes, Terraform, and CI/CD pipelines.

But that's exactly why this works. When a recruiter sees a DevOps engineer who **also** built an impressive web app with AI integration, they think:

> *"If this person can build this AND manage 100+ microservices, they're clearly a fast learner who gets things done."*

---

## 📋 Prerequisites

You don't need to be a React expert. You need:

| Skill | Level Required |
|-------|---------------|
| HTML/CSS | Basic understanding |
| JavaScript | Variables, functions, async/await |
| Git | Push, pull, branch |
| Terminal | Can run npm commands |
| React | We'll cover everything you need |

**Time required:** One weekend (8-12 hours)
**Cost:** $0 (zero, zip, nada)

---

## Step 1: Choose Your Tech Stack

Here's what I chose and **why**:

### React over HTML/CSS

```
HTML/CSS Site:
├── ✅ Simple
├── ✅ No build step
├── ❌ No components (lots of copy-paste)
├── ❌ No state management
├── ❌ Hard to add interactivity
└── ❌ Looks "basic"

React Site:
├── ✅ Component-based (reusable)
├── ✅ Rich ecosystem (animations, AI, forms)
├── ✅ Shows you can build real apps
├── ✅ Easy to add features later
├── ✅ Impressive to recruiters
└── ✅ Modern development experience
```

### Vite over Create React App

CRA is dead. Use Vite (or even better, Rolldown-Vite):

```bash
npm create vite@latest my-portfolio -- --template react
cd my-portfolio
npm install
npm run dev
# Running in 300ms vs CRA's 30 seconds
```

### Tailwind CSS over Plain CSS

As a DevOps engineer, I don't want to maintain CSS files. Tailwind lets me style directly in JSX:

```jsx
// Instead of switching between CSS files...
<div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 
                hover:border-cyan-500 transition-all duration-300">
  <h2 className="text-2xl font-bold text-white">About Me</h2>
</div>
```

---

## Step 2: The Section Blueprint

Every strong portfolio needs exactly these sections:

```
┌──────────────────────────────┐
│ 1. HERO                     │ ← First impression (3 seconds!)
│    Name, title, CTA buttons │
├──────────────────────────────┤
│ 2. ABOUT                    │ ← Your story + quick stats
│    Bio, metrics, info cards  │
├──────────────────────────────┤
│ 3. SKILLS                   │ ← Visual skill showcase
│    Categories + proficiency  │
├──────────────────────────────┤
│ 4. EXPERIENCE               │ ← Career timeline
│    Jobs + education          │
├──────────────────────────────┤
│ 5. PROJECTS                 │ ← What you've built
│    Cards with GitHub links   │
├──────────────────────────────┤
│ 6. CONTACT                  │ ← How to reach you
│    Form + social links       │
├──────────────────────────────┤
│ 7. FOOTER                   │ ← Credits & links
└──────────────────────────────┘
```

---

## Step 3: The Hero Section — Make or Break

A recruiter spends **3 seconds** deciding if your portfolio is worth exploring. The hero section needs to:

1. Show your name (clearly)
2. Show your title (with animation)
3. Have clear CTA buttons
4. Look visually stunning

### Adding a Type Animation

```bash
npm install react-type-animation
```

```jsx
import { TypeAnimation } from 'react-type-animation';

<TypeAnimation
  sequence={[
    'DevOps Engineer', 2000,
    'Cloud Architect', 2000,
    'Kubernetes Expert', 2000,
    'Automation Enthusiast', 2000,
  ]}
  wrapper="span"
  speed={50}
  repeat={Infinity}
  className="gradient-text text-4xl font-bold"
/>
```

This single animation makes your portfolio feel 10x more dynamic than a static title.

---

## Step 4: Add Scroll Animations

Install Framer Motion + Intersection Observer:

```bash
npm install framer-motion react-intersection-observer
```

### The Pattern (Use This Everywhere)

```jsx
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Section = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,  // Only animate once
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Your section content */}
    </motion.section>
  );
};
```

Now every section fades up as you scroll. Instant premium feel.

### Staggered Children

For grids and lists, stagger the animation:

```jsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="visible">
  {skills.map(skill => (
    <motion.div key={skill.name} variants={item}>
      {skill.name}
    </motion.div>
  ))}
</motion.div>
```

Each card appears one-by-one instead of all at once. Subtle but powerful.

---

## Step 5: The Dark Theme Formula

DevOps portfolios look best in dark mode. Here's the formula:

```css
/* Background: Near-black, not pure black */
--bg-primary: #0a0f1a;    /* Navy-black */
--bg-card: #111827;       /* Slightly lighter */
--bg-hover: #1f2937;      /* Hover state */

/* Accent: Cyan + Purple gradient */
--accent-primary: #0ea5e9;   /* Cyan */
--accent-secondary: #8b5cf6; /* Purple */

/* Text hierarchy */
--text-primary: #ffffff;      /* Headings */
--text-secondary: #94a3b8;   /* Body */
--text-muted: #64748b;       /* Subtle text */
```

### Glass Morphism Cards

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

This creates translucent cards that look modern and premium.

---

## Step 6: Deploy for $0

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "initial portfolio"
git push origin main

# 2. Go to vercel.com
# 3. Import your GitHub repo
# 4. Click Deploy
# 5. Done. You have a URL. 🎉
```

Vercel gives you:
- **Automatic HTTPS** ✅
- **Global CDN** ✅
- **Auto-deploy on git push** ✅
- **Custom domain support** ✅
- **Free forever** for personal projects ✅

---

## Step 7: Add the Differentiators

This is where you go from "another portfolio" to "**the** portfolio."

### Option A: AI Chatbot (My Approach)

Add Google Gemini to let visitors ask questions about you:

```bash
npm install @google/generative-ai
```

Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

The key insight: **inject your resume as context**, then let the AI answer naturally. Visitors can have a conversation with your portfolio.

[Read my detailed implementation guide →](https://dev.to/sanjaysundarmurthy/how-i-built-an-ai-powered-portfolio-that-talks-to-recruiters-react-gemini-pure-magic)

### Option B: Interactive Terminal

Make a fake terminal that responds to commands:

```
$ whoami
Sanjay S - Senior DevOps Engineer

$ cat skills.yml
cloud: [Azure, AWS]
containers: [Kubernetes, Docker]
iac: [Terraform, Ansible]

$ cat experience.json
{ "years": 5, "companies": ["AspenTech", "Accenture"] }
```

This is very on-brand for DevOps engineers. Recruiters love it.

### Option C: Live Infrastructure Dashboard

Show real-time stats (GitHub contributions, blog stats, etc.) using public APIs.

---

## Step 8: SEO + Analytics

Don't just build it — make sure it's **findable**.

### Must-Have SEO

```html
<!-- In index.html -->
<title>Your Name | Senior DevOps Engineer</title>
<meta name="description" content="5+ years Azure, K8s, Terraform..." />

<!-- Open Graph (LinkedIn preview) -->
<meta property="og:title" content="Your Name | DevOps Engineer" />
<meta property="og:image" content="/og-image.png" />

<!-- JSON-LD (Google rich results) -->
<script type="application/ld+json">
{
  "@type": "Person",
  "name": "Your Name",
  "jobTitle": "Senior DevOps Engineer"
}
</script>
```

### Google Analytics

```html
<!-- Free, takes 2 minutes -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
```

Now you can see exactly who's visiting your portfolio, from where, and what they're clicking.

---

## Step 9: The Contact Form (No Backend)

Use EmailJS to send emails directly from the browser:

```bash
npm install @emailjs/browser
```

```jsx
import emailjs from '@emailjs/browser';

emailjs.send(serviceId, templateId, {
  from_name: name,
  from_email: email,
  message: message,
}, publicKey);
```

**Setup time:** 15 minutes
**Cost:** Free (200 emails/month)
**Backend required:** None

---

## 🔟 The Final Checklist

Before sharing your portfolio:

- [ ] All sections complete and filled with real content
- [ ] Mobile responsive (test at 375px width)
- [ ] Fast loading (< 3 seconds)
- [ ] No console errors
- [ ] Contact form works
- [ ] Social links are correct
- [ ] OG image shows on LinkedIn (test with [Post Inspector](https://www.linkedin.com/post-inspector/))
- [ ] Google Analytics tracking
- [ ] README.md in GitHub repo
- [ ] Custom favicon (not the default React icon!)

---

## 🎯 Where to Share It

Once it's live:

| Platform | How | Expected Impact |
|----------|-----|-----------------|
| **LinkedIn** | Post with a story about building it | 🔥🔥🔥 High engagement |
| **GitHub** | Pin the repo on your profile | ⭐ Stars + visibility |
| **Resume** | Add URL under your name | 📧 Interview callbacks |
| **dev.to** | Write about the tech behind it | 👥 Community growth |
| **Twitter/X** | Share with #DevOps #BuildInPublic | 🌐 Reach new audiences |

---

## 📊 ROI of a Custom Portfolio

Real results from my portfolio launch:

```
Before Portfolio:
├── LinkedIn profile views: ~50/week
├── Recruiter messages: 2-3/month
├── Interview calls: 1/month
└── Differentiator: None

After Portfolio:
├── LinkedIn profile views: ~150/week (3x ↑)
├── Recruiter messages: 8-10/month (4x ↑)
├── Interview calls: 4-5/month (4x ↑)
└── Differentiator: "Your portfolio is incredible"
```

**Time invested:** 1 weekend
**Return:** Career-changing visibility

---

## 🏁 Start Building

You now have everything you need:

1. ✅ Tech stack decisions (React + Vite + Tailwind)
2. ✅ Section blueprint (7 essential sections)
3. ✅ Animation patterns (Framer Motion + scroll)
4. ✅ Design system (dark theme + glassmorphism)
5. ✅ Deployment ($0 on Vercel)
6. ✅ Differentiators (AI chatbot, terminal, dashboard)
7. ✅ SEO + Analytics (be findable + measurable)
8. ✅ Contact form (EmailJS, no backend)

**Fork my repo and start customizing:**
👉 [github.com/SanjaySundarMurthy/Sanjay-portfolio](https://github.com/SanjaySundarMurthy/Sanjay-portfolio)

Or build from scratch — either way, **just start**.

Your next recruiter is one Google search away from finding you.
Make sure what they find is impressive. 🚀

---

*Building your portfolio? Tag me [@sanjaysundarmurthy](https://dev.to/sanjaysundarmurthy) — I'd love to see what you build!*

**If this helped you, drop a ❤️ and share it with a fellow DevOps engineer who needs a portfolio!**
