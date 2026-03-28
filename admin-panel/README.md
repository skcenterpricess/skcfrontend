# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

# Admin Panel Frontend

Admin React frontend with role-based protected routes and cookie-based JWT auth.

## Stack

- React + TypeScript + Vite
- TailwindCSS
- React Router
- Axios (`withCredentials: true`)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_API_BASE_URL`

## Auth Contract

This app expects backend-managed cookies and these endpoints:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`

JWT is never stored in localStorage/sessionStorage. Only non-sensitive UI preferences are persisted in sessionStorage via context.

## Role Policy

- Routes `/dashboard`, `/users`, `/content`, `/settings` require `role: 'admin'`.

## Structure

- `src/app`: providers + router
- `src/features/auth`: auth context and services
- `src/shared`: API client, persistence utilities, guards, types
- `src/pages`: route-level pages
  languageOptions: {
  parserOptions: {
  project: ['./tsconfig.node.json', './tsconfig.app.json'],
  tsconfigRootDir: import.meta.dirname,
  },
  // other options...
  },
  },
  ])

```

```
