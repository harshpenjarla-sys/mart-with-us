# 🛒 MART WITH US — Full-Stack Grocery & Daily Essentials Delivery Platform

> **“Your Everyday Needs, Delivered.”**  
> A production-style, modern Indian grocery and daily-essentials marketplace platform built with React, Node.js, Express, MongoDB / Smart Persistent Embedded Engine, Tailwind CSS, and Socket.io real-time order tracking.

---

## 🌟 Overview & Key Highlights

**MART WITH US** operates like a realistic online kirana & quick-commerce grocery platform engineered for speed, convenience, and reliability across Pune fulfillment hubs (Baner, Wakad, Kothrud, Aundh, Hinjawadi).

### 🚀 Three Clearly Separated Experiences (Requirement #44)

1. **Customer Marketplace (`/`)**
   - **Hyperlocal Location Selector**: Select delivery area (e.g. *Baner, Pune — 411045*) dynamically mapped to nearest local dark store.
   - **Search & Autocomplete**: Instant search suggestions for products and brands with keyboard navigation.
   - **Multi-Faceted Filtering & Sorting**: Filter by Category, Brand, Price Range, Minimum Rating, Minimum Discount, and In-Stock status. Sort by Popularity, Price (Low/High), Rating, Newest, or Discount.
   - **Product Detail**: High-res imagery, nutritional highlights, MRP & selling price, discount badges, delivery estimate, and "You may also like" related recommendations.
   - **Cart & Slide-Over Drawer**: Interactive quantity steppers, savings meter, free delivery progress bar (Free above ₹499), and breakdown.
   - **Multi-Step Checkout**:
     - *Step 1 — Address*: Saved addresses management, add/edit addresses with landmarks.
     - *Step 2 — Delivery Slot*: Standard Express (25–35 min) vs Scheduled Time Slots.
     - *Step 3 — Payment Gateway*: Simulated payment abstraction layer supporting UPI (GPay/PhonePe/Paytm), Cards, Net Banking, and Cash on Delivery.
   - **Order Confirmation 🎉**: Animated confetti celebration, unique order ID generation (`MWU-YYYYMMDD-XXXXX`), and instant track button.
   - **Live Delivery Tracking (`/orders/:id`)**:
     - Live stage progress: *Preparing -> Packed -> Partner Assigned -> Out for Delivery -> Delivered*.
     - Real-time Socket.io synchronized location updates and route status.
     - Assigned delivery partner details (Photo, Vehicle Number, Rating).
     - Call and live simulated chat with delivery partner.
     - Post-delivery rating and reviews.

2. **Delivery Partner Portal (`/delivery/dashboard`)**
   - Dedicated driver workspace completely separate from customer views.
   - **Partner Onboarding (`/delivery/register`)**: Register with vehicle type (*Bicycle, Bike, Scooter, Car*), license number, government ID, and service hub (starts in *Pending Verification*).
   - **Today's Statistics**: Live earnings tracker (e.g., *Today's Earnings: ₹620*), completed trips counter, and customer rating.
   - **Online / Offline Toggle**: Switch availability with instant fleet status updates.
   - **Available Delivery Orders Feed**: View pickup store location, dropoff address, approximate distance, and calculated payout (e.g., *₹55*).
   - **4-Stage Delivery Workflow**:
     1. `ASSIGNED` -> Agent accepts request
     2. `PICKED UP` -> Agent marks package collected from store
     3. `OUT_FOR_DELIVERY` -> Agent starts ride with GPS simulator
     4. `DELIVERED` -> Agent completes dropoff; payout is instantly added to today's earnings!
   - **Simulated GPS Location Updates**: Partner can trigger real-time GPS coordinate steps broadcasted via Socket.io directly to the customer's live tracking map.

3. **Admin Operations Center (`/admin/dashboard`)**
   - **Real-Time KPIs**: Total Customers, Total Orders, Today's Orders, Revenue, Active Delivery Agents, Pending Partner Applications, and Low-Stock Warnings.
   - **Inventory SKU Management (`/admin/products`)**: Add new products, update prices, edit stock, upload image URLs, and manage categories.
   - **Order Management (`/admin/orders`)**: Filter orders by status, manually assign delivery agents to orders, advance order statuses, or issue customer refunds.
   - **Delivery Fleet Verification (`/admin/delivery-agents`)**: Review pending partner applications, inspect vehicle and license documents, and *Approve*, *Suspend*, or *Reject* drivers.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 (Vite)
  - Tailwind CSS 3 (Custom Kirana & Emerald palette)
  - React Router DOM v6
  - Lucide React (Clean vector iconography)
  - Socket.io Client (Live event synchronization)
  - Canvas Confetti (Celebration effects)
  - Axios (API service layer with JWT interceptor)
- **Backend**:
  - Node.js & Express.js
  - Socket.io (Bi-directional real-time communication)
  - JWT Authentication (`jsonwebtoken`) & `bcryptjs` password hashing
  - Database: Dual-engine support:
    - **Smart Embedded JSON Persistence** (runs 100% out of the box with zero external database setup required, persisting in `backend/data/`).
    - **MongoDB / Mongoose** (seamlessly connects to MongoDB Atlas or local MongoDB when configured in `.env`).
  - Modular services: `PaymentService` (Mock + extensible Razorpay provider) and `DeliveryAssignmentService` (Haversine distance algorithm & workload balancing).

