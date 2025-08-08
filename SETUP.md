# Vetnefits Setup Guide

Welcome to Vetnefits! This guide will help you set up the application for your veterinary clinic.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- Basic knowledge of environment variables

## Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd vetnefits
npm install
\`\`\`

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually 2-3 minutes)
3. Go to Settings > API in your Supabase dashboard
4. Copy your Project URL and anon/public key

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Edit `.env.local` and add your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. Initialize Database

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/10-complete-initialization.sql`
4. Click "Run" to execute the script

This will create all necessary tables and insert sample data.

### 5. Start the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access your clinic management system!

## Default Login

The application starts with sample data. You can begin using it immediately with the default clinic setup.

## Features Included

### ✅ Core Modules
- **Patient Management** - Register and manage pet owners
- **Pet Records** - Complete medical history for each pet
- **Appointments** - Schedule and manage appointments
- **EMR System** - Electronic medical records with SOAP notes
- **Inventory Management** - Track supplies and medications
- **Billing System** - Generate invoices and track payments
- **Lab Reports** - Manage test results and reports

### ✅ Additional Modules
- **Vaccination Tracking** - Monitor vaccination schedules
- **Admission Management** - Handle pet admissions and discharges
- **Compliance Tools** - Track regulatory requirements
- **OTC Sales** - Over-the-counter product sales
- **Waiting List** - Manage appointment queues

### ✅ System Features
- **Multi-user Support** - Staff management with role-based access
- **Real-time Notifications** - Stay updated with important alerts
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Search Functionality** - Global search across all records
- **Data Export** - Export reports and data
- **Customizable Settings** - Adapt the system to your clinic

## Customization

### Clinic Information
1. Go to Settings > Clinic Profile
2. Update your clinic name, contact information, and logo
3. Configure your preferred modules and appearance

### Staff Management
1. Go to Settings > Access
2. Add staff members with appropriate roles:
   - **Doctor** - Full access to medical records
   - **Receptionist** - Appointments and basic patient info
   - **Admin** - System configuration and reports

### Module Configuration
1. Go to Settings > Modules
2. Enable/disable modules based on your clinic's needs
3. Each module can be toggled independently

## Sample Data

The system comes with sample data to help you get started:

- **3 Sample Patients** with contact information
- **4 Sample Pets** with medical histories
- **Sample Appointments** for the next few days
- **Inventory Items** including vaccines and supplies
- **Medical Records** with example treatments
- **Vaccination Records** with due dates

You can delete this sample data once you've added your real clinic data.

## Troubleshooting

### Common Issues

**"supabaseUrl is required" Error**
- Check that your `.env.local` file exists and has the correct Supabase URL
- Restart the development server after adding environment variables

**Database Connection Issues**
- Verify your Supabase project is active
- Check that the database initialization script ran successfully
- Ensure your API keys are correct

**Search Not Working**
- The search functionality requires the database to be properly initialized
- Make sure you've run the complete initialization script

### Getting Help

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure the database script executed without errors
4. Check Supabase logs in your dashboard

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application works on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive configuration
- Regularly update your Supabase API keys if needed
- Enable Row Level Security (RLS) in Supabase for production

## Support

For technical support or feature requests, please check the documentation or contact support.

---

**Congratulations!** Your veterinary clinic management system is now ready to use. Start by adding your first real patient and explore all the features available.
\`\`\`

Finally, let's fix the settings page to use proper Server Actions:
