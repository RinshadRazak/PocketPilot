# Reverse Engineering Report: Pocketwise

**Reference URL:** [https://pocketwise-mc24epbp.manus.space/](https://pocketwise-mc24epbp.manus.space/)  
**Target Project Folder:** `c:\Users\lenovo\Desktop\PocketPilot`  
**Date of Analysis:** October 2026  
**Status:** Confirmed analysis completed; ready for full reproduction.

---

## 1. Executive Summary

Pocketwise is a personal finance management web application designed around calmness, clarity, and private, client-side data ownership ("Private by design · Stored on this device"). It features a dark aesthetic (`#080f20` base, glassmorphic cards, luminous mint `#74f6c8` and purple `#a49cff` accents), interactive data visualizations (Recharts 6-month historical area chart and an SVG/conic-gradient spending ring), a full transactional activity ledger, category budget management with live progress indicators, dynamic rule-based insights, and a CSV & JSON data import/export engine.

---

## 2. Technical Stack Analysis

### Reference Stack
* **Build Tool:** Vite
* **Framework:** React 18+ (SPA with `StrictMode`)
* **Styling:** Custom Vanilla CSS with Design System variables (`:root`, glassmorphism, responsive media queries, CSS grid and flexbox, custom scrollbars, animated focus states)
* **Icons:** `lucide-react` (House, ArrowLeftRight, Layers, Lightbulb, Database, Pencil, Trash2, Wallet, Plus, Check, CircleAlert, ArrowDownLeft, ArrowUpRight, etc.)
* **Charts & Data Visualization:** `recharts` (ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid) + CSS `conic-gradient` for donut spending visualization
* **Typography:** `Inter` (body, data, interface) & `Space Grotesk` (headings, numbers, currency values) via Google Fonts
* **Storage & State:** Reactive `localStorage` (`pocketwise-v1` key) with data validation, schema recovery (`pocketwise-unreadable-backup`), and multi-tab synchronization (`window.addEventListener('storage', ...)`)

---

## 3. Website Structure & Navigation

### 3.1 Global Shell & Layout
* **Desktop Layout:** Two-column layout with fixed/sticky sidebar on the left (`280px` wide) and fluid main content area on the right (`max-width: 1260px`).
* **Sidebar:**
  * **Brand Mark:** Custom SVG pocket glyph + `pocketwise` wordmark with bright green dot.
  * **Workspace Section Header:** `WORKSPACE` uppercase label.
  * **Nav List:** 5 primary tabs with active indicator pill:
    1. **Overview** (`id: "overview"`, `House` icon)
    2. **Transactions** (`id: "transactions"`, `ArrowLeftRight` icon)
    3. **Budgets** (`id: "budgets"`, `Layers` icon)
    4. **Insights** (`id: "insights"`, `Lightbulb` icon)
    5. **Data & privacy** (`id: "data"`, `Database` icon)
  * **Sidebar Bottom:**
    * Privacy card: `ShieldCheck` icon, "Just yours.", "Stored on this device".
    * Profile widget: "P" avatar pill, "Personal space", "Your money, your view", ellipsis menu.
* **Mobile Layout (< 840px):**
  * Top mobile navigation bar with brand logo and hamburger toggle (`Settings2` / `X`).
  * Slide-out mobile drawer menu.
  * Fixed bottom tab bar (`mobile-tabbar`) with all 5 navigation items and labels.
* **Global Header:**
  * Eyebrow/kicker: Pulsing green live dot + `YOUR FINANCIAL PICTURE / [MONTH YEAR]`.
  * Dynamic H1 and subtitle tailored to the active tab.
  * Month selector: Previous Month (`<`), Month input/picker (`CalendarDays` icon + formatted month name), Next Month (`>`).
  * Quick action: Primary "+ Add transaction" button.
* **Global Footer:**
  * Copyright notice: `© [Current Year] Pocketwise`.
  * Live status pill: Pulsing green dot + "Private by design · Stored on this device".
* **Toast Notification System:**
  * Animated toast banner fixed at bottom center for action feedback ("Transaction added.", "Category updated.", "CSV downloaded.", etc.) with auto-dismiss after 4.2 seconds and dismiss button.

---

## 4. Page-by-Page Detailed Breakdown

### 4.1 Overview (`overview`)
1. **Metric Cards Grid (`stat-grid`):**
   * **Left After Spending (Feature Card):** Radial glow background, wallet icon, large balance metric (`$X.XX`), footer pill showing current month and "Income minus expenses".
   * **Income Card:** ArrowDownLeft mint icon, total monthly income (`$X,XXX`), mint helper line and "Money in this month".
   * **Spent Card:** ArrowUpRight purple icon, total monthly expenses (`$X,XXX`), purple helper line and "Across N categories".
   * **Budget Left Card:** Activity blue icon, remaining budget amount (highlighted in red if negative), subtitle showing `% of $X planned` or "Set a monthly budget".
2. **Analytics Grid (`analytics-grid`):**
   * **Cash Flow Over Time Panel (`trend-panel`):**
     * Subheader: "THE BIG PICTURE", "Cash flow over time", "Six months of money in and money out".
     * Legend: Mint dot ("Income") and Purple dot ("Expenses").
     * Recharts dual area chart: 6 months of historical data, monotone smoothing, gradient fills, custom dark tooltip.
     * Accessible hidden HTML table for screen readers.
   * **Spending Mix Panel (`breakdown-panel`):**
     * Subheader: "WHERE IT WENT", "Spending mix", "By category this month", link to budgets.
     * Conic gradient donut ring with center core displaying "TOTAL SPENT" and total amount.
     * Breakdown legend: top 4 spending categories with color dots and percentages, grouped "Other categories" if > 4, "View all categories ↗" button.
3. **Lower Grid (`lower-grid`):**
   * **Worth Knowing Panel (`insights-panel`):**
     * Displays top 2 algorithmic insights.
     * "All insights →" link switching to Insights tab.
   * **Recent Transactions Panel (`recent-panel`):**
     * List of the 5 most recent transactions for the selected month.
     * "View all →" link switching to Transactions tab.

### 4.2 Transactions (`transactions`)
1. **Activity Ledger Toolbar:**
   * Eyebrow: `ACTIVITY LEDGER`.
   * Title: `[Month] transactions` with total count badge pill.
   * Action buttons: "Import CSV" and "Export CSV".
2. **Filter & Search Bar:**
   * Real-time search box with `Search` icon.
   * Type filter dropdown: All types, Expenses, Income.
   * Category filter dropdown: dynamically populated based on selected type.
3. **Transaction Table/List:**
   * Header labels: `TRANSACTION` and `AMOUNT`.
   * Rows:
     * Category colored circular mark with category-specific icon.
     * Description (bold) and Category name · formatted date (`MMM D, YYYY`).
     * Amount (`+ $X.XX` in green for income, `− $X.XX` for expense).
     * Hover action icons: Edit (`Pencil`) and Delete (`Trash2`).
4. **Empty State:** Search icon, "No transactions found", "Try another month or filter, or add your first entry", "Add transaction" button.

### 4.3 Budgets (`budgets`)
1. **Toolbar:**
   * Eyebrow: `YOUR MONTHLY PLAN`.
   * Title: "Category budgets".
   * Description: "These limits repeat each month. Spending updates as you add transactions."
   * Action button: "+ New category".
2. **Budget Summary Strip (`budget-summary`):**
   * 4 metric columns: TOTAL PLANNED, SPENT THIS MONTH, AVAILABLE (colored red if negative), OVER LIMIT (count of categories over budget).
3. **Spending Limits Section:**
   * Expense categories list with category icon, category name, spent vs limit (`$X of $Y` or `$X spent · No limit`), visual progress bar (switches to red `.over` when exceeded), status pill (`$X over budget` or `$X left · Y% used`).
   * Action buttons: "Edit limit", edit category pencil, delete category trash.
4. **Income Categories Section:**
   * Grid of income categories with category icon, name, and edit/delete actions.

### 4.4 Insights (`insights`)
1. **Header:** "PATTERNS THAT MATTER", "What [Month] is telling you", subtitle.
2. **Dynamic Smart Insight Cards:**
   * **Over-budget Warning:** Evaluates categories where spent > budget limit. Displays warning badge and amount exceeded.
   * **Month-over-Month Comparison:** Compares month-to-date spending against prior month. Highlights percentage decrease or increase.
   * **Room in Budget:** Finds the top category with remaining budget headroom.
   * **Savings Rate:** Calculates percentage of income remaining after expenses.
   * **Fallback Insight:** "Your next insight is one transaction away" if no transactions exist.
3. **Category Check-in Panel:**
   * Ranked list of categories with color swatches, percentage of limit used, and exact spent amount.
4. **Peace of Mind Panel:**
   * Privacy badge, reassurance description, and "Manage your data →" link.

### 4.5 Data & Privacy (`data`)
1. **Header:** "DATA & PRIVACY", "Take your records with you".
2. **Unreadable Backup Banner:** Shown only if corrupted data was rescued during load.
3. **Data Action Cards:**
   * **Import your records:** CloudUpload icon, description, "Import CSV" button.
   * **Keep a copy:** Download icon, description, "Export CSV" button.
4. **Local Storage Panel:**
   * Device-only storage explanation with live counters: Total transactions and Total categories.
5. **Fresh Start Panel:**
   * "Clear transactions" button (prompts confirmation).
   * "Restore starting records" button (repopulates 6 months of sample data).

---

## 5. Modals and Interactive Dialogs

1. **Transaction Modal (Add & Edit):**
   * Accessible focus trap, Esc key listener, click-outside dismiss.
   * Type switch: Expense vs Income.
   * Description field (max 120 chars, required).
   * Amount field (decimal input with `$` prefix, step 0.01, min 0.01, max 100M).
   * Date input (defaults to today `YYYY-MM-DD`).
   * Category selector (filtered to current type).
   * Real-time inline validation error display.
2. **Category Modal (Add & Edit):**
   * Type switch (only on add).
   * Name input (max 60 chars, duplicate check).
   * 10-swatch Accent Color Picker.
3. **Budget Limit Modal:**
   * Category name title, monthly limit input, explanatory helper note.
4. **CSV Import Modal:**
   * Drag-and-drop file dropzone with 5 MB cap.
   * Live CSV parser with column verification (`date`, `type`, `category`, `description`, `amount`).
   * Summary stats: valid transactions, categories, invalid rows count.
   * Error table showing row numbers and specific validation errors.
   * Radio mode selector: "Add to current records" (merge) vs "Replace current records" (destructive replace with warnings).
5. **Confirmation Dialog:**
   * Accessible confirmation dialog for destructive operations (Delete transaction, Delete category, Clear transactions, Restore starting data).

---

## 6. Color Palette & Typography Specification

* **Background Base:** `#080f20`
* **Card & Panel Surfaces:** `rgba(20, 32, 54, 0.67)` with `backdrop-filter: blur(14px)`
* **Borders / Separators:** `rgba(177, 199, 232, 0.105)`
* **Primary Text:** `#eef4ff`
* **Muted / Secondary Text:** `#90a0b9`
* **Mint Accent (Income, Positive):** `#74f6c8`
* **Purple Accent (Expense, Trend):** `#a49cff`
* **Blue Accent:** `#7bb8ff`
* **Amber / Warning:** `#f2b875`
* **Coral / Danger / Over-budget:** `#fa8e9d`
* **Category Palette (10 colors):**
  `#74f6c8`, `#a49cff`, `#f2b875`, `#7bb8ff`, `#fa8e9d`, `#85d7d8`, `#d5b4ef`, `#b4d67b`, `#efa989`, `#a0b7d5`
* **Fonts:**
  * Primary: `'Inter', system-ui, sans-serif`
  * Accents / Monospace / Numbers: `'Space Grotesk', 'Inter', sans-serif`

---

## 7. Sample Initial Dataset Specification

Pocketwise auto-generates 6 months of realistic seed data relative to the current calendar date:
* **Income:** "Northline Studio · Payroll" ($5,080 - $5,250), "Fieldwork · Design project" ($620, $780).
* **Expenses:** Housing ($1,740), Groceries (Trader Joe's, Whole Foods), Dining (Sunday in Brooklyn, Lilia, Bar Primi), Transport (MTA pass, MetroCard, Uber), Utilities (Con Edison), Subscriptions (Spotify, Netflix), Shopping (Muji, Uniqlo, Everlane), Health (CityMD copays), Entertainment (Alamo Drafthouse), Travel (Amtrak).
* **Budgets:**
  `housing: 1850, groceries: 550, dining: 250, transport: 220, shopping: 300, utilities: 240, subscriptions: 100, health: 180, entertainment: 180, travel: 350`

---

## 8. Implementation Plan

1. **Project Scaffolding:** Set up a clean, high-performance Vite + React + TypeScript project in `PocketPilot`.
2. **Dependencies:** Install `lucide-react` and `recharts`.
3. **Styling & Assets:** Integrate the complete design system CSS, fonts, SVG icons, and favicon.
4. **Core Logic:** Reconstruct data types, local storage synchronization, migration, validation, CSV import/export engines, and financial calculation models.
5. **Component Architecture:** Implement Sidebar, Header, MonthControl, StatCards, TrendChart, SpendingRing, LedgerTable, BudgetRows, InsightCards, DataPanels, and Modals.
6. **Responsive Layouts:** Test and ensure pixel-perfect rendering across 375px, 430px, 768px, 1366px, and 1440px.
7. **Verification & Testing:** Verify all flows, calculations, imports, exports, and build cleanly with `npm run build`.
