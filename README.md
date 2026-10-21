# PocketPilot 💳

> **Your Money. Your Control.**

PocketPilot is a modern, private, and intuitive personal finance management web application. Designed for calmness, clarity, and client-side data ownership, PocketPilot helps you track spending, set category budgets, view monthly cash flow trends, and gain actionable financial insights — completely private on your device.

---

## ✨ Features

- **📊 Comprehensive Financial Overview**: Real-time balance calculations, monthly income, total expenses, remaining budget, and 6-month historical cash flow trends via interactive AreaCharts.
- **🍩 Spending Mix Visualization**: Category breakdown rendered with dynamic conic-gradient donut chart rings and percentage distributions.
- **📝 Activity Ledger**: Full transaction tracking with real-time search, type filtering (*Income* / *Expense*), category filtering, and optional descriptions.
- **🎯 Category Budget Limits**: Set monthly spending limits per category with dynamic progress bars that alert you when limits are exceeded.
- **💡 Smart Insights**: Algorithmic observations analyzing budget overages, month-over-month spending rate changes, available headroom, and savings ratios.
- **🔒 Private by Design**: 100% client-side storage using `localStorage` with automated schema validation and multi-tab synchronization.
- **📁 Data Portability**: Export and import complete transaction and budget records via standard CSV or download raw recovery JSON backups.
- **📱 Fully Responsive**: Fluid layouts crafted for desktop, tablet, and mobile viewports with bottom tab navigation and touch-friendly controls.
- **🇮🇳 INR Currency**: Consistent Indian Rupee (`₹`) formatting across all metrics, charts, tables, and dialogs.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Bundler & Dev Server**: Vite
- **Icons**: [Lucide React](https://lucide.dev)
- **Charts**: [Recharts](https://recharts.org)
- **Typography**: Google Fonts (*Inter* & *Space Grotesk*)
- **Styling**: Handcrafted CSS Design System with dark glassmorphic surfaces

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RinshadRazak/PocketPilot.git
   cd PocketPilot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License

This project is open source and available under the MIT License.
