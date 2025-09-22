# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing "Nothing But Fun" (NBF) - a community platform with two main components:

1. **Frontend** (`nothing-but-fun/`) - Taro React application for multi-platform deployment (WeChat Mini Program, H5, etc.)
2. **Backend** (`nothing-but-fun-backend/`) - Express.js API server with TypeScript, Drizzle ORM, and PostgreSQL

## Common Development Commands

### Frontend (nothing-but-fun/)
```bash
cd nothing-but-fun

# Development (different platforms)
npm run dev:weapp    # WeChat Mini Program
npm run dev:h5       # H5 web version
npm run dev:tt       # TikTok Mini Program
npm run dev:alipay   # Alipay Mini Program

# Production builds
npm run build:weapp  # WeChat Mini Program
npm run build:h5     # H5 web version
npm run build:tt     # TikTok Mini Program
npm run build:alipay # Alipay Mini Program

# Linting and type checking
npx eslint src/      # ESLint
npx tsc --noEmit     # TypeScript type checking
npx stylelint "**/*.less" # Style linting
```

### Backend (nothing-but-fun-backend/)
```bash
cd nothing-but-fun-backend

# Development
npm run dev          # Start development server with tsx watch

# Production
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production server

# Database operations
npx drizzle-kit generate  # Generate database migrations
npx drizzle-kit migrate   # Run database migrations
npx drizzle-kit studio    # Open Drizzle Studio (database GUI)
```

## Architecture Overview

### Frontend Architecture (Taro React)
- **Framework**: Taro 4.1.0 with React 18 for cross-platform deployment
- **UI Libraries**: TailwindCSS (processed via weapp-tailwindcss), NutUI React Taro, Taroify Core
- **Styling**: Less + TailwindCSS with mini-program compatibility
- **State Management**: React Context (AuthProvider, LoadingProvider)
- **Build System**: Webpack 5 with Taro CLI
- **Structure**:
  - `src/pages/` - Page components with individual `.config.ts` files
  - `src/components/` - Reusable UI components
  - `src/services/` - API service modules organized by feature
  - `src/context/` - React context providers for global state
  - `src/hooks/` - Custom React hooks
  - `src/utils/` - Utility functions
  - `src/assets/` - Static assets (images, fonts, etc.)

### Backend Architecture (Express + Drizzle)
- **Framework**: Express.js 5.1.0 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **API Documentation**: Swagger/OpenAPI via swagger-jsdoc and swagger-ui-express
- **Features**: JWT authentication, file uploads (Cloudinary), rate limiting, CORS
- **Runtime**: Node.js with tsx for development
- **Structure**:
  - `api/controllers/` - HTTP request handlers
  - `api/services/` - Business logic layer
  - `api/routes/` - Express route definitions
  - `api/db/migrations/` - Database schema and migrations
  - `api/middlewares/` - Custom Express middleware
  - `api/types/` - TypeScript type definitions
  - `api/config/` - Configuration files

### Cross-Platform Deployment
The frontend uses Taro for deployment across multiple platforms:
- **WeChat Mini Program** (primary target)
- **H5 web application**
- **TikTok Mini Program**
- **Alipay Mini Program**
- **QQ Mini Program**
- **Baidu Smart Program (Swan)**

## Key Development Guidelines

### Frontend Development
- Use Taro APIs instead of native browser APIs for cross-platform compatibility
- Page configurations must be in separate `.config.ts` files following Taro conventions
- TailwindCSS is processed through weapp-tailwindcss for mini program compatibility
- Global state management via React Context providers (AuthProvider, LoadingProvider)
- **Important**: Don't use NutUI or Taroify components. Use TailwindCSS to design custom UI components
- ESLint configuration extends "taro/react" with React 17+ JSX transform rules

### Backend Development
- API documentation automatically available at `/api-docs` when server is running
- All API routes prefixed with `/api`
- Database schema changes require generating and running migrations via Drizzle Kit
- Environment variables configured in `.env` file (see `.env.example` for reference)
- Uses strict TypeScript configuration with ES2020 target
- Drizzle schema located in `./api/db/migrations/schema.ts`

### Database Operations
- PostgreSQL database with Drizzle ORM for type-safe operations
- Schema files managed in `api/db/migrations/`
- Migrations auto-generated and tracked in `api/db/migrations/`
- Connection configured via `DATABASE_URL` environment variable
- Database GUI accessible via `npx drizzle-kit studio`

### Project Configuration Notes
- Frontend uses Taro 4.1.0 with React 18 and TypeScript 5.1.0
- Backend uses Express 5.1.0 with TypeScript targeting ES2020
- Both projects use strict TypeScript configurations
- Frontend includes weapp-tailwindcss for mini-program TailwindCSS compatibility
- Backend includes comprehensive API tooling (Swagger, JWT, Cloudinary, rate limiting)