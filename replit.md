# Ottoman Turkish Language Learning App

## Overview

This is a React-based language learning application focused on Ottoman Turkish vocabulary, featuring a spaced repetition system for effective memorization. The app combines modern web technologies with proven learning methodologies to help users master Ottoman Turkish words and their modern Turkish equivalents.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session storage

### Database Design
- **ORM**: Drizzle with TypeScript-first schema definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless database with connection pooling

## Key Components

### Data Models
- **Words Table**: Stores Ottoman Turkish vocabulary with pronunciations, Turkish translations, examples, categories, and additional meanings array
- **User Progress Table**: Tracks spaced repetition data including difficulty levels, intervals, ease factors, and review scheduling
- **Study Sessions Table**: Records learning session statistics and performance metrics

### Learning System
- **Spaced Repetition Algorithm**: SM-2 algorithm implementation for optimal review scheduling
- **Flashcard Interface**: Interactive learning component with difficulty rating system
- **Progress Tracking**: Comprehensive statistics and performance analytics

### UI Components
- **Dashboard**: Overview of learning progress and quick actions
- **Word Bank**: Searchable vocabulary database with filtering capabilities
- **Flashcard System**: Study interface with answer revelation and difficulty assessment
- **Bottom Navigation**: Mobile-optimized navigation for different app sections

## Data Flow

1. **Application Initialization**: Vite serves the React application with server-side rendering support
2. **API Communication**: TanStack Query manages all server communication with automatic caching and synchronization
3. **Study Sessions**: Users interact with flashcards, submit difficulty ratings, and the spaced repetition algorithm calculates next review dates
4. **Progress Persistence**: All learning data is stored in PostgreSQL with real-time updates
5. **Statistics Generation**: Dashboard aggregates user progress data for performance visualization

## External Dependencies

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: Built-in connection management for scalability

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing and optimization

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite provides instant development feedback
- **TypeScript Compilation**: Real-time type checking and compilation
- **Database Migrations**: Automated schema updates during development

### Production Deployment
- **Replit Deployment**: Configured for Replit's autoscale deployment target
- **Build Process**: Vite builds client assets, ESBuild bundles server code
- **Port Configuration**: Server runs on port 5000, mapped to external port 80
- **Environment Variables**: Database URL and other secrets managed through environment configuration

### Performance Optimizations
- **Static Asset Serving**: Efficient serving of built client assets
- **Database Query Optimization**: Drizzle ORM with optimized queries
- **Caching Strategy**: TanStack Query handles client-side caching automatically

## Recent Changes

```
Recent Changes:
- June 26, 2025: Added comprehensive feature suite with quiz, translation, and content management
  - Implemented quiz and games system with multiple-choice and typing modes
  - Added Osmanlıca-Türkçe translation functionality with real-time search
  - Created copyright and legal information page
  - Built recent uploads management with batch tracking and export capabilities
  - Removed 20-word limit from flashcard sessions for unlimited learning
  - Enhanced dashboard with quick access to all new features
  - Added footer with copyright links and improved navigation structure
- June 26, 2025: Added comprehensive profile settings and analytics dashboard
  - Implemented detailed learning analytics with performance metrics
  - Added user profile management with customizable learning preferences
  - Created comprehensive settings for daily goals, session length, and difficulty
  - Added data export and progress reset functionality
  - Integrated mobile-responsive navigation for all new features
- June 26, 2025: Added comprehensive JSON file upload system
  - Supports both new format (word/transliteration/meaning) and legacy format
  - Increased server payload limits to handle large dictionary files
  - Enhanced flashcard interface to display additional meanings
  - Updated word bank to show supplementary definitions
  - Added mobile and desktop file upload interfaces
- June 26, 2025: Initial setup with flashcard system and spaced repetition
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```