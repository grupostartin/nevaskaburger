import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { useJsApiLoader } from '@react-google-maps/api';
import { useMenuStore } from './store/menuStore';
import { useSettingsStore } from './store/settingsStore';

const libraries: ("places")[] = ["places"];

export default function App() {
  const fetchMenu = useMenuStore(state => state.fetchMenu);
  const fetchSettings = useSettingsStore(state => state.fetchSettings);

  useEffect(() => {
    fetchMenu();
    fetchSettings();
  }, [fetchMenu, fetchSettings]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#7C3AED] selection:text-white">
      {isLoaded ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adm" element={<Admin />} />
        </Routes>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
