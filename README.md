# Booking System 📅

A comprehensive, full-stack appointment booking system built using the **MERN Stack** (MongoDB, Express, React, Node.js). The platform is designed to manage appointments, services, and multiple user roles including Users, Professionals (e.g., Doctors, Dentists), and Administrators.

## 🚀 Features

### Authentication & Authorization

- Secure Registration and Login.
- JWT-based authentication (supporting both Cookies and Headers for flexible cross-origin support).
- Role-based Access Control (RBAC):
  - **User**: Can browse services, book appointments, view and cancel their own bookings.
  - **Professional**: Can manage their own services and view appointments booked with them.
  - **Admin**: Has full access to manage all services, assign services to professionals, and oversee the system.

### Service Management

- Create, Read, Update, and Delete (CRUD) services.
- Admins can assign specific services to specific professionals.
- Professionals have an isolated dashboard to manage only the services assigned to them.

### Appointment Booking Flow

- Dynamic booking system where users first select a **Professional**, then choose from the specific **Services** offered by that professional.
- Avoids double-booking by checking for overlapping time slots.
- Users can update their appointment times or cancel them.

---

## 🛠️ Tech Stack

**Frontend:**

- **React.js** (Create React App)
- **Bootstrap 5** for responsive, mobile-first styling.
- **Axios** for API requests and interceptors.
- **Formik & Yup** for robust form state management and validation.
- **React Router** for declarative routing.
- **React Hot Toast** for beautiful, non-intrusive notifications.

**Backend:**

- **Node.js & Express.js** for building the RESTful API.
- **MongoDB & Mongoose** for the database schema and queries.
- **JSON Web Token (JWT)** & **Bcrypt.js** for security and password hashing.
- **Joi** for strict backend payload validation.

---

## 📁 Project Structure

The project is structured as a monolithic repository containing both the backend API and the frontend client.

```
Booking System/
├── booking-frontend/       # React Frontend Application
│   ├── public/             # Public assets
│   ├── src/                # React Source Code (Pages, Components, API instances)
│   └── package.json        # Frontend dependencies
├── controllers/            # Express Route Controllers (Business Logic)
├── middlewares/            # Express Middlewares (Auth, Validation)
├── models/                 # Mongoose Database Schemas
├── routers/                # Express API Routes
├── utils/                  # Utility Functions (Hashing)
├── uploads/                # Static folder for uploaded files
├── .env                    # Environment variables (Backend)
├── index.js                # Main Express Entry Point
└── package.json            # Backend dependencies
```

---

## 💻 Running the Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended for native `.env` support)
- A running instance of [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Setup the Backend

1. Open a terminal in the root directory (`Booking System/`).
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is properly configured. Example:
   ```env
   PORT=8000
   MONGO_URI=mongodb://<username>:<password>@<cluster-url>
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the backend server:
   ```bash
   npm start
   # or run in dev mode:
   npm run dev
   ```

### 2. Setup the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd booking-frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. The frontend will automatically run on `http://localhost:3000`.

---

## 📡 API Endpoints Summary

### Authentication (`/api/sign`)

- `POST /signup` - Register a new account.
- `POST /login` - Login to receive JWT token.
- `POST /logout` - Clear cookies and logout.

### Services (`/api/services`)

- `GET /` - Retrieve services (filtered automatically based on user role).
- `POST /` - Add a new service (Admin or Professional).
- `PUT /:id` - Edit a service.
- `DELETE /:id` - Delete a service.

### Appointments (`/api/appointments`)

- `GET /` - Fetch appointments for the logged-in user or professional.
- `POST /` - Book a new appointment.
- `PUT /:id` - Update the date/time of an appointment.
- `DELETE /:id` - Cancel an appointment.

### Users (`/api/users`)

- `GET /professionals` - Get a list of all professionals (used for dropdowns).
