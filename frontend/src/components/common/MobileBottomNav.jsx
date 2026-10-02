import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, Package, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav() {
  const { itemsCount, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();

  const getProfileLink = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'delivery') return '/delivery/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/profile';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/80 shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-14">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-0.5 ${
              isActive ? 'text-brand-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        {/* Search */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-0.5 ${
              isActive ? 'text-brand-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </NavLink>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center space-y-0.5 text-gray-500 relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            {itemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                {itemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-brand-700">Cart</span>
        </button>

        {/* Orders */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-0.5 ${
              isActive ? 'text-brand-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to={getProfileLink()}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-0.5 ${
              isActive ? 'text-brand-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
