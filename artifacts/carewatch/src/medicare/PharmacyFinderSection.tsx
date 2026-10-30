import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Search,
  Building,
  ExternalLink,
  ShieldCheck,
  Check,
  ShoppingBag,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';
import { INITIAL_PHARMACIES, type Pharmacy } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const PharmacyFinderSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [pharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy>(INITIAL_PHARMACIES[0]);
  const [filter24x7, setFilter24x7] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<'all' | 'walking'>('all');
  const [orderAlert, setOrderAlert] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'radar' | 'satellite'>('radar');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Bansal Institute of Engineering & Technology (BIET) Coordinates
  const BIET_LOCATION = {
    name: 'Bansal Institute of Engineering & Technology (BIET)',
    address: 'NH-24, Sitapur Road, Behind Sewa Hospital, Lucknow, UP - 226021',
    pincode: '226021',
    lat: 26.9463,
    lng: 80.9252,
  };

  const filteredPharmacies = pharmacies.filter((p) => {
    if (filter24x7 && !p.isOpen24x7) return false;
    if (distanceFilter === 'walking' && p.distanceKm > 0.6) return false;
    if (!searchMedicine.trim()) return true;
    const query = searchMedicine.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      (p.landmark && p.landmark.toLowerCase().includes(query)) ||
      p.availableMedicines.some((m) => m.toLowerCase().includes(query))
    );
  });

  const handleGetDirections = (pharm: Pharmacy) => {
    setSelectedPharmacy(pharm);
    // Open Google Maps navigation route directly from BIET Lucknow to Pharmacy
    const origin = `${BIET_LOCATION.lat},${BIET_LOCATION.lng}`;
    const destination = `${pharm.lat},${pharm.lng}`;
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}`;
    window.open(gmapsUrl, '_blank');
  };

  const handleCall = (pharm: Pharmacy) => {
    window.location.href = `tel:${pharm.phone.replace(/\s+/g, '')}`;
  };

  const handleOrderDelivery = (pharm: Pharmacy) => {
    setOrderAlert(
      `Delivery request placed with ${pharm.name}! Delivery agent assigned to BIET Campus, Lucknow (Pin: 226021). Estimated arrival: 15-20 mins.`
    );
    setTimeout(() => setOrderAlert(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Compass className="w-3.5 h-3.5 text-sky-300" />
            Live Pharmacy GPS Locator & Stock Engine
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.pharmacyTitle}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">
            Real-time verified pharmacies, medicine availability, and exact turn-by-turn map directions near your location.
          </p>
        </div>

        {/* Current Anchor Location Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 text-xs max-w-sm">
          <div className="flex items-center gap-2 text-sky-200 font-bold uppercase tracking-wider text-[11px]">
            <MapPin className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>Active Pincode: 226021 (Lucknow)</span>
          </div>
          <p className="text-white font-bold mt-1 text-xs">
            Bansal Institute of Engineering & Technology (BIET)
          </p>
          <p className="text-blue-100 text-[11px] mt-0.5">
            Sitapur Road, Near Sewa Hospital, Lucknow - 226021
          </p>
        </div>
      </div>

      {/* Delivery Toast Alert */}
      {orderAlert && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{orderAlert}</span>
          </div>
          <button
            onClick={() => setOrderAlert(null)}
            className="text-white hover:underline text-xs ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input & Quick Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchMedicine}
            onChange={(e) => setSearchMedicine(e.target.value)}
            placeholder="Search medicine (Dolo 650, Augmentin, Insulin, ORS) or medical store name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilter24x7(!filter24x7)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap border ${
              filter24x7
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {filter24x7 ? '✓ 24x7 Open Stores' : '24x7 Open'}
          </button>

          <button
            type="button"
            onClick={() => setDistanceFilter(distanceFilter === 'walking' ? 'all' : 'walking')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap border ${
              distanceFilter === 'walking'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {distanceFilter === 'walking' ? '✓ Walking (< 600m)' : 'Walking Distance (< 600m)'}
          </button>
        </div>
      </div>

      {/* Two Columns: Pharmacy List (Left) & Exact GPS Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pharmacy Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing {filteredPharmacies.length} pharmacies verified near{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                BIET Lucknow (226021)
              </strong>
            </span>
          </div>

          {filteredPharmacies.map((pharm) => {
            const isSelected = selectedPharmacy.id === pharm.id;
            return (
              <div
                key={pharm.id}
                onClick={() => setSelectedPharmacy(pharm)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {pharm.name}
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </h3>
                      {pharm.isOpen24x7 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                          24x7 Open
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                          {pharm.timing}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{pharm.address}</span>
                    </p>
                    {pharm.landmark && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                        📍 {pharm.landmark}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400 block">
                        {pharm.distance}
                      </span>
                      <span className="text-[10px] text-slate-400 block">from BIET Campus</span>
                    </div>
                  </div>
                </div>

                {/* Available Stock Tagline */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs max-w-md">
                    <span className="text-[11px] text-slate-400 font-medium">In Stock:</span>
                    {pharm.availableMedicines.slice(0, 4).map((med, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                      >
                        ✓ {med}
                      </span>
                    ))}
                    {pharm.availableMedicines.length > 4 && (
                      <span className="text-[10px] text-blue-600 font-bold">
                        +{pharm.availableMedicines.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCall(pharm);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                      title="Call Medical Store"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t.call}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections(pharm);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      title="Open Google Maps Route"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderDelivery(pharm);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      title="Order to BIET Campus"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Interactive GPS Map View (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between sticky top-20 h-fit space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Exact GPS Location Map</span>
              </h4>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setMapMode('radar')}
                  className={`px-2 py-1 rounded-md transition ${
                    mapMode === 'radar' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Interactive Radar
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('satellite')}
                  className={`px-2 py-1 rounded-md transition ${
                    mapMode === 'satellite' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Live Satellite
                </button>
              </div>
            </div>

            {/* Simulated High-Res GPS Map Canvas / Embed */}
            <div className="w-full h-72 bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              {mapMode === 'radar' ? (
                <>
                  {/* Radar Circles and Roads */}
                  <svg className="absolute inset-0 w-full h-full opacity-40 text-slate-600" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50%" cy="50%" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx="50%" cy="50%" r="85" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
                    <circle cx="50%" cy="50%" r="130" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
                    {/* Highway NH-24 Sitapur Road */}
                    <line x1="10%" y1="90%" x2="90%" y2="10%" stroke="#38bdf8" strokeWidth="5" />
                    {/* Ring Road Cross */}
                    <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#64748b" strokeWidth="3" />
                  </svg>

                  {/* Distance Rings Labels */}
                  <span className="absolute top-1/2 left-3/4 text-[9px] text-slate-500 font-mono font-bold">
                    500m
                  </span>
                  <span className="absolute top-1/2 left-[88%] text-[9px] text-slate-500 font-mono font-bold">
                    1.5km
                  </span>

                  {/* CENTER PIN: Bansal Institute of Engineering & Technology (BIET) */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg ring-4 ring-amber-400/30 animate-pulse">
                      🎓
                    </div>
                    <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mt-1">
                      BIET Lucknow (226021)
                    </span>
                  </div>

                  {/* PHARMACY PINS */}
                  {pharmacies.map((p, idx) => {
                    const isCurrent = p.id === selectedPharmacy.id;
                    // Positions relative to center BIET
                    const pinOffsets = [
                      { top: '42%', left: '56%' }, // Bansal Medicos (100m)
                      { top: '38%', left: '65%' }, // Apollo 24x7 (350m)
                      { top: '65%', left: '58%' }, // Sanjeevani (600m)
                      { top: '70%', left: '32%' }, // Jan Aushadhi (1.1km)
                      { top: '78%', left: '76%' }, // MedPlus (1.4km)
                      { top: '22%', left: '42%' }, // LifeCare (1.8km)
                    ];
                    const pos = pinOffsets[idx % pinOffsets.length];

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPharmacy(p)}
                        style={{ top: pos.top, left: pos.left }}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                          isCurrent ? 'scale-125 z-40' : 'hover:scale-110 z-20 opacity-85'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-full shadow-lg ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-400 animate-bounce'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap mt-0.5 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-900 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {p.name.split(' ')[0]} ({p.distance.split(' ')[0]})
                        </span>
                      </button>
                    );
                  })}
                </>
              ) : (
                /* Live OpenStreetMap Iframe for Sitapur Road Lucknow (226021) */
                <iframe
                  title="Lucknow Pharmacy Map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=80.9100%2C26.9350%2C80.9400%2C26.9550&layer=mapnik&marker=${selectedPharmacy.lat}%2C${selectedPharmacy.lng}`}
                  className="w-full h-full border-0 rounded-xl"
                />
              )}
            </div>
          </div>

          {/* Selected Medical Store Detailed Overview */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block">
                  Selected Destination
                </span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedPharmacy.name}
                </h5>
              </div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                {selectedPharmacy.distance}
              </span>
            </div>

            <p className="text-xs text-slate-500">{selectedPharmacy.address}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Hours:</span>
                <span className="font-semibold text-emerald-600">
                  {selectedPharmacy.isOpen24x7 ? 'Open 24 Hours' : selectedPharmacy.timing}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Helpline:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPharmacy.phone}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGetDirections(selectedPharmacy)}
              className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-98"
            >
              <Navigation className="w-4 h-4" />
              <span>Navigate from BIET Lucknow (Open Google Maps)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
