# 🚀 Sanjay S - DevOps Engineer Portfolio

A stunning, modern, and responsive web portfolio built with React, Vite, and Tailwind CSS. This portfolio showcases my professional experience, technical skills, projects, and certifications as a Senior DevOps Engineer.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2.5-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css)

---

## ✨ Features

- **Modern UI/UX** - Sleek dark theme with cyan/purple gradient accents
- **Smooth Animations** - Powered by Framer Motion for stunning transitions
- **Interactive Elements** - Custom cursor effects, particle background, and hover animations
- **Fully Responsive** - Optimized for all screen sizes (mobile, tablet, desktop)
- **Fast Performance** - Built with Rolldown-Vite for lightning-fast builds
- **Contact Form** - Integrated with EmailJS for direct messaging
- **Downloadable Resume** - One-click PDF resume download

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, JSX |
| **Styling** | Tailwind CSS 4, Custom CSS |
| **Animations** | Framer Motion |
| **Build Tool** | Vite (Rolldown) |
| **Icons** | React Icons (Font Awesome, Simple Icons) |
| **Form Handling** | EmailJS |
| **Type Animation** | react-type-animation |

---

## 📁 Project Structure

```
Web-portfolio/
├── public/
│   ├── Sanjay_S_Resume.pdf    # Downloadable resume
│   └── vite.svg               # Favicon
├── src/
│   ├── assets/                # Static assets
│   ├── components/
│   │   ├── About.jsx          # About section with bio & stats
│   │   ├── Contact.jsx        # Contact form with EmailJS
│   │   ├── CustomCursor.jsx   # Interactive cursor effect
│   │   ├── Experience.jsx     # Timeline of work & education
│   │   ├── Footer.jsx         # Footer with social links
│   │   ├── Hero.jsx           # Landing section with CTA
│   │   ├── Loader.jsx         # Initial loading animation
│   │   ├── Navbar.jsx         # Responsive navigation
│   │   ├── ParticleBackground.jsx  # Animated background
│   │   ├── Projects.jsx       # Project showcase with GitHub links
│   │   └── Skills.jsx         # Technical skills & certifications
│   ├── App.jsx                # Main application component
│   ├── index.css              # Global styles & Tailwind config
│   └── main.jsx               # React entry point
├── .eslintrc.cjs              # ESLint configuration
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint flat config
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher) or **yarn**

### Step 1: Clone the Repository

```bash
git clone https://github.com/SanjaySundarMurthy/web-portfolio.git
cd web-portfolio
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19
- Tailwind CSS 4
- Framer Motion
- React Icons
- EmailJS
- And more...

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Open in Browser

Navigate to:
```
http://localhost:5173
```

You should see the portfolio running with hot module replacement (HMR) enabled.

---

## 📦 Build for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

This starts a local server to preview the production build.

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | Start development server with hot reload |
| **Build** | `npm run build` | Create optimized production build |
| **Preview** | `npm run preview` | Preview production build locally |
| **Lint** | `npm run lint` | Run ESLint for code quality checks |

---

## 🎨 Customization Guide

### 1. Update Personal Information

#### Hero Section (`src/components/Hero.jsx`)
- Name and title
- Introduction text
- Social media links
- Resume download link

#### About Section (`src/components/About.jsx`)
- Professional bio paragraphs
- Stats (years experience, projects completed, etc.)
- Location and email

#### Experience Section (`src/components/Experience.jsx`)
- Work history timeline
- Company names and roles
- Education details
- Technologies used at each position

#### Skills Section (`src/components/Skills.jsx`)
- Skill categories and proficiency levels
- "Also Experienced With" badges
- Certifications and awards

#### Projects Section (`src/components/Projects.jsx`)
- Project cards with descriptions
- GitHub repository links
- Technology tags

#### Contact Section (`src/components/Contact.jsx`)
- Email address
- Phone (optional)
- Location
- Social media links

### 2. Update Resume

Replace the file at:
```
public/Sanjay_S_Resume.pdf
```

### 3. Configure EmailJS (Contact Form)

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Update `src/components/Contact.jsx`:

```javascript
emailjs.sendForm(
  'YOUR_SERVICE_ID',     // Replace with your service ID
  'YOUR_TEMPLATE_ID',    // Replace with your template ID
  formRef.current,
  'YOUR_PUBLIC_KEY'      // Replace with your public key
)
```

### 4. Change Theme Colors

Edit `src/index.css` and modify the `@theme` section:

```css
@theme {
  --color-primary-*: /* Your primary color shades */
  --color-accent-*:  /* Your accent color shades */
  --color-dark-*:    /* Your dark theme shades */
}
```

---

## 🌐 Deployment Guide

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Deploy with default settings

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`

### Option 2: Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 3: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

2. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/web-portfolio/',
     // ... other config
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Option 4: Azure Static Web Apps

1. Push code to GitHub
2. Go to Azure Portal
3. Create a new Static Web App
4. Connect to your GitHub repository
5. Configure build settings:
   - App location: `/`
   - Output location: `dist`
   - Build command: `npm run build`

---

## 📱 Sections Overview

| Section | Description |
|---------|-------------|
| **Loader** | Animated loading screen with logo |
| **Navbar** | Responsive navigation with smooth scroll |
| **Hero** | Landing page with animated introduction and CTAs |
| **About** | Professional bio, stats, and quick info cards |
| **Skills** | Technical skills with progress bars, certifications & awards |
| **Experience** | Interactive timeline of work experience and education |
| **Projects** | Showcase of GitHub projects with descriptions |
| **Contact** | Contact form with EmailJS integration |
| **Footer** | Copyright and social media links |

---

## 🏆 Featured Skills & Certifications

### Technical Expertise

| Category | Skills |
|----------|--------|
| **Cloud Platform** | Microsoft Azure (AKS, ADF, Databricks, App Services, SQL, Storage, Monitor, VM, Key Vault) |
| **Containerization** | Docker, Kubernetes, Helm, ArgoCD, Ingress Controllers |
| **CI/CD** | Azure DevOps, GitHub Actions (Enterprise), Jenkins, GitOps |
| **Infrastructure as Code** | Terraform, Ansible, ARM Templates |
| **Observability** | Azure Monitor, Prometheus, Grafana, ELK Stack, Application Insights |
| **Security** | SonarQube, CodeQL, Trivy, SSL/TLS, Secrets Management |
| **Scripting** | Python, PowerShell, Bash, YAML |

### Microsoft Certifications

- 🏆 **AZ-900** - Microsoft Azure Fundamentals
- 🛡️ **SC-900** - Microsoft Security, Compliance & Identity
- ⚡ **PL-900** - Microsoft Power Platform Fundamentals

### Awards

- 🥇 Microsoft Cybersecurity Award - Accenture Azure Tech Competition
- ⭐ Multiple Awards for High-Impact DevOps Contributions

---

## 🔧 Troubleshooting

### Common Issues

**Port 5173 already in use:**
```bash
# Kill the process using port 5173
npx kill-port 5173
# Or run on different port
npm run dev -- --port 3000
```

**Node modules issues:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```bash
# Clear cache and rebuild
npm run build -- --force
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Sanjay S**

| | |
|---|---|
| 📍 **Location** | Bangalore, Karnataka, India |
| 💼 **Current Role** | Senior DevOps Engineer at AspenTech (Emerson) |
| 🎓 **Education** | B.E. Aeronautical Engineering - Dayananda Sagar College of Engineering (VTU) |
| 📧 **Email** | sanjaysundarmurthy@gmail.com |
| 🔗 **LinkedIn** | [linkedin.com/in/sanjay-s-094586160](https://www.linkedin.com/in/sanjay-s-094586160/) |
| 💻 **GitHub** | [github.com/SanjaySundarMurthy](https://github.com/SanjaySundarMurthy) |

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [React Icons](https://react-icons.github.io/react-icons/) - Icon Library
- [EmailJS](https://www.emailjs.com/) - Email Service

---

⭐ **If you found this portfolio helpful or inspiring, please give it a star!**

Made with ❤️ by Sanjay S
