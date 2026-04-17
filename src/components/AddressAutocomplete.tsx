import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { useSettingsStore } from "../store/settingsStore";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, distance: number | null) => void;
}

export function AddressAutocomplete({ onAddressSelect }: AddressAutocompleteProps) {
  const { restaurantCoords, deliveryFeePerKm, baseDeliveryFee } = useSettingsStore();
  
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "br" }, // Restrict to Brazil
    },
    debounce: 300,
  });

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      let distance = null;
      if (restaurantCoords) {
        // Simple Haversine distance for demo, or we could use Distance Matrix API
        distance = calculateDistance(restaurantCoords.lat, restaurantCoords.lng, lat, lng);
      }
      
      onAddressSelect(address, distance);
    } catch (error) {
      console.error("Error: ", error);
      onAddressSelect(address, null);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="Digite seu endereço de entrega..."
          className="w-full bg-[#1A1A1A] border-[#2A2A2A] focus-visible:ring-[#7C3AED] text-white placeholder:text-[#A1A1AA]/50 h-11 text-[13px] rounded-lg pl-10"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
      </div>
      
      {status === "OK" && (
        <ul className="absolute z-[100] w-full mt-2 bg-[#1A1A1A] border-2 border-[#7C3AED]/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="px-4 py-3 text-sm text-[#E1E1E1] hover:bg-[#7C3AED] hover:text-white cursor-pointer transition-all duration-200 border-b border-[#2A2A2A] last:border-0 flex items-center gap-3 group"
            >
              <MapPin size={16} className="text-[#7C3AED] group-hover:text-white shrink-0" />
              <span className="truncate">{description}</span>
            </li>
          ))}
        </ul>
      )}
      
      {!ready && value.length > 0 && (
        <p className="text-[10px] text-[#EF4444] mt-1 ml-1 opacity-70">
          ⚠️ Google Maps não carregado. Verifique sua Chave de API no index.html.
        </p>
      )}
    </div>
  );
}

// Haversine formula to calculate distance in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
