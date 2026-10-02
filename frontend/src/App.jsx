import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import DeliveryLayout from './layouts/DeliveryLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import OrdersHistoryPage from './pages/customer/OrdersHistoryPage';
import OffersPage from './pages/customer/OffersPage';
import WishlistPage from './pages/customer/WishlistPage';
import ProfilePage from './pages/customer/ProfilePage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';

// Delivery Pages
import DeliveryLoginPage from './pages/delivery/DeliveryLoginPage';
import DeliveryRegisterPage from './pages/delivery/DeliveryRegisterPage';
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminDeliveryAgentsPage from './pages/admin/AdminDeliveryAgentsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <SocketProvider>
              <Routes>
                {/* 1. CUSTOMER PORTAL */}
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmed/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="/orders/:id" element={<OrderTrackingPage />} />
                  <Route path="/orders" element={<OrdersHistoryPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* 2. DELIVERY PARTNER PORTAL */}
                <Route element={<DeliveryLayout />}>
                  <Route path="/delivery/login" element={<DeliveryLoginPage />} />
                  <Route path="/delivery/register" element={<DeliveryRegisterPage />} />
                  <Route path="/delivery/dashboard" element={<DeliveryDashboardPage />} />
                </Route>

                {/* 3. ADMIN CONTROL CENTER */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/delivery-agents" element={<AdminDeliveryAgentsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SocketProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
