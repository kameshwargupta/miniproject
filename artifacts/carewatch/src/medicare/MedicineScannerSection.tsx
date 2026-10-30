import React, { useState } from 'react';
import {
  Pill,
  Search,
  Camera,
  AlertTriangle,
  ShieldAlert,
  Info,
  Check,
  Volume2,
  Bookmark,
  Sparkles,
  Square,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { INITIAL_MEDICINES, type MedicineItem } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const MedicineScannerSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [medicines] = useState<MedicineItem[]>(INITIAL_MEDICINES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<MedicineItem>(INITIAL_MEDICINES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [savedMedIds, setSavedMedIds] = useState<string[]>(['med-1']);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  const { speak, stop, isPlaying, setSpeed } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSpeedChange = (newSpeed: number) => {
    setVoiceSpeed(newSpeed);
    setSpeed(newSpeed);
  };

  const filteredMedicines = medicines.filter(
    (m) =>
      m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.activeIngredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSimulateScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setScannedImage(previewUrl);

      setTimeout(() => {
        setIsScanning(false);
        const matched = INITIAL_MEDICINES[1]; // Augmentin 625 Duo
        setSelectedMed(matched);

        const announcement =
          lang === 'hi'
            ? `पहचानी गई दवा: ${matched.brandName}। सक्रिय घटक: ${matched.genericName}। क्षमता: ${matched.strength}। उपयोग और सावधानियां सुनने के लिए बटन दबाएं।`
            : `Identified medicine: ${matched.brandName}. Active composition: ${matched.genericName}. Strength: ${matched.strength}. Click listen to hear warnings and precautions.`;

        speak(announcement, lang);
      }, 1500);
    }
  };

  const toggleSave = (id: string) => {
    setSavedMedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getFullMedicineAudio = () => {
    return `${selectedMed.brandName}. Generic name: ${selectedMed.genericName}. Strength: ${selectedMed.strength}. Common uses include: ${selectedMed.uses.join(', ')}. Warnings: ${selectedMed.warnings.join(', ')}. Storage: ${selectedMed.storage}.`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            AI Strip OCR & Safety Verification
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.medScannerTitle}</h2>
          <p className="text-emerald-100 text-sm max-w-xl mt-1">{t.medScannerSubtitle}</p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? 'AI दवा स्कैनर में आपका स्वागत है। दवा की तस्वीर अपलोड करें या घटक और सावधानियां जानने के लिए खोजें।'
              : 'Welcome to AI Medicine Scanner. Upload pill packaging or search salt compositions with multilingual voice.'
          }
          lang={lang}
          label={t.listenMedName}
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* Search & Upload Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Blister/Packaging */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
            {t.uploadMedicine}
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Capture pill strip, syrup bottle, or prescription text with camera.
          </p>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-xs shadow-md cursor-pointer transition-all">
            <Camera className="w-4 h-4" />
            <span>Scan Medicine Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleSimulateScan}
              className="hidden"
            />
          </label>

          {isScanning && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Running OCR strip identification...</span>
            </div>
          )}

          {scannedImage && !isScanning && (
            <div className="mt-3">
              <img
                src={scannedImage}
                alt="Scanned Strip"
                className="w-24 h-16 object-cover mx-auto rounded-lg border border-slate-200 shadow-xs"
              />
              <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                ✓ Identified: {selectedMed.brandName}
              </span>
            </div>
          )}
        </div>

        {/* Search Medicine Input & Quick Filter */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchMedicinePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto text-[11px] pb-1">
              {['All', 'Antipyretic', 'Antibiotic', 'Antidiabetic', 'Lipid Lowering', 'Antihistamine'].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSearchQuery(cat === 'All' ? '' : cat)}
                    className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 whitespace-nowrap cursor-pointer transition"
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.pharmacistNotice}</span>
          </div>
        </div>
      </div>

      {/* Main Medicine Inspector & Voice Assistance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Medicine Search Results List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 max-h-[500px] overflow-y-auto">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
            Matching Medicines ({filteredMedicines.length})
          </h4>
          {filteredMedicines.map((med) => (
            <button
              key={med.id}
              type="button"
              onClick={() => setSelectedMed(med)}
              className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                selectedMed.id === med.id
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {med.brandName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {med.dosageForm}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{med.genericName}</p>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 font-medium mt-1.5">
                <span>{med.strength}</span>
                <span className="text-slate-400">{med.category}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Detailed Medicine Card with Voice Controls */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Header Row & Audio Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
                  {selectedMed.dosageForm} • {selectedMed.strength}
                </span>
                <span className="text-xs text-slate-400">{selectedMed.category}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {selectedMed.brandName}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Salt Composition: {selectedMed.genericName}
              </p>
            </div>

            {/* Dedicated Voice Assistance Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Voice Assistance:</span>
              </div>

              <ListenButton
                text={getFullMedicineAudio()}
                lang={lang}
                label={t.listenMedName}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
              />

              <ListenButton
                text={`Common uses of ${selectedMed.brandName}: ${selectedMed.uses.join('. ')}`}
                lang={lang}
                label={t.listenUses}
                size="sm"
              />

              <ListenButton
                text={`Warnings for ${selectedMed.brandName}: ${selectedMed.warnings.join('. ')}`}
                lang={lang}
                label={t.listenWarnings}
                size="sm"
              />

              <ListenButton
                text={`Storage for ${selectedMed.brandName}: ${selectedMed.storage}`}
                lang={lang}
                label={t.listenStorage}
                size="sm"
              />

              {/* Speed Control */}
              <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-2 ml-1">
                <span className="text-[11px] text-slate-500">{t.speechSpeed}:</span>
                {[0.75, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                      voiceSpeed === spd
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {isPlaying && (
                <button
                  type="button"
                  onClick={stop}
                  className="flex items-center gap-1 bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-red-700 transition cursor-pointer ml-1 animate-pulse"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>{t.stopAudio}</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Ingredients & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {t.activeIngredient}
              </span>
              <ul className="text-xs font-medium text-slate-800 dark:text-slate-200 space-y-0.5">
                {selectedMed.activeIngredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {t.storageInstructions}
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedMed.storage}
              </p>
            </div>
          </div>

          {/* Uses */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t.commonUses}</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedMed.uses.map((u, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                >
                  ✓ {u}
                </span>
              ))}
            </div>
          </div>

          {/* Warnings & Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
              <h5 className="font-bold text-xs text-red-800 dark:text-red-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t.warnings}</span>
              </h5>
              <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                {selectedMed.warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
              <h5 className="font-bold text-xs text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.precautions}</span>
              </h5>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                {selectedMed.precautions.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
