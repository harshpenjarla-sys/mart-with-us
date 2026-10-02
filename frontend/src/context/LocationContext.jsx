import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

const popularLocations = [
  { area: 'Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045', storeId: 'store-baner-1', storeName: 'MART WITH US — Baner Hub (2.1 km, 20-30 min)' },
  { area: 'Wakad', city: 'Pune', state: 'Maharashtra', pincode: '411057', storeId: 'store-wakad-2', storeName: 'MART WITH US — Wakad Express (3.8 km, 25-35 min)' },
  { area: 'Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038', storeId: 'store-kothrud-3', storeName: 'MART WITH US — Kothrud Supercenter (4.5 km, 30-40 min)' },
  { area: 'Aundh', city: 'Pune', state: 'Maharashtra', pincode: '411007', storeId: 'store-baner-1', storeName: 'MART WITH US — Baner Hub (2.9 km, 25-30 min)' },
  { area: 'Hinjawadi', city: 'Pune', state: 'Maharashtra', pincode: '411057', storeId: 'store-wakad-2', storeName: 'MART WITH US — Wakad Express (4.2 km, 30-35 min)' }
];

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('mwu_location');
      return saved ? JSON.parse(saved) : popularLocations[0];
    } catch (e) {
      return popularLocations[0];
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mwu_location', JSON.stringify(selectedLocation));
    } catch (e) {}
  }, [selectedLocation]);

  const selectLocation = (loc) => {
    setSelectedLocation(loc);
    setIsLocationModalOpen(false);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        selectLocation,
        popularLocations,
        isLocationModalOpen,
        setIsLocationModalOpen
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