---

## 🔑 Demo Accounts (Requirement #43)

For testing and evaluation, pre-seeded accounts are provided with a 1-click login switcher at the top of the website:

| Role | Email | Password | Direct Portal Link |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@martwithus.com` | `Customer@123` | [Customer Home](http://localhost:5173/) |
| **Delivery Partner** | `delivery@martwithus.com` | `Delivery@123` | [Partner Portal](http://localhost:5173/delivery/dashboard) |
| **Admin** | `admin@martwithus.com` | `Admin@123` | [Admin Center](http://localhost:5173/admin/dashboard) |

---

## 📦 Realistic 100+ Products Seed Dataset (Requirement #35)

The platform is pre-loaded with over 130 realistic Indian grocery products across:
- **Grocery & Staples**: Aashirvaad Atta, Fortune Atta, India Gate Basmati, Tata Sampann Toor Dal, Fortune Sunflower Oil, Amul Pure Ghee, Tata Salt, Madhur Sugar, Everest Garam Masala, MDH Deggi Mirch, etc.
- **Fresh Produce**: Red Onions (Nashik), Hybrid Tomatoes, Potatoes, Shimla Royal Delicious Apples, Robusta Bananas, Nagpur Oranges, Green Chillies, Fresh Coriander.
- **Dairy & Eggs**: Amul Taaza Milk, Amul Gold Milk, Amul Salted Butter, Milky Mist Fresh Paneer, Amul Masti Dahi, Eggoz Farm Fresh White Eggs, NutriEgg Brown Eggs.
- **Snacks & Beverages**: Parle-G, Britannia Good Day, Dark Fantasy, Lay's Magic Masala, Kurkure, Haldiram's Aloo Bhujia, Cadbury Dairy Milk Silk, Tata Tea Gold, Nescafé Classic.
- **Household & Cleaning**: Surf Excel Easy Wash, Ariel Matic Liquid, Vim Gel, Harpic Power Plus, Lizol Disinfectant, Scotch-Brite, Origami Paper Towels.
- **Personal Care**: Dettol Soap, Dove Beauty Bar, Head & Shoulders Cool Menthol, Colgate Total, Nivea Soft Cream.
- **Baby Care**: Pampers All-Round Diaper Pants, Himalaya Gentle Wipes, Nestlé Cerelac, Johnson's Baby Shampoo.
- **Stationery & Utilities**: Classmate Notebooks, Cello Butterflow, Duracell Batteries, All Out Mosquito Refill.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Run the Development Servers
From the root project directory:
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

Alternatively, run each in separate terminals:
```bash
# Terminal 1 - Backend Server
cd backend
npm run dev

# Terminal 2 - Frontend Client
cd frontend
npm run dev
```

### 3. Open in Browser
- **Customer Marketplace**: [http://localhost:5173](http://localhost:5173)
- **Delivery Partner Portal**: [http://localhost:5173/delivery/dashboard](http://localhost:5173/delivery/dashboard)
- **Admin Control Panel**: [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)
- **Backend REST API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔄 End-to-End Workflow Demonstration

1. **Customer Order Journey**:
   - Open [http://localhost:5173](http://localhost:5173).
   - Use top bar 1-click switcher or login as `customer@martwithus.com` / `Customer@123`.
   - Browse groceries, search for "milk" or "atta", click "Add to Cart".
   - Open Cart Drawer -> Proceed to Checkout.
   - Confirm Address -> Choose Express Delivery -> Choose UPI / COD -> Place Order.
   - Enjoy the Confetti celebration and click **Track Live Delivery** (`/orders/:orderId`).

2. **Delivery Partner Workflow (Real-Time Synchronization)**:
   - In a second tab/window, open [http://localhost:5173/delivery/dashboard](http://localhost:5173/delivery/dashboard).
   - The newly placed order appears immediately in **Available Delivery Requests**!
   - Click **Accept Delivery** -> status updates to `ASSIGNED`.
   - Click **1. Mark Order Picked Up** -> status updates to `PICKED UP`.
   - Click **2. Start Ride & Mark Out for Delivery** -> status updates to `OUT_FOR_DELIVERY`.
   - Click **Step GPS Closer to Customer** -> coordinates update on the customer tracking map via Socket.io!
   - Click **3. Complete Delivery** -> status updates to `DELIVERED`, and payout is credited to agent earnings!
   - Switch back to customer tab: customer sees "Delivered 🎉" and can rate the delivery experience.

3. **Admin Monitoring & Control**:
   - Open [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard).
   - View updated revenue, orders, and fleet statistics.
   - Go to **Delivery Fleet Partners** -> inspect Vikram Shinde's pending application -> click **APPROVE**.
   - Go to **Inventory & Products** -> add or edit any SKU or restock items with 1 click.
