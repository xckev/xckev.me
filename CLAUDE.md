# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.0 personal website (xckev.me) built with React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router architecture and is currently in its initial state from create-next-app.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Architecture

### App Router Structure
- Uses Next.js App Router (`app/` directory)
- `app/layout.tsx`: Root layout with Geist font family configuration (sans and mono variants)
- `app/page.tsx`: Homepage component
- `app/globals.css`: Global styles with Tailwind CSS v4 and CSS custom properties

### Components
- **shadecn/ui** version 3.6.2 for components.
- Using Neutral base color

### Styling
- **Tailwind CSS v4** with PostCSS plugin (`@tailwindcss/postcss`)
- Custom theme configuration in `app/globals.css` using `@theme inline` directive
- CSS custom properties for theming: `--background`, `--foreground`, `--font-geist-sans`, `--font-geist-mono`
- Automatic dark mode support via `prefers-color-scheme` media query

### TypeScript Configuration
- Path alias configured: `@/*` maps to root directory
- Strict mode enabled
- React JSX transform enabled (`"jsx": "react-jsx"`)
- Target: ES2017

### Fonts
- Uses `next/font/google` for optimized Geist font loading
- Two font variants: Geist (sans) and Geist Mono
- Fonts loaded as CSS variables in layout

### ESLint
- Uses eslint-config-next with core-web-vitals and TypeScript presets
- Custom config in `eslint.config.mjs` (flat config format)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Key Technologies

- **Next.js 16.1.0**: React framework with App Router
- **React 19.2.3**: Latest React with new features
- **TypeScript 5**: Type safety
- **Tailwind CSS v4**: Utility-first CSS with new architecture
- **ESLint 9**: Modern flat config format
