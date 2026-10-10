# UI Design System & Component Preservation Rules

> **STRICT COMPONENT PRESERVATION DIRECTIVE**:
> Do not alter the layout, colors, spacing, or behavior of any other UI component unless explicitly requested. Make only the smallest, targeted changes necessary to fulfill user requirements, and preserve full responsiveness on mobile, tablet, and desktop devices.

---

## 1. Application Identity & Branding
- **Official App Name**: **Mercy**
- Every visible user-facing reference (headers, page titles, navigation labels, logo text, footer, metadata, and toast notifications) must strictly use **Mercy**.
- Never display "NyayaDesk" in any user-facing text, modals, or page headings.

---

## 2. Sidebar Navigation & Toggle Standard
- The application features a collapsable sidebar navigation.
- **Top-Left Toggle Position**: A dedicated sidebar toggle button must always remain accessible in the top-left area of the dashboard/header where sidebar controls sit.
- **Persistent Visibility**: When the sidebar is hidden/collapsed on desktop, the toggle button must remain visible so users can immediately bring it back.
- **Touch & Mobile Support**: On touch devices and mobile screens, tapping the toggle button opens/closes the sidebar smoothly with a responsive drawer backdrop.

---

## 3. Modern Google-Style Sign-In Standards
- Sign-in buttons follow the clean, modern Google-style pattern:
  - **Shape**: Clean rounded button (`rounded-full` or `rounded-xl`).
  - **Colors & Surfaces**: Crisp white surface (`bg-white hover:bg-zinc-50`), subtle border (`border border-zinc-200`), and soft elevation (`shadow-xs hover:shadow-sm`).
  - **Brand Logo**: Standard 4-color Google "G" logo on the left.
  - **Typography**: Legible, medium-weight font (`font-semibold text-zinc-700`).
  - **Padding**: Generous, balanced spacing (`px-4 py-2.5`).
- Functionality and click behavior must remain intact.

---

## 4. Design Tokens & Visual Hierarchy
- **Canvas Substrate**: Warm Oat Luxury Substrate (`#F7F4EB`) in light mode; Tactical Dark (`#0D0E11`) in dark mode.
- **Primary Buttons / Accents**: Obsidian Black (`#141518`), Coral Red (`#FF5C5C`), and pastel bento surfaces (`#FEF08A`, `#BFDBFE`, `#BBF7D0`, `#FBCFE8`).
- **Typography**: `Plus Jakarta Sans` for UI copy; `JetBrains Mono` for statutory codes and metadata.
- **Interactions**: Tactile feedback (`active:scale-[0.98] transition-all`).
