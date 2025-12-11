# Security Agency - Setup Instructions

## Prerequisites
- Node.js installed
- PostgreSQL database installed and running

## Setup Steps

### 1. Configure Database
1. Copy the `.env.example` file to `.env` in the backend folder:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit the `.env` file with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   DB_NAME=security_agency
   PORT=5000
   ```

3. Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE security_agency;
   ```

### 2. Secure Your Passwords (Important!)
1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Visit `http://localhost:5000/api/hash-passwords` in your browser
   - This will hash all plain text passwords in your users table
   - **Run this once** to secure your existing passwords

### 3. Start the Application

#### Terminal 1 - Backend Server:
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend Development Server:
```bash
cd ..  # Go back to SecurityAgency folder
npm run dev
```

### 4. Access the Application
- Frontend: `http://localhost:5173` (or the port shown in terminal)
- Backend: `http://localhost:5000`

### 5. Login Credentials
- Email: `adminabbie` (from your existing users table)
- Password: `admin123` (from your existing users table)

## Application Flow
1. Landing Page (`/`) - Marketing page with "Admin Login" button
2. Login Page (`/login`) - Authentication with PostgreSQL
3. Admin Dashboard (`/dashboard`) - Protected route, accessible after login

## Features
✅ React Router navigation between pages
✅ PostgreSQL authentication with bcrypt password hashing
✅ Protected routes (dashboard requires authentication)
✅ Login/Logout functionality
✅ User session management with localStorage
✅ Responsive design with TailwindCSS

## API Endpoints
- `POST /api/login` - Authenticate user
- `GET /api/health` - Check server status
- `GET /api/setup` - Initialize database (run once)

## Troubleshooting

### Cannot connect to database
- Ensure PostgreSQL is running
- Check your `.env` credentials
- Verify database exists: `psql -l`

### Backend not connecting
- Check if port 5000 is available
- Ensure all dependencies are installed: `npm install`

### Frontend cannot reach backend
- Verify backend is running on `http://localhost:5000`
- Check browser console for CORS errors
