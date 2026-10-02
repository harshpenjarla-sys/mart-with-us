import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Building,
  Smartphone,
  Landmark,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { ordersAPI, authAPI } from '../../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const { cartItems, subtotal, deliveryFee, tax, grandTotal, totalSavings, clearCart } = useCart();
  const { selectedLocation } = useLocation();

  // Multi-step: 1 = Address, 2 = Delivery Slot, 3 = Payment
  const [currentStep, setCurrentStep] = useState(1);

  // Address State
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(
    user?.addresses?.find(a => a.isDefault)?._id || (user?.addresses?.[0]?._id) || ''
  );
  const [showAddressForm, setShowAddressForm] = useState(user?.addresses?.length === 0);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    house: '',
    street: '',
    area: selectedLocation?.area || 'Baner',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: selectedLocation?.pincode || '411045',
    landmark: ''
  });

  // Delivery slot state
  const [deliveryType, setDeliveryType] = useState('STANDARD');
  const [scheduledSlot, setScheduledSlot] = useState('Today, 25-35 mins');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    if (user?.addresses?.length) {
      setAddresses(user.addresses);
      if (!selectedAddressId) {
        setSelectedAddressId(user.addresses[0]._id);
      }
    }
  }, [user]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.house || !addressForm.street) {
      setError('Please fill in all required address fields.');
      return;
    }

    try {
      if (isAuthenticated) {
        const res = await authAPI.addAddress(addressForm);
        if (res.success) {
          setAddresses(res.addresses);
          setSelectedAddressId(res.addresses[res.addresses.length - 1]._id);
          setShowAddressForm(false);
          await refreshProfile();
        }
      } else {
        const newAddr = { ...addressForm, _id: 'addr_' + Date.now(), isDefault: true };
        setAddresses([newAddr]);
        setSelectedAddressId(newAddr._id);
        setShowAddressForm(false);
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setIsProcessing(true);

    try {
      // Find selected address
      const addr = addresses.find(a => a._id === selectedAddressId) || addressForm;

      if (!addr || !addr.house) {
        setError('Please select or provide a valid delivery address.');
        setCurrentStep(1);
        setIsProcessing(false);
        return;
      }

      // Map cart products for order API
      const formattedProducts = cartItems.map(item => ({
        productId: String(item.product._id || item.product.id),
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        mrp: item.product.mrp,
        quantity: item.quantity,
        unit: item.product.quantity,
        image: item.product.images?.[0]
      }));

      const payload = {
        products: formattedProducts,
        address: addr,
        paymentMethod,
        deliveryType,
        scheduledSlot: deliveryType === 'STANDARD' ? 'Today, 25-35 mins' : scheduledSlot,
        subtotal,
        discount: totalSavings,
        deliveryFee,
        tax,
        storeId: selectedLocation?.storeId || 'store-baner-1'
      };

      const res = await ordersAPI.create(payload);
      if (res.success && res.order) {
        clearCart();
        navigate(`/order-confirmed/${res.order.orderId}`, { state: { order: res.order } });
      } else {
        throw new Error(res.message || 'Order creation failed.');
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Checkout Progress Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center space-x-2 text-xs font-extrabold ${
              currentStep === 1 ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
              currentStep > 1 ? 'bg-brand-600 text-white' : currentStep === 1 ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'bg-gray-100 text-gray-500'
            }`}>
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className="hidden sm:inline">Delivery Address</span>
          </button>

          <div className={`h-0.5 flex-1 mx-3 ${currentStep > 1 ? 'bg-brand-600' : 'bg-gray-200'}`} />

          {/* Step 2 */}
          <button
            onClick={() => { if (selectedAddressId || !showAddressForm) setCurrentStep(2); }}
            className={`flex items-center space-x-2 text-xs font-extrabold ${
              currentStep === 2 ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
              currentStep > 2 ? 'bg-brand-600 text-white' : currentStep === 2 ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'bg-gray-100 text-gray-500'
            }`}>
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <span className="hidden sm:inline">Delivery Slot</span>
          </button>

          <div className={`h-0.5 flex-1 mx-3 ${currentStep > 2 ? 'bg-brand-600' : 'bg-gray-200'}`} />

          {/* Step 3 */}
          <button
            onClick={() => { if (selectedAddressId || !showAddressForm) setCurrentStep(3); }}
            className={`flex items-center space-x-2 text-xs font-extrabold ${
              currentStep === 3 ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
              currentStep === 3 ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'bg-gray-100 text-gray-500'
            }`}>
              3
            </div>
            <span className="hidden sm:inline">Payment</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Flow (Steps) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ADDRESS */}
          {currentStep === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <h3 className="font-extrabold text-base text-gray-900">Step 1 — Select Delivery Address</h3>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Saved Addresses Cards */}
              {!showAddressForm && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((a) => {
                    const isSelected = selectedAddressId === a._id;
                    return (
                      <div
                        key={a._id}
                        onClick={() => setSelectedAddressId(a._id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-sm">{a.fullName}</span>
                            <span className="text-xs text-gray-500 font-mono">({a.phone})</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {a.house}, {a.street}, {a.area}
                          </p>
                          <p className="text-xs text-gray-500">
                            {a.city}, {a.state} — <strong className="text-gray-800">{a.pincode}</strong>
                            {a.landmark && ` (Near ${a.landmark})`}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center space-x-2"
                    >
                      <span>Proceed to Delivery Slot</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add Address Form */}
              {(showAddressForm || addresses.length === 0) && (
                <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        required
                        placeholder="e.g. Rohan Sharma"
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                        placeholder="10-digit mobile"
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Flat / House / Building *</label>
                      <input
                        type="text"
                        value={addressForm.house}
                        onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })}
                        required
                        placeholder="e.g. Flat 402, Building B"
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Street / Society *</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                        placeholder="e.g. Green Meadows Society"
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Area / Locality *</label>
                      <input
                        type="text"
                        value={addressForm.area}
                        onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                        required
                        placeholder="e.g. Baner"
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                        placeholder="411045"
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700 block mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        placeholder="e.g. Opposite Westend Hotel"
                        className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-xs font-bold text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition ml-auto"
                    >
                      Save & Use Address
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: DELIVERY OPTIONS */}
          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <Truck className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-base text-gray-900">Step 2 — Estimated Delivery</h3>
              </div>

              {/* Estimated Delivery Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl">
                  🚚
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">Arrives in 25–35 minutes</h4>
                  <p className="text-xs text-gray-600">
                    Fulfilling from <span className="font-bold text-emerald-800">{selectedLocation?.storeName || 'MART WITH US Baner Hub'}</span>
                  </p>
                </div>
              </div>

              {/* Delivery Slots Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDeliveryType('STANDARD')}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    deliveryType === 'STANDARD'
                      ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-gray-900">⚡ Standard Express</span>
                    {deliveryType === 'STANDARD' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>
                  <p className="text-xs text-gray-500">Fastest delivery by nearby available partner.</p>
                  <span className="inline-block text-[11px] font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-md">
                    25-35 mins
                  </span>
                </div>

                <div
                  onClick={() => setDeliveryType('SCHEDULED')}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    deliveryType === 'SCHEDULED'
                      ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-gray-900">📅 Scheduled Delivery</span>
                    {deliveryType === 'SCHEDULED' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>
                  <p className="text-xs text-gray-500">Choose preferred time slot for later today or tomorrow.</p>
                  <select
                    value={scheduledSlot}
                    onChange={(e) => setScheduledSlot(e.target.value)}
                    disabled={deliveryType !== 'SCHEDULED'}
                    className="w-full p-2 bg-white border rounded-lg text-xs font-semibold"
                  >
                    <option value="Today, 4:00 PM - 6:00 PM">Today, 4:00 PM - 6:00 PM</option>
                    <option value="Today, 7:00 PM - 9:00 PM">Today, 7:00 PM - 9:00 PM</option>
                    <option value="Tomorrow Morning, 7:00 AM - 9:00 AM">Tomorrow Morning, 7:00 AM - 9:00 AM</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-gray-500 hover:underline"
                >
                  Back to Address
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center space-x-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {currentStep === 3 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-base text-gray-900">Step 3 — Payment Option</h3>
              </div>

              <div className="space-y-3">
                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'UPI' ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                        UPI
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900">UPI / QR (Instant & Recommended)</span>
                        <p className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    {paymentMethod === 'UPI' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/50">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="Enter UPI ID (e.g. mobile@upi or username@okaxis)"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:border-brand-500"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        ✨ Simulated payment gateway for development mode. Auto-verifies instantly.
                      </span>
                    </div>
                  )}
                </div>

                {/* Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'Credit Card' ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        💳
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900">Credit / Debit Card</span>
                        <p className="text-[11px] text-gray-500">Visa, Mastercard, RuPay, Maestro</p>
                      </div>
                    </div>
                    {paymentMethod === 'Credit Card' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>

                  {paymentMethod === 'Credit Card' && (
                    <div className="mt-3 pt-3 border-t border-blue-200/50 grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="Card Number (4000 1234 5678 9010)"
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                      />
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        maxLength="3"
                        className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Net Banking */}
                <div
                  onClick={() => setPaymentMethod('Net Banking')}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'Net Banking' ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        🏛️
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900">Net Banking</span>
                        <p className="text-[11px] text-gray-500">SBI, HDFC, ICICI, Axis & 50+ Banks</p>
                      </div>
                    </div>
                    {paymentMethod === 'Net Banking' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === 'Cash on Delivery' ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        💵
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</span>
                        <p className="text-[11px] text-gray-500">Pay cash or UPI directly to delivery agent on arrival</p>
                      </div>
                    </div>
                    {paymentMethod === 'Cash on Delivery' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-gray-500 hover:underline"
                >
                  Back to Slot
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-600/30 transition flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <span>PAY ₹{grandTotal} & PLACE ORDER</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-soft space-y-4">
            <h4 className="font-black text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-brand-700 font-bold">{cartItems.length} items</span>
            </h4>

            {/* Compact items list */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-50">
              {cartItems.map((item) => (
                <div key={item.product._id || item.product.id} className="pt-2 flex justify-between text-xs">
                  <div className="truncate max-w-[180px]">
                    <p className="font-bold text-gray-800 truncate">{item.product.name}</p>
                    <span className="text-[10px] text-gray-400">Qty: {item.quantity} × ₹{item.product.price}</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{item.quantity * item.product.price}</span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-₹{totalSavings}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-brand-600">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Handling</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-brand-700">₹{grandTotal}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <span>Payments encrypted with 256-bit bank-grade SSL security.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
