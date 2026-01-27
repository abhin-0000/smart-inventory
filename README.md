# Smart Inventory Management System

A modern, full-stack inventory management solution featuring AI-powered insights, real-time analytics, and role-based access control for both administrators and customers.

---

## Technologies Used

| Layer        | Technology                          |
|--------------|-------------------------------------|
| **Frontend** | React 19                            |
| **Backend**  | Node.js, Express 5                  |
| **Database** | MongoDB                             |
| **Auth**     | JWT                                 |

---

## Student Details

| Field            | Details                              |
|------------------|--------------------------------------|
| **Student Name** | Abhin K R                            |
| **Contact**      | 8590571389                           |

---

## Guide

| Field            | Details                              |
|------------------|--------------------------------------|
| **Guide Name**   | Ms. Akshara Sasidharan               |

---

## Features

### Admin Dashboard
- **Real-time Analytics** – Visual charts and statistics powered by Recharts
- **Inventory Management** – Complete CRUD operations for products
- **Order Management** – Track and manage customer orders
- **AI Insights** – Intelligent demand forecasting and inventory recommendations
- **Barcode Scanner** – Quick product lookup using device camera

### Customer Portal
- **Online Shop** – Browse and order products
- **Order Tracking** – View order history and status
- **Secure Authentication** – JWT-based login system

### Security
- Role-based access control (Admin/Customer)
- Password encryption with bcryptjs
- JWT token authentication

---

## Project Structure

```
smart-inventory/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── context/           # React Context providers
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/                # Database configuration
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth & validation middleware
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── utils/                 # Helper functions
│   ├── server.js              # Entry point
│   └── package.json
│
├── run_app.bat                # Windows quick-start script
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-inventory.git
   cd smart-inventory
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/smart-inventory
   JWT_SECRET=your_secure_secret_key_here
   ```

### Running the Application

#### Option 1: Quick Start (Windows)
Double-click `run_app.bat` in the project root.

#### Option 2: Manual Start

**Terminal 1 – Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 – Frontend:**
```bash
cd client
npm run dev
```

### Access the Application

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:5000        |

---

## API Endpoints

### Authentication
| Method | Endpoint           | Description        |
|--------|-------------------|--------------------
| POST   | `/api/auth/login`  | User login         |
| POST   | `/api/auth/register` | User registration |

### Products
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/products`       | Get all products     |
| POST   | `/api/products`       | Create a product     |
| PUT    | `/api/products/:id`   | Update a product     |
| DELETE | `/api/products/:id`   | Delete a product     |

### Orders
| Method | Endpoint            | Description        |
|--------|--------------------|--------------------
| GET    | `/api/orders`       | Get all orders     |
| POST   | `/api/orders`       | Create an order    |
| PUT    | `/api/orders/:id`   | Update order status|

---

<p align="center">
  Smart Inventory Management System © 2026
</p>
