# ResourcePortal - Resource Management System

A comprehensive resource management portal for IT assets and user management with role-based access control, built with Next.js 14, SQLite, and TypeScript.

## Features

### 🔐 Authentication & Authorization
- Secure user authentication with bcrypt password hashing
- Role-based access control (Admin, Power User, Regular User)
- Session management with HTTP-only cookies

### 👥 User Management
- Complete user CRUD operations
- User registration by admins
- User profile management
- Role assignment and management

### 🖥️ Resource Management
- Resource registration and tracking
- Resource assignment to users
- Complete resource lifecycle management
- Resource search and filtering

### 📊 Dynamic Dashboard
- Real-time statistics and metrics
- Role-specific dashboard views
- Recent activity tracking
- Quick action buttons

### 🔍 Advanced Search
- Global search functionality
- Search suggestions and autocomplete
- Recent search history
- Filtered search results

### 📱 Modern UI/UX
- Responsive design for all devices
- Loading indicators and smooth transitions
- Toast notifications for user feedback
- Clean and intuitive interface

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: SQLite with better-sqlite3 (For Development) & PostgreSQL used for Production
- **UI Components**: shadcn/ui, Tailwind CSS
- **Authentication**: Custom implementation with bcrypt
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd resource-management-portal
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Setup

The application uses SQLite database which will be automatically created in the `data` directory when you first run the application. No additional environment variables are required for basic setup.

### 4. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Default Login Credentials

The application comes with pre-configured demo accounts:

**Admin Account:**
- Email: `harshdeo7543@gmail.com`
- Password: `12345678`

**Power User Account:**
- Email: `poweruser@example.com`
- Password: `12345678`

**Regular User Account:**
- Email: `user@example.com`
- Password: `12345678`

## Database

The application uses SQLite database with the following features:

- **Automatic Setup**: Database and tables are created automatically on first run
- **Location**: Database file is stored in `data/resource-management.db`
- **Sample Data**: Includes default users and sample resources
- **Migrations**: Schema is managed through the initialization script

### Database Schema

The application includes three main tables:

1. **users** - User accounts and profiles
2. **resources** - IT resources and assets
3. **activity_log** - System activity tracking

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── resources/        # Resource management pages
│   ├── search/           # Search functionality
│   ├── settings/         # Settings pages
│   └── users/            # User management pages
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── models/           # Database models
│   └── utils.ts          # Helper functions
├── data/                 # SQLite database (auto-created)
└── public/               # Static assets
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features by User Role

### Admin Users
- Full access to all features
- Create, edit, and delete users
- Manage all resources
- View all system activities
- Access to user management

### Power Users
- Create and edit resources
- View assigned team resources
- Limited user management access
- Resource assignment capabilities

### Regular Users
- View assigned resources
- Access personal dashboard
- View resource details
- Limited system access

## Production Deployment

### Building for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

### Database Backup

The SQLite database can be backed up by copying the `data/resource-management.db` file.

### Environment Variables

For production deployment, consider setting:

- `NODE_ENV=production`
- Configure proper session secrets
- Set up proper CORS policies

## Security Features

- Password hashing with bcrypt
- HTTP-only cookies for session management
- Role-based access control
- SQL injection prevention
- XSS protection
- CSRF protection through Next.js

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions, please open an issue in the repository.

## License

This project is licensed under the MIT License.
