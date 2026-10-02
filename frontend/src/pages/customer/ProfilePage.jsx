import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Package,
  Heart,
  CreditCard,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [msg, setMsg] = useState('');

  // Address modal/form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    house: '',
    street: '',
    area: 'Baner',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    landmark: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setMsg('');
      const res = await authAPI.updateProfile({ name, phone });
      if (res.success) {
        setMsg('Profile updated successfully!');
        await refreshProfile();
      }
    } catch (e) {
      setMsg('Error: ' + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.addAddress(newAddr);
      if (res.success) {
        setShowAddressModal(false);
        await refreshProfile();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Delete this address?')) {
      try {
        await authAPI.deleteAddress(id);
        await refreshProfile();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Please Log In</h2>
        <p className="text-xs text-gray-500">Sign in to manage your addresses and profile.</p>
        <Link to="/login" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center uppercase shadow-md shadow-brand-600/20">
            {user.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500 font-mono">{user.phone}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-100 text-brand-800">
              Verified Shopper
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="px-4 py-2 border border-gray-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition flex items-center space-x-1.5 ${
            activeTab === 'profile' ? 'text-brand-700 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition flex items-center space-x-1.5 ${
            activeTab === 'addresses' ? 'text-brand-700 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({(user.addresses || []).length})</span>
        </button>

        <Link
          to="/orders"
          className="pb-3 text-gray-400 hover:text-gray-700 transition flex items-center space-x-1.5"
        >
          <Package className="w-4 h-4" />
          <span>Order History</span>
        </Link>
      </div>

      {/* Tab 1: Profile Info Form */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
            Personal Information
          </h3>

          {msg && (
            <p className={`text-xs font-semibold ${msg.includes('Error') ? 'text-rose-600' : 'text-emerald-700'}`}>
              {msg}
            </p>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email Address (Read Only)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2.5 bg-gray-100 border text-gray-400 rounded-xl text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-700"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-sm text-gray-900">Delivery Addresses</h3>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(user.addresses || []).map((a) => (
              <div
                key={a._id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{a.fullName}</span>
                    {a.isDefault && (
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{a.house}, {a.street}</p>
                  <p className="text-xs text-gray-600">{a.area}, {a.city} — {a.pincode}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{a.phone}</p>
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(a._id)}
                    className="text-xs font-semibold text-rose-600 hover:underline flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <h3 className="font-black text-base text-gray-900">Add New Delivery Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Flat / Building</label>
                    <input
                      type="text"
                      required
                      value={newAddr.house}
                      onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Street / Area</label>
                    <input
                      type="text"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">City</label>
                      <input
                        type="text"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-bold shadow-md"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
