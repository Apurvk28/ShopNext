# ShopNext 🛍️

ShopNext is a full-stack, modern e-commerce web application built using the **MERN** stack (MongoDB, Express, React, Node.js) with **Vite**, **JWT authentication**, **Cloudinary** media management, and **Razorpay** payment gateway integration.

---

## 🚀 Features

### Customer Features
- **User Authentication**: Secure user registration and login using JWT and password hashing via `bcryptjs`.
- **Email Notifications**: Automated OTP emails on registration and order confirmation emails via `Nodemailer`.
- **Product Catalog**: Browse and explore products with descriptions, pricing, inventory stock, and Cloudinary-hosted images.
- **Cart Management**: Add, update, and manage items in the shopping cart.
- **Order Placement**: Place orders with shipping addresses and track order statuses (`Pending`, `Shipped`, `Delivered`).
- **Payment Processing**: Integrated **Razorpay** checkout with cryptographically verified payment signatures.

### Admin Features
- **Product Management**: Create, update, and delete products with image upload support via `multer` and `cloudinary`.
- **Order Management**: View all customer orders and update shipping statuses.
- **Analytics Dashboard**: Real-time sales statistics including total revenue, order volume, product count, and registered users.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: React Context API (`AuthContext`)
- **Styling**: Modern, responsive CSS

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES6 Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Uploads**: `multer` & [Cloudinary SDK](https://cloudinary.com/)
- **Payments**: [Razorpay SDK](https://razorpay.com/)
- **Email Service**: [Nodemailer](https://nodemailer.com/)

---

## 📁 Project Structure

```text
ShopNext/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary configurations
│   │   ├── controller/      # Auth, product, order, payment & analytics controllers
│   │   ├── middleware/      # JWT auth protection & admin authorization
│   │   ├── model/           # Mongoose schemas (User, Product, Order)
│   │   ├── routes/          # Express route definitions
│   │   └── utils/           # Nodemailer email utility
│   ├── server.js            # Express application entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, Footer, ProductCard)
│   │   ├── context/         # AuthContext authentication state
│   │   ├── pages/           # Application views (Home, Shop, Cart, Profile, etc.)
│   │   ├── styles/          # Component & layout stylesheets
│   │   ├── App.jsx          # Route hierarchy and main layout
│   │   └── main.jsx         # React application entrypoint
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json             # Root monorepo scripts (concurrently)
└── Readme.md
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance
- [Cloudinary](https://cloudinary.com/) account (for product image hosting)
- [Razorpay](https://razorpay.com/) account (test mode key & secret)

### 1. Clone the Repository
```bash
git clone https://github.com/Apurvk28/ShopNext.git
cd ShopNext
```

### 2. Install Dependencies
You can install dependencies for both the frontend and backend simultaneously from the root:
```bash
npm run install
```
*(Or install manually in each folder: `cd backend && npm install`, then `cd ../frontend && npm install`)*

---

### 3. Environment Variables Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3009

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gmail SMTP (Nodemailer)
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

### 4. Run the Application

Run both the frontend and backend concurrently with a single command from the project root:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3009`

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user & send OTP email | Public |
| `POST` | `/api/auth/login` | Login user & receive JWT | Public |
| `GET` | `/api/auth/users` | List all users | Admin |

### Products (`/api/products`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/products` | Retrieve all products | Public |
| `GET` | `/api/products/:id` | Retrieve single product details | Public |
| `POST` | `/api/products` | Create product (multipart/form-data) | Admin |
| `PUT` | `/api/products/:id` | Update product details or image | Admin |
| `DELETE`| `/api/products/:id` | Delete product | Admin |

### Orders (`/api/orders`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/orders` | Place new order & receive confirmation email | Authenticated |
| `GET` | `/api/orders/myorders` | List current user's orders | Authenticated |
| `GET` | `/api/orders/:id` | Get order details by ID | Authenticated |
| `GET` | `/api/orders` | List all customer orders | Admin |
| `PUT` | `/api/orders/:id` | Update order status (`Pending`, `Shipped`, `Delivered`) | Admin |

### Payments (`/api/payment`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/payment/order` | Initialize Razorpay order with amount | Authenticated |
| `POST` | `/api/payment/verify` | Verify Razorpay SHA256 payment signature | Authenticated |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/analytics` | View sales metrics, total orders, and revenue | Admin |

---

## 📜 License
This project is licensed under the **ISC License**.
