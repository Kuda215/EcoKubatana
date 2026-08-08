# EcoKubatana Design System 🌿

## Overview
A modern, vibrant design system for climate change mitigation - built to stand out in hackathons and inspire action.

---

## 🎨 Color Palette

### Primary Colors
```css
--primary-green: #00d9a3    /* Vibrant green - main brand color */
--primary-dark: #0a3d2e     /* Deep forest green - text & background */
--primary-light: #e8fff8    /* Light mint - backgrounds */
```

### Accent Colors
```css
--accent-blue: #00a8e8      /* Ocean blue - trust & water */
--accent-orange: #ff6b35    /* Coral orange - urgency & heat */
--accent-yellow: #ffd23f    /* Solar yellow - energy & optimism */
--accent-purple: #8338ec    /* Purple - innovation */
```

### Status Colors
```css
--success: #06d6a0          /* Green - positive actions */
--warning: #ffc233          /* Yellow - caution */
--danger: #ef476f           /* Red - urgent alerts */
--info: #118ab2             /* Blue - information */
```

### Neutral Colors
```css
--neutral-50: #f8fafb       /* Lightest background */
--neutral-100: #f0f4f7      /* Light background */
--neutral-200: #e4e9ee      /* Borders */
--neutral-300: #d1dae3      /* Disabled states */
--neutral-400: #9ba8b8      /* Placeholder text */
--neutral-500: #6c7a8a      /* Secondary text */
--neutral-600: #4a5666      /* Body text */
--neutral-700: #2d3748      /* Headings */
--neutral-800: #1a202c      /* Primary text */
--neutral-900: #0d1117      /* Darkest text */
```

---

## 🌈 Gradients

### Primary Gradient
```css
--gradient-primary: linear-gradient(135deg, #00d9a3 0%, #00a8e8 100%)
```
**Usage:** Primary buttons, headings, stat cards

### Warm Gradient
```css
--gradient-warm: linear-gradient(135deg, #ff6b35 0%, #ffd23f 100%)
```
**Usage:** Warning cards, heat-related incidents

### Cool Gradient
```css
--gradient-cool: linear-gradient(135deg, #118ab2 0%, #06d6a0 100%)
```
**Usage:** Weather cards, water-related content

### Sunset Gradient
```css
--gradient-sunset: linear-gradient(135deg, #8338ec 0%, #ef476f 100%)
```
**Usage:** Special highlights, featured content

### Sky Gradient
```css
--gradient-sky: linear-gradient(180deg, #00a8e8 0%, #00d9a3 100%)
```
**Usage:** Vertical elements, weather displays

---

## 🎭 Shadows

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)
```

---

## 📐 Border Radius

```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-full: 9999px
```

---

## ⚡ Animations

### Keyframes Available

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```
**Usage:** Page loads, card appearances

#### Slide In
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
```
**Usage:** Navigation items, list items

#### Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```
**Usage:** Alerts, notifications

#### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```
**Usage:** Icons, decorative elements

#### Grow
```css
@keyframes grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
```
**Usage:** Bar charts, progress bars

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
@media (max-width: 480px)   /* Extra small devices */
@media (max-width: 640px)   /* Small devices (phones) */
@media (max-width: 768px)   /* Medium devices (tablets) */
@media (max-width: 1024px)  /* Large devices (laptops) */
@media (max-width: 1200px)  /* Extra large devices (desktops) */
```

---

## 🧩 Component Patterns

### Cards
All cards feature:
- ✨ Hover animations (translateY(-4px))
- 🎨 Top accent bar on hover
- 📦 Consistent padding (24px)
- 🔲 Rounded corners (--radius-lg)
- 🌟 Smooth shadows

### Buttons
```css
.btn--primary    /* Gradient background, white text */
.btn--ghost      /* Transparent with border */
.btn--orange     /* Warm gradient for urgent actions */
```

### Interactive Elements
All interactive elements include:
- Smooth transitions (--transition-fast)
- Scale/rotate effects on hover
- Clear focus states
- Disabled states with reduced opacity

---

## 🎯 Usage Guidelines

### Typography Scale
- **Headings:** 24-32px, weight 800-900, gradient text
- **Subheadings:** 18-22px, weight 700-800
- **Body text:** 14-16px, weight 400-600
- **Small text:** 12-13px, weight 500-600

### Spacing Scale
```
4px   → Tiny gaps
8px   → Extra small
12px  → Small
16px  → Medium (default)
20px  → Large
24px  → Extra large
32px  → 2XL
48px  → 3XL
```

### Icon Sizes
- Small: 20-24px
- Medium: 28-36px
- Large: 40-48px
- Extra Large: 64-80px

---

## 🚀 Performance Tips

1. **Animations:** Use `transform` and `opacity` for best performance
2. **Shadows:** Minimize box-shadow complexity on mobile
3. **Gradients:** Consider solid fallbacks for older browsers
4. **Images:** Always optimize and use modern formats (WebP)

---

## 🎨 Climate Theme

### Visual Language
- **Water:** Blues, flowing animations
- **Earth:** Greens, growth animations
- **Fire:** Orange/red, pulsing effects
- **Air:** Light colors, floating animations
- **Growth:** Green gradients, scaling animations

### Emotional Palette
- **Hope:** Bright greens & blues
- **Urgency:** Orange & red
- **Trust:** Deep blues
- **Action:** Vibrant gradients

---

## 📊 Chart Styling

### Bar Charts
- Animated growth from bottom
- Gradient fills
- Interactive hover states
- Responsive sizing

### Donut/Pie Charts
- Color-coded segments
- Slide-in animations
- Hover effects with scale
- Clear legends

### Data Visualization Best Practices
1. Use contrasting colors from the palette
2. Animate on load (stagger delays)
3. Add hover tooltips
4. Make responsive for all screens

---

## ✅ Accessibility

- **Color Contrast:** WCAG AA compliant
- **Focus States:** Visible on all interactive elements
- **Touch Targets:** Minimum 44x44px on mobile
- **Screen Readers:** Semantic HTML throughout

---

## 🔧 Development

### CSS Variables
All colors and values are defined as CSS custom properties in `/src/index.css`. Use them instead of hard-coded values:

```css
/* ✅ Good */
color: var(--primary-green);

/* ❌ Avoid */
color: #00d9a3;
```

### Animation Classes
Apply utility classes for quick animations:
```css
.animate-fade-in
.animate-slide-in
.animate-pulse
```

---

## 🌟 Stand Out Features

1. **Animated Graphs:** All charts animate on load
2. **Hover Micro-interactions:** Every element responds to interaction
3. **Gradient Accents:** Modern gradient text and backgrounds
4. **Smooth Transitions:** 60fps animations throughout
5. **Dark Sidebar:** Professional contrast with light content
6. **Floating Elements:** Subtle background animations
7. **Responsive Grid:** Perfect on all screen sizes

---

## 📝 Notes

This design system is specifically crafted for climate change initiatives, balancing:
- **Urgency** (through warm colors and animations)
- **Hope** (through growth metaphors and greens)
- **Professionalism** (through clean layouts and typography)
- **Action** (through bold CTAs and interactive elements)

Perfect for hackathons, competitions, and real-world deployment! 🏆
