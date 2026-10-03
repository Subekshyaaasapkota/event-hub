// components/common/MapPicker.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  MapPin,
  Navigation,
  Loader2,
  Search,
  Eye,
  Map,
  X,
  Crosshair,
  Info,
  CheckCircle,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DISTRICT_COORDINATES } from "../../utils/districtCoordinates";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom map click handler
function MapClickHandler({ onLocationClick }) {
  useMapEvents({
  click(e) {
  onLocationClick(e.latlng);
  },
  });
  return null;
}

// Reverse geocoding using OpenStreetMap Nominatim
const reverseGeocode = async (lat, lng) => {
  try {
  const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
  {
  headers: {
  "User-Agent": "EventHub/1.0",
  },
  },
  );
  const data = await response.json();
  return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
  console.error("Reverse geocoding error:", error);
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Search for places
const searchPlaces = async (query, lat, lng) => {
  try {
  const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=np&bounded=1&viewbox=${lng - 0.1},${lat - 0.1},${lng + 0.1},${lat + 0.1}`,
  {
  headers: {
  "User-Agent": "EventHub/1.0",
  },
  },
  );
  const data = await response.json();
  return data.map((place) => ({
  name: place.display_name.split(",")[0],
  address: place.display_name,
  lat: parseFloat(place.lat),
  lng: parseFloat(place.lon),
  }));
  } catch (error) {
  console.error("Place search error:", error);
  return [];
  }
};

const MapPicker = ({ onLocationSelect, searchQuery, initialLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery || "");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(
  initialLocation || null,
  );
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("map");

  // Determine initial map center based on district (searchQuery)
  const getInitialMapCenter = () => {
  if (initialLocation) {
  return initialLocation;
  }
  if (searchQuery && DISTRICT_COORDINATES[searchQuery]) {
  return DISTRICT_COORDINATES[searchQuery];
  }
  // Default to Kathmandu if no district or initial location
  return { lat: 27.7172, lng: 85.324 };
  };

  const [mapCenter, setMapCenter] = useState(getInitialMapCenter());
  const [mapZoom, setMapZoom] = useState(15);
  const [addressString, setAddressString] = useState("");

  const mapRef = useRef(null);

  // Update map center when searchQuery (district) changes
  useEffect(() => {
  if (searchQuery && DISTRICT_COORDINATES[searchQuery] && !initialLocation) {
  setMapCenter(DISTRICT_COORDINATES[searchQuery]);
  setSearchTerm(searchQuery);
  }
  }, [searchQuery, initialLocation]);

  // Get user's current location
  const useCurrentLocation = () => {
  setLoading(true);
  if (!navigator.geolocation) {
  toast.error("Geolocation is not supported by your browser");
  setLoading(false);
  return;
  }

  navigator.geolocation.getCurrentPosition(
  async (position) => {
  const location = {
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  };
  setSelectedLocation(location);
  setMapCenter(location);
  setMapZoom(16);

  const address = await reverseGeocode(location.lat, location.lng);
  setAddressString(address);
  setSearchTerm(address);

  setLoading(false);
  },
  (error) => {
  console.error("Geolocation error:", error);
  toast.error(
  "Unable to retrieve your location. Please check your location permissions.",
  );
  setLoading(false);
  },
  );
  };

  // Handle map click
  const handleMapClick = async (latlng) => {
  const location = {
  lat: latlng.lat,
  lng: latlng.lng,
  };
  setSelectedLocation(location);

  const address = await reverseGeocode(location.lat, location.lng);
  setAddressString(address);
  setSearchTerm(address);
  };

  // Search for places
  const handleSearch = async () => {
  if (!searchTerm.trim()) return;

  setLoading(true);
  try {
  const results = await searchPlaces(
  searchTerm,
  mapCenter.lat,
  mapCenter.lng,
  );
  setSearchResults(results);
  } catch (error) {
  console.error("Search error:", error);
  } finally {
  setLoading(false);
  }
  };

  // Select a search result
  const selectSearchResult = async (result) => {
  const location = {
  lat: result.lat,
  lng: result.lng,
  };
  setSelectedLocation(location);
  setMapCenter(location);
  setMapZoom(17);
  setAddressString(result.address);
  setSearchTerm(result.address);
  setSearchResults([]);
  };

  // Confirm location selection
  const confirmLocation = () => {
  if (selectedLocation) {
  onLocationSelect({
  lat: selectedLocation.lat,
  lng: selectedLocation.lng,
  address: addressString,
  });
  setIsOpen(false);
  }
  };

  return (
  <>
  {/* Location Preview Button */}
  <button
  type="button"
  onClick={() => setIsOpen(true)}
  className="w-full bg-slate-50 border-none rounded-3xl py-6 px-8 flex items-center justify-between group hover:bg-slate-100 transition-all"
  >
  <div className="flex items-center gap-3">
  <MapPin size={20} className="text-indigo-600" />
  <span className="font-bold text-slate-700">
  {selectedLocation
  ? addressString || "Location selected"
  : "Pick location on map"}
  </span>
  </div>
  <Crosshair
  size={18}
  className="text-slate-400 group-hover:text-indigo-600 transition-colors"
  />
  </button>

  {/* Modal */}
  {isOpen && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
  <div className="bg-white rounded-2xl w-full max-w-5xl h-[95vh] overflow-hidden flex flex-col shadow-2xl">
  {/* Header - compact single row */}
  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
  {/* Title */}
  <div className="flex items-center gap-2 min-w-0 flex-1">
  <MapPin size={18} className="text-indigo-600 shrink-0" />
  <h3 className="text-base font-bold text-slate-900 truncate">
  Select Event Location
  </h3>
  </div>

  {/* View toggle - inline with header */}
  <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
  <button
  onClick={() => setViewMode("map")}
  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
  viewMode === "map"
  ? "bg-indigo-600 text-white shadow-sm"
  : "text-slate-600 hover:text-slate-900"
  }`}
  >
  <Map size={13} />
  Map
  </button>
  <button
  onClick={() => setViewMode("satellite")}
  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
  viewMode === "satellite"
  ? "bg-indigo-600 text-white shadow-sm"
  : "text-slate-600 hover:text-slate-900"
  }`}
  >
  <Eye size={13} />
  Satellite
  </button>
  </div>

  <button
  onClick={() => setIsOpen(false)}
  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
  >
  <X size={18} />
  </button>
  </div>

  {/* Search Bar - compact */}
  <div className="px-4 py-2 bg-white border-b border-slate-100">
  <div className="flex gap-2">
  <div className="flex-1 relative">
  <Search
  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
  size={15}
  />
  <input
  type="text"
  placeholder="Search for a place or address in Nepal..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
  />
  </div>
  <button
  onClick={handleSearch}
  disabled={loading}
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
  >
  {loading ? (
  <Loader2 className="animate-spin" size={15} />
  ) : (
  <Search size={15} />
  )}
  Search
  </button>
  <button
  onClick={useCurrentLocation}
  disabled={loading}
  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
  >
  {loading ? (
  <Loader2 className="animate-spin" size={15} />
  ) : (
  <Navigation size={15} />
  )}
  My Location
  </button>
  </div>

  {/* Search Results dropdown */}
  {searchResults.length > 0 && (
  <div className="mt-2 border border-slate-200 rounded-lg max-h-40 overflow-y-auto shadow-lg">
  {searchResults.map((result, index) => (
  <button
  key={index}
  onClick={() => selectSearchResult(result)}
  className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
  >
  <p className="font-semibold text-slate-800 text-sm">
  {result.name}
  </p>
  <p className="text-xs text-slate-500 truncate">
  {result.address}
  </p>
  </button>
  ))}
  </div>
  )}
  </div>

  {/* Map Container - takes all remaining space */}
  <div className="flex-1 relative bg-slate-100 min-h-0">
  <MapContainer
  key={`${viewMode}-${isOpen}`}
  center={[mapCenter.lat, mapCenter.lng]}
  zoom={mapZoom}
  style={{ height: "100%", width: "100%" }}
  zoomControl={false}
  ref={mapRef}
  >
  <TileLayer
  url={
  viewMode === "map"
  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  }
  attribution={
  viewMode === "map"
  ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  : '&copy; <a href="https://www.esri.com">Esri</a>'
  }
  />
  <ZoomControl position="bottomright" />
  <MapClickHandler onLocationClick={handleMapClick} />

  {selectedLocation && (
  <Marker
  position={[selectedLocation.lat, selectedLocation.lng]}
  draggable={true}
  eventHandlers={{
  dragend: async (e) => {
  const marker = e.target;
  const position = marker.getLatLng();
  const location = {
  lat: position.lat,
  lng: position.lng,
  };
  setSelectedLocation(location);
  const address = await reverseGeocode(
  location.lat,
  location.lng,
  );
  setAddressString(address);
  setSearchTerm(address);
  },
  }}
  >
  <Popup>
  <div className="text-sm">
  <strong>Event Location</strong>
  <br />
  {addressString || "Selected location"}
  <br />
  <span className="text-xs text-slate-500">
  Lat: {selectedLocation.lat.toFixed(6)}
  <br />
  Lng: {selectedLocation.lng.toFixed(6)}
  </span>
  </div>
  </Popup>
  </Marker>
  )}
  </MapContainer>
  </div>

  {/* Footer - compact single row */}
  <div className="px-4 py-2.5 border-t border-slate-100 flex justify-between items-center bg-slate-50">
  <div className="text-xs text-slate-500 min-w-0 flex-1 mr-4">
  {selectedLocation ? (
  <div className="flex items-center gap-2 min-w-0">
  <MapPin size={13} className="text-indigo-600 shrink-0" />
  <span className="font-mono truncate">
  {selectedLocation.lat.toFixed(5)}°,{""}
  {selectedLocation.lng.toFixed(5)}°
  </span>
  {addressString && (
  <span className="text-slate-400 truncate hidden sm:block">
  - {addressString}
  </span>
  )}
  </div>
  ) : (
  <span className="text-slate-400 italic">
  Click the map to pin a location
  </span>
  )}
  </div>
  <div className="flex gap-2 shrink-0">
  <button
  onClick={() => setIsOpen(false)}
  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
  >
  Cancel
  </button>
  <button
  onClick={confirmLocation}
  disabled={!selectedLocation}
  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
  >
  <CheckCircle size={15} />
  Confirm Location
  </button>
  </div>
  </div>
  </div>
  </div>
  )}
  </>
  );
};

export default MapPicker;
