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
} from 'lucide-react';
import { INITIAL_PHARMACIES, type Pharmacy } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const PharmacyFinderSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [pharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy>(INITIAL_PHARMACIES[0]);
  const [filter24x7, setFilter24x7] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const filteredPharmacies = pharmacies.filter((p) => {
    if (filter24x7 && !p.isOpen24x7) return false;
    if (!searchMedicine.trim()) return true;
    const query = searchMedicine.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.availableMedicines.some((m) => m.toLowerCase().includes(query))
    );
  });

  const handleGetDirections = (pharm: Pharmacy) => {
    setSelectedPharmacy(pharm);
    setAlertMsg(`Navigation started to ${pharm.name}. Distance: ${pharm.distanceKm} km (approx ${Math.round(pharm.distanceKm * 4)} mins driving).`);
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const handleCall = (pharm: Pharmacy) => {
    setAlertMsg(`Connecting call to ${pharm.name} at ${pharm.phone}...`);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            Live Medicine Stock & GPS Locator
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.pharmacyTitle}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">{t.pharmacySubtitle}</p>
        </div>
      </div>

      {alertMsg && (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in">
          <span>{alertMsg}</span>
          <button onClick={() => setAlertMsg(null)} className="text-white hover:underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input & Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchMedicine}
            onChange={(e) => setSearchMedicine(e.target.value)}
            placeholder={t.searchPharmacy}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setFilter24x7(!filter24x7)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap border ${
            filter24x7
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          {t.filter24x7}
        </button>
      </div>

      {/* Two Column: List & Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pharmacy Cards List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredPharmacies.map((pharm) => (
            <div
              key={pharm.id}
              onClick={() => setSelectedPharmacy(pharm)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                selectedPharmacy.id === pharm.id
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {pharm.name}
                    </h3>
                    {pharm.isOpen24x7 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                        24x7
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{pharm.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {pharm.distanceKm} km
                    </span>
                    <span className="text-[10px] text-slate-400 block">{t.distance}</span>
                  </div>
                </div>
              </div>

              {/* Medicine Stock Tags */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">{t.availableMeds}:</span>
                  {pharm.availableMedicines.map((med, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                    >
                      ✓ {med}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCall(pharm);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
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
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t.directions}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Interactive Map Simulation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{t.mapView}</span>
            </h4>

            {/* Simulated Canvas/SVG GPS Map */}
            <div className="w-full h-56 bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4">
              {/* Roads / Grid Background */}
              <svg className="absolute inset-0 w-full h-full opacity-30 text-slate-400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path d="M 0 60 Q 150 120 300 80" fill="none" stroke="#3b82f6" strokeWidth="4" />
                <path d="M 120 0 Q 150 150 200 300" fill="none" stroke="#93c5fd" strokeWidth="3" />
              </svg>

              {/* Pins for pharmacies */}
              {pharmacies.map((p, idx) => {
                const isCurrent = p.id === selectedPharmacy.id;
                const positions = [
                  { top: '35%', left: '42%' },
                  { top: '65%', left: '28%' },
                  { top: '25%', left: '70%' },
                  { top: '75%', left: '60%' },
                ];
                const pos = positions[idx % positions.length];

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPharmacy(p)}
                    style={{ top: pos.top, left: pos.left }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                      isCurrent ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-full shadow-lg ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-300 animate-bounce'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs border border-slate-200 dark:border-slate-700 whitespace-nowrap mt-0.5">
                      {p.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Pin Details Box */}
          <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
              {selectedPharmacy.name}
            </h5>
            <p className="text-[11px] text-slate-500 mb-2">{selectedPharmacy.address}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-600 font-bold">
                {selectedPharmacy.isOpen24x7 ? 'Open 24 Hours' : 'Open till 11:00 PM'}
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {selectedPharmacy.phone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
