# EcoKubatana 🌿

**Community-Driven Climate Change Mitigation Platform**

A modern, responsive web application designed for climate action and community resilience. Built for hackathons and real-world impact.

![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🎨 **Modern UI** - Vibrant, climate-inspired design system
- 📊 **Animated Charts** - Engaging data visualizations
- 📱 **Fully Responsive** - Perfect on all devices
- ⚡ **Fast Performance** - Built with Vite
- 🎭 **Micro-interactions** - Smooth hover effects
- ♿ **Accessible** - WCAG AA compliant

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Navigate to project directory
cd EcoKubatana

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📂 Project Structure

```
EcoKubatana/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Main dashboard with animated charts
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Incidents.jsx    # Incident tracking
│   │   ├── Alerts.jsx       # Alert system
│   │   └── ...
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles & design system
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── DESIGN_SYSTEM.md        # Complete design documentation
├── UI_REDESIGN.md          # Redesign guide
└── README.md               # This file
```

---

## 🎨 Design System

The application features a comprehensive design system with:

- **Color Palette:** Climate-inspired colors (greens, blues, oranges)
- **Typography:** Inter font family
- **Animations:** Smooth CSS transitions and keyframe animations
- **Components:** Reusable, accessible components
- **Responsive:** Mobile-first approach

👉 **See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete documentation**

---

## 🎯 Key Pages

1. **Dashboard** - Overview with animated stats and charts
2. **Incidents** - Track climate incidents in your community
3. **Alerts** - Real-time climate alerts
4. **Community Board** - Connect with community members
5. **Resources** - Climate action resources
6. **Learning Hub** - Educational content
7. **Take Action** - Ways to get involved
8. **Support & Wellbeing** - Mental health resources

---

## 🛠️ Technology Stack

- **Frontend:** React 19.2.7
- **Build Tool:** Vite 8.1.1
- **Routing:** React Router DOM 7.18.1
- **Styling:** Pure CSS with CSS Variables
- **Linting:** Oxlint
- **Fonts:** Google Fonts (Inter)

---

## 🎨 Customization

### Change Colors

Edit `src/index.css`:
```css
:root {
  --primary-green: #YOUR_COLOR;
  --accent-blue: #YOUR_COLOR;
}
```

### Adjust Animations

Modify animation speeds in `src/index.css`:
```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📱 Responsive Breakpoints

| Device | Max Width | Layout |
|--------|-----------|--------|
| Mobile | 640px | Single column |
| Tablet | 1024px | Two columns |
| Desktop | 1200px+ | Full layout |

---

## 🏆 Hackathon Ready

This project is optimized for hackathons with:
- ✅ Eye-catching design
- ✅ Smooth animations
- ✅ Professional polish
- ✅ Complete documentation
- ✅ Easy to present
- ✅ Mobile-friendly

**See [UI_REDESIGN.md](./UI_REDESIGN.md) for presentation tips!**

---

## 📝 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run linter
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for your hackathon or production application.

---

## 🌟 Acknowledgments

Built with ♥ for climate action and community resilience.

**Ubuntu · Collaboration · Resilience**

---

## 📚 Documentation

- [Design System](./DESIGN_SYSTEM.md) - Complete design reference
- [UI Redesign Guide](./UI_REDESIGN.md) - What's new and how to present

---

## 🐛 Troubleshooting

### Port already in use?
```bash
# Kill process on port 5173
npx kill-port 5173
```

### Styles not loading?
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm run dev
```

---

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Made for climate champions! 🌍💚**
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
