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
} from 'lucide-react';
import { INITIAL_MEDICINES, type MedicineItem } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const MedicineScannerSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [medicines, setMedicines] = useState<MedicineItem[]>(INITIAL_MEDICINES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<MedicineItem>(INITIAL_MEDICINES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [savedMedIds, setSavedMedIds] = useState<string[]>(['med-1']);

  const { speak } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const filteredMedicines = medicines.filter(
    (m) =>
      m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimulateScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setScannedImage(previewUrl);

      setTimeout(() => {
        setIsScanning(false);
        // Matched simulated medicine
        const matched = INITIAL_MEDICINES[1]; // Augmentin
        setSelectedMed(matched);

        const announcement =
          lang === 'hi'
            ? `??? ?????? ??: ${matched.brandName}? ????? ???: ${matched.genericName}? ??????: ${matched.strength}? ??????? ?????????? ?? ??? ?????? ??? ??????`
            : `Identified medicine: ${matched.brandName}. Generic composition: ${matched.genericName}. Strength: ${matched.strength}. Click listen to hear warnings and precautions.`;

        speak(announcement, lang);
      }, 1500);
    }
  };

  const toggleSave = (id: string) => {
    setSavedMedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            AI Strip OCR & Safety Verification
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.navMedicineScanner} & Search</h2>
          <p className="text-emerald-100 text-sm max-w-xl mt-1">
            Capture pill blister packs or search 1,000+ medicines. Verify salt names, common uses, warnings, precautions, and listen in your language.
          </p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? '??? ??? ?????? ??? ???? ?????? ??? ???? ?? ???? ?? ??? ?? ???? ?? ???? ???? ???? ????? ?? ?????????? ?? ??????? ??????? ?? ???? ????'
              : 'Welcome to AI Medicine Scanner. Capture medicine packaging to identify salt, uses, warnings, and listen in your language.'
          }
          lang={lang}
          label="Listen Overview"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* Two Column Grid: Search & Scanner vs Medicine Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Upload */}
        <div className="space-y-4">
          {/* Camera Scanner Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Snap Medicine Strip
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Hold medicine box or tablet strip near camera.
            </p>

            <label className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors">
              <Camera className="w-4 h-4" />
              <span>Capture / Upload Image</span>
              <input type="file" accept="image/*" onChange={handleSimulateScan} className="hidden" />
            </label>

            {isScanning && (
              <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center justify-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Reading strip text with OCR...</span>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Dolo, Paracetamol, Antibiotics..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredMedicines.map((med) => (
                <div
                  key={med.id}
                  onClick={() => setSelectedMed(med)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedMed.id === med.id
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100">{med.brandName}</h5>
                      <p className="text-[11px] text-slate-500">{med.genericName} • {med.strength}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                      {med.dosageForm}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Full Medicine Detailed Information Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Title & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {selectedMed.category}
                </span>
                <span className="text-xs text-slate-500">Verified Database Match</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {selectedMed.brandName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Active Salt: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedMed.genericName} ({selectedMed.strength})</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ListenButton
                text={`${selectedMed.brandName}, salt composition is ${selectedMed.genericName} ${selectedMed.strength}. Common uses: ${selectedMed.commonUses}. Warnings: ${selectedMed.warnings}. Precautions: ${selectedMed.precautions}. Storage: ${selectedMed.storage}.`}
                lang={lang}
                label="?? Listen All"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
              />
              <button
                type="button"
                onClick={() => toggleSave(selectedMed.id)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  savedMedIds.includes(selectedMed.id)
                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="Save to Favourites"
              >
                <Bookmark className="w-4 h-4" />
                <span>{savedMedIds.includes(selectedMed.id) ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Audio Breakdown Buttons (Requirement) */}
          <div className="flex flex-wrap gap-2 text-xs">
            <ListenButton
              text={`Common uses of ${selectedMed.brandName}: ${selectedMed.commonUses}`}
              lang={lang}
              label="Listen Uses"
              size="sm"
            />
            <ListenButton
              text={`Important warnings for ${selectedMed.brandName}: ${selectedMed.warnings}`}
              lang={lang}
              label="Listen Warnings"
              size="sm"
            />
            <ListenButton
              text={`Precautions: ${selectedMed.precautions}`}
              lang={lang}
              label="Listen Precautions"
              size="sm"
            />
            <ListenButton
              text={`Storage instructions: ${selectedMed.storage}`}
              lang={lang}
              label="Listen Storage"
              size="sm"
            />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Common Uses */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-slate-200">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Common Uses & Indications</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedMed.commonUses}
              </p>
            </div>

            {/* Warnings */}
            <div className="p-4 bg-red-50/40 dark:bg-red-950/20 rounded-xl border border-red-200/60 dark:border-red-900/40">
              <div className="flex items-center gap-2 mb-2 font-bold text-red-800 dark:text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Warnings & Contraindications</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedMed.warnings}
              </p>
            </div>

            {/* Precautions */}
            <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center gap-2 mb-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Precautions & Safety Guidelines</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedMed.precautions}
              </p>
            </div>

            {/* Storage & Pricing */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-slate-200">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Storage & Market Price</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-1">
                <strong>Storage:</strong> {selectedMed.storage}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Typical Retail Price:</strong> {selectedMed.price}
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 dark:text-amber-300">
            ?? <strong>Healthcare Notice:</strong> Never alter prescribed dosage without clinical consultation. Verify uncertain medicine identification with a licensed pharmacist.
          </div>
        </div>
      </div>
    </div>
  );
};
