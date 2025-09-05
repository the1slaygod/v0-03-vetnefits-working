# Vetnefits - Veterinary Management System

## Overview

Vetnefits is a comprehensive veterinary clinic management system built with Next.js, React, and Supabase. The application provides veterinary clinics with tools to manage patients, appointments, inventory, billing, electronic medical records (EMR), and various operational aspects of running a veterinary practice. The system features a modern, responsive web interface with real-time data synchronization and multi-clinic support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for server-side rendering and client-side routing
- **UI Components**: Shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming support
- **Icons**: Lucide React and React Icons for comprehensive icon coverage
- **Layout**: Dashboard layout with collapsible sidebar navigation and responsive top bar
- **State Management**: React hooks (useState, useEffect) with context providers for global state

### Backend Architecture
- **Database**: Supabase (PostgreSQL) as primary data store with real-time capabilities
- **Authentication**: Planned Supabase Auth integration (currently using mock authentication)
- **API Layer**: Supabase client-side SDK with server actions for mutations
- **File Storage**: Supabase Storage for clinic logos and patient photos

### Data Models
The system manages several core entities:
- **Patients**: Pet information, owner details, medical history
- **Appointments**: Scheduling, status tracking, doctor assignments
- **Inventory**: Stock management, expiry tracking, supplier information
- **Admissions**: Inpatient care, room assignments, treatment timelines
- **EMR**: SOAP notes, vaccination records, lab results
- **Billing**: Invoices, payments, OTC sales, accounts receivable

### Real-time Features
- **Live Updates**: Supabase real-time subscriptions for appointment changes and notifications
- **Clinic Context**: Global clinic state management with automatic synchronization
- **Notification System**: Real-time notification manager with priority levels and action URLs

### Module System
The application uses a modular architecture where features can be enabled/disabled:
- Core modules: Patients, Appointments, Inventory, Billing
- Optional modules: Vaccines, Compliance, Lab Reports, OTC Billing
- Settings-controlled module visibility

### Authentication & Authorization
- Multi-clinic support with clinic-scoped data access
- Role-based permissions (admin, doctor, receptionist)
- Session management with clinic context preservation

### UI/UX Design Patterns
- Consistent modal patterns for data entry and editing
- Filterable lists with search and status-based filtering
- Tab-based interfaces for complex forms
- Badge system for status indication with color coding
- Responsive design with mobile-friendly sidebar

### Error Handling & Fallbacks
- Graceful degradation when Supabase is not configured
- Loading states and skeleton screens for better UX
- Form validation with error messaging
- Optimistic updates with rollback capabilities

## External Dependencies

### Core Services
- **Supabase**: Primary database, authentication, real-time subscriptions, and file storage
- **Vercel**: Deployment platform and hosting
- **v0.dev**: Development platform integration for automated deployments

### UI Libraries
- **Shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Headless UI components for accessibility and consistency
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for modern iconography
- **React Icons**: Additional icon sets including Font Awesome

### Form & Validation
- **React Hook Form**: Form state management and validation
- **Hookform Resolvers**: Validation schema integration
- **Input OTP**: One-time password input components

### Date & Time
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **TypeScript**: Type safety and better developer experience
- **ESLint**: Code linting (configured to ignore during builds)
- **PostCSS**: CSS processing with Tailwind CSS
- **Autoprefixer**: CSS vendor prefix automation

### Optional Integrations
- **Google OAuth**: Authentication provider (referenced in login flows)
- **Payment Gateways**: For payment processing (infrastructure prepared)
- **Email Services**: For notification delivery (notification system ready)
- **SMS Services**: For appointment reminders and alerts

### Environment Configuration
- Supabase URL and API keys for database connectivity
- Clinic-specific configuration settings
- Feature flags for module enablement/disablement