import React from 'react';
import { MapPin, X, Check, Navigation, Store } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export default function LocationModal() {
  const { selectedLocation, selectLocation, popularLocations, isLocationModalOpen, setIsLocationModalOpen } = useLocation();

  if (!isLocationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Select Delivery Area</h3>
              <p className="text-xs text-gray-500">Connecting to nearest MART WITH US Hub</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Badge */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Navigation className="w-4 h-4 text-emerald-700" />
              <div>
                <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">Current Hub</p>
                <p className="text-sm font-bold text-gray-900">{selectedLocation.area}, {selectedLocation.city}</p>
                <p className="text-xs text-gray-600">{selectedLocation.storeName}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
              Available Delivery Hubs (Pune)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {popularLocations.map((loc) => {
                const isSelected = selectedLocation.area === loc.area;
                return (
                  <button
                    key={loc.area}
                    onClick={() => selectLocation(loc)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-sm ring-1 ring-brand-500'
                        : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 p-2 rounded-lg ${isSelected ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 text-sm">{loc.area}, {loc.city}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">{loc.pincode}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{loc.storeName}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>⚡ Guaranteed 20-30 min express delivery</span>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="font-bold text-brand-700 hover:text-brand-800"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
