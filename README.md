# 🏪 Smart Inventory Management System

A modern, full-stack inventory management solution featuring AI-powered insights, real-time analytics, and role-based access control for both administrators and customers.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![License](https://img.shields.io/badge/License-ISC-yellow)

---

## ✨ Features

### 📊 Admin Dashboard
- **Real-time Analytics** – Visual charts and statistics powered by Recharts
- **Inventory Management** – Complete CRUD operations for products
- **Order Management** – Track and manage customer orders
- **AI Insights** – Intelligent demand forecasting and inventory recommendations
- **Barcode Scanner** – Quick product lookup using device camera

### 🛒 Customer Portal
- **Online Shop** – Browse and order products
- **Order Tracking** – View order history and status
- **Secure Authentication** – JWT-based login system

### Security
- Role-based access control (Admin/Customer)
- Password encryption with bcryptjs
- JWT token authentication

---

##  Tech Stack

| Layer      | Technology                                         |
|------------|---------------------------------------------------|
| **Frontend** | React 19, Vite, React Router, Recharts          |
| **Backend**  | Node.js, Express 5                                |
| **Database** | MongoDB with Mongoose ODM                         |
| **Auth**     | JWT                                              |

---

##  Project Structure

```
smart-inventory/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── BarcodeScanner.jsx
│   │   │   ├── CustomerLayout.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/             # Application pages
│   │   │   ├── AIInsights.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── CustomerOrders.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Shop.jsx
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
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── PurchaseOrder.js
│   │   ├── Supplier.js
│   │   └── User.js
│   ├── routes/                # API routes
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── utils/                 # Helper functions
│   ├── server.js              # Entry point
│   └── package.json
│
├── run_app.bat                # Windows quick-start script
└── README.md
```

---

##  Getting Started

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

5. **Seed the database** (optional)
   ```bash
   cd server
   node seed.js
   ```

### Running the Application

#### Option 1: Quick Start (Windows)
Double-click `run_app.bat` in the project root. This will:
- Start the backend server
- Start the frontend development server
- Open the application in your browser

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

## 📡 API Endpoints

### Authentication
| Method | Endpoint           | Description        |
|--------|-------------------|--------------------|
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
|--------|--------------------|--------------------|
| GET    | `/api/orders`       | Get all orders     |
| POST   | `/api/orders`       | Create an order    |
| PUT    | `/api/orders/:id`   | Update order status|

### AI Insights
| Method | Endpoint         | Description                |
|--------|-----------------|----------------------------|
| GET    | `/api/ai`        | Get AI-powered analytics   |

---

## 🔧 Available Scripts

### Server
```bash
npm start      # Start production server
npm run dev    # Start with hot-reload (nodemon)
```

### Client
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

---

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License

This project is licensed under the ISC License.

---

##  Support

For support, please open an issue in the GitHub repository.

---

<p align="center">
  Made for efficient inventory management
</p>
