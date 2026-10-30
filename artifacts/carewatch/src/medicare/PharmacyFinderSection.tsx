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
  Volume2,
} from 'lucide-react';
import { INITIAL_PHARMACIES, type Pharmacy } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const PharmacyFinderSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [pharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy>(INITIAL_PHARMACIES[0]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const filteredPharmacies = pharmacies.filter((p) => {
    if (!searchMedicine.trim()) return true;
    return (
      p.name.toLowerCase().includes(searchMedicine.toLowerCase()) ||
      p.availableMedicines.some((m) =>
        m.toLowerCase().includes(searchMedicine.toLowerCase())
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            Live Medicine Stock & GPS Locator
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.navPharmacyFinder}</h2>
          <p className="text-blue-100 text-sm max-w-xl mt-1">
            Locate verified 24x7 pharmacies, check reported medicine stock in real-time, get directions, and listen to pharmacy details.
          </p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? '???????? ???? ??? ???? ?????? ??? ???? ?? ???? ????? ???? ?????? ??????? ?? ????? ?????? ??????? ?? ???? ????? ??? ???? ????'
              : 'Welcome to Smart Pharmacy Finder. Find nearby pharmacies with live medicine stock availability and spoken directions.'
          }
          lang={lang}
          label="Listen Overview"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchMedicine}
            onChange={(e) => setSearchMedicine(e.target.value)}
            placeholder="Search pharmacies by medicine name (e.g., Dolo, Augmentin, Telma)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Two Column: List & Map Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pharmacy Cards List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredPharmacies.map((pharm) => (
            <div
              key={pharm.id}
              onClick={() => setSelectedPharmacy(pharm)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedPharmacy.id === pharm.id
                  ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {pharm.name}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                      {pharm.distance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {pharm.address}
                  </p>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    pharm.stockStatus === 'In Stock'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pharm.stockStatus}
                </span>
              </div>

              {/* Verified Stock Pills */}
              <div className="mb-4">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Reported In-Stock Medicines:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pharm.availableMedicines.map((med, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-medium"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {pharm.timing}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {pharm.phone}
                  </span>
                </div>

                <ListenButton
                  text={`${pharm.name}, located at ${pharm.address}, ${pharm.distance} away. Operating hours: ${pharm.timing}. Contact phone: ${pharm.phone}. Reported stock status: ${pharm.stockStatus}. Available medicines include: ${pharm.availableMedicines.join(', ')}.`}
                  lang={lang}
                  label="Listen Info"
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Interactive Map Simulation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            Live Pharmacy GPS Map
          </h4>

          {/* Map canvas mock */}
          <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 border relative overflow-hidden flex items-center justify-center text-center p-4">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {selectedPharmacy.name}
              </p>
              <p className="text-[11px] text-slate-500">{selectedPharmacy.address}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedPharmacy.name + ' ' + selectedPharmacy.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold underline"
              >
                Open in Google Maps ?
              </a>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 text-xs space-y-1">
            <p className="font-semibold text-blue-900 dark:text-blue-300">
              Directions Assistance:
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Head north-east on Ring Road for 500m. The pharmacy is on the ground floor next to Metro Gate 2.
            </p>
            <ListenButton
              text={`Directions to ${selectedPharmacy.name}: Head north-east towards Ring Road for 500 meters. The pharmacy is on the right side next to Metro Gate 2.`}
              lang={lang}
              label="Listen Directions"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
