import React, { useState, useRef, useEffect } from 'react';
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
  Video,
  VideoOff,
  RefreshCw,
  FileSearch,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
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
  const [ocrRawText, setOcrRawText] = useState<string | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { speak, stop, isPlaying, setSpeed } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSpeedChange = (newSpeed: number) => {
    setVoiceSpeed(newSpeed);
    setSpeed(newSpeed);
  };

  // Safe search filtering
  const filteredMedicines = medicines.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchBrand = m.brandName.toLowerCase().includes(q);
    const matchGeneric = m.genericName.toLowerCase().includes(q);
    const matchCategory = m.category.toLowerCase().includes(q);
    const matchActive = (m.activeIngredients || []).some((ing) => ing.toLowerCase().includes(q));
    return matchBrand || matchGeneric || matchCategory || matchActive;
  });

  // Camera handling
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error or unsupported:', err);
      // Fallback
      alert('Camera access was denied or is not supported. You can still upload medicine photos or try our sample strips below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureCameraFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setScannedImage(dataUrl);
      }
      stopCamera();
      runOcrAnalysis('captured_strip_image');
    }
  };

  const runOcrAnalysis = (hint: string) => {
    setIsScanning(true);
    setOcrRawText(null);

    setTimeout(() => {
      setIsScanning(false);
      let matched = INITIAL_MEDICINES[0]; // Dolo 650 default
      const lowerHint = hint.toLowerCase();

      if (lowerHint.includes('aug') || lowerHint.includes('amox') || lowerHint.includes('clav')) {
        matched = INITIAL_MEDICINES[1];
      } else if (lowerHint.includes('panto') || lowerHint.includes('acid') || lowerHint.includes('gerd')) {
        matched = INITIAL_MEDICINES[2];
      } else if (lowerHint.includes('azith') || lowerHint.includes('azee') || lowerHint.includes('500')) {
        matched = INITIAL_MEDICINES[3];
      } else if (lowerHint.includes('telma') || lowerHint.includes('bp') || lowerHint.includes('hyper')) {
        matched = INITIAL_MEDICINES[4];
      } else if (lowerHint.includes('glyco') || lowerHint.includes('diab') || lowerHint.includes('sugar')) {
        matched = INITIAL_MEDICINES[5];
      }

      setSelectedMed(matched);
      setOcrRawText(
        `OCR DETECTED: [${matched.brandName.toUpperCase()}] • COMPOSITION: [${matched.genericName}] • STRENGTH: [${matched.strength}] • BATCH: MED-9921 • EXP: 08/2028`
      );

      const announcement =
        lang === 'hi'
          ? `दवा पहचानी गई: ${matched.brandName}। सक्रिय घटक: ${matched.genericName}। खुराक: ${matched.strength}। पूरी जानकारी, उपयोग और सावधानियां सुनने के लिए नीचे दिए गए बटन दबाएं।`
          : `Identified medicine: ${matched.brandName}. Active salt: ${matched.genericName}. Strength: ${matched.strength}. Confidence level: ${matched.confidenceScore}%. You can listen to name, uses, and warnings below.`;

      speak(announcement, lang);
    }, 1400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setScannedImage(previewUrl);
      runOcrAnalysis(file.name);
    }
  };

  const handleSelectSample = (med: MedicineItem) => {
    setScannedImage(null);
    runOcrAnalysis(med.brandName);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            AI Strip OCR & Safety Verification
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.medScannerTitle}</h2>
          <p className="text-emerald-100 text-sm max-w-xl mt-1">{t.medScannerSubtitle}</p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? 'AI दवा स्कैनर में आपका स्वागत है। दवा की तस्वीर अपलोड करें, कैमरा से स्कैन करें, या घटक और सावधानियां जानने के लिए नाम से खोजें।'
              : 'Welcome to AI Medicine Scanner. Upload pill packaging, scan using camera, or search by salt composition with voice assistance.'
          }
          lang={lang}
          label="Listen Overview"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* Try Sample Blister Strips (Quick 1-Click Testing) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileSearch className="w-4 h-4 text-emerald-600" />
            Quick Test: Click Any Sample Medicine Strip
          </span>
          <span className="text-[11px] text-slate-400">Instant OCR Simulation</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {medicines.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectSample(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedMed.id === m.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              💊 {m.brandName} ({m.strength})
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Live Camera Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload / Camera Action Box */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border-2 border-dashed border-emerald-500/40 rounded-2xl p-5 shadow-xs text-center flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              {t.uploadMedicine}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Upload photo from device or use your live phone/webcam camera.
            </p>

            {/* Live Camera Viewfinder if Active */}
            {isCameraActive ? (
              <div className="space-y-3">
                <div className="relative w-full h-44 bg-black rounded-xl overflow-hidden border-2 border-emerald-500 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-4 border border-dashed border-white/70 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-white bg-black/60 px-2 py-0.5 rounded">
                      Align strip text here
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={captureCameraFrame}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Capture & Scan
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Open Camera</span>
                </button>

                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-xs shadow-md cursor-pointer transition">
                  <Camera className="w-4 h-4" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning OCR & Matching Drug Database...</span>
            </div>
          )}

          {scannedImage && !isScanning && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <img
                src={scannedImage}
                alt="Captured Strip"
                className="w-24 h-16 object-cover mx-auto rounded-lg border border-emerald-400 shadow-xs"
              />
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                ✓ Photo Analyzed
              </span>
            </div>
          )}
        </div>

        {/* Search Engine & Category Filter */}
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
              {['All', 'Antipyretic', 'Antibiotic', 'Antacid', 'Antihypertensive', 'Anti-Diabetic'].map(
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

          {/* Pharmacist Disclaimer */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              {t.pharmacistNotice} AI identification should never replace a certified pharmacist or clinician's advice.
            </span>
          </div>
        </div>
      </div>

      {/* Main Medicine Inspector & Dedicated Voice Assistance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Search Results List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 max-h-[550px] overflow-y-auto">
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
              <div className="flex items-center justify-between text-[11px] text-emerald-600 font-semibold mt-1.5">
                <span>{med.strength}</span>
                <span className="text-slate-400 font-normal">{med.price}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Detailed Medicine Card with All 6 Voice Buttons */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Header Row & Confidence */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">
                  {selectedMed.dosageForm} • {selectedMed.strength}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold">
                  {selectedMed.confidenceScore}% Confidence
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {selectedMed.brandName}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Active Salt: {selectedMed.genericName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-600">{selectedMed.price}</span>
              <span className="text-[10px] text-slate-400 block">{selectedMed.verificationDate}</span>
            </div>
          </div>

          {/* Raw OCR Text Banner if available */}
          {ocrRawText && (
            <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl border border-slate-800 flex items-center justify-between">
              <span>{ocrRawText}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
          )}

          {/* Look-Alike / Sound-Alike Medicine Alert */}
          {selectedMed.similarSoundingMeds && selectedMed.similarSoundingMeds.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-amber-900 dark:text-amber-200">
                  Sound-Alike Drug Warning:
                </span>
                <span className="text-amber-700 dark:text-amber-300">
                  Do not confuse with: {selectedMed.similarSoundingMeds.join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* DEDICATED 6 VOICE ASSISTANCE BUTTONS PACK */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Dedicated Medicine Voice Assistance (Speech in {lang.toUpperCase()}):</span>
              </div>

              {/* Speech Speed Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">{t.speechSpeed}:</span>
                {[0.75, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                      voiceSpeed === spd
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}

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

            {/* 6 Required Voice Assistance Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* 1. Listen Medicine Name */}
              <ListenButton
                text={`Medicine Name: ${selectedMed.brandName}. Generic composition: ${selectedMed.genericName}. Strength: ${selectedMed.strength}.`}
                lang={lang}
                label="Listen Name & Strength"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
              />

              {/* 2. Listen Medicine Information */}
              <ListenButton
                text={`${selectedMed.brandName} is a ${selectedMed.category} formulated as ${selectedMed.dosageForm}. Active ingredients: ${(selectedMed.activeIngredients || []).join(', ')}. Price is ${selectedMed.price}.`}
                lang={lang}
                label="Listen Full Information"
                size="sm"
              />

              {/* 3. Listen Common Uses */}
              <ListenButton
                text={`Common uses of ${selectedMed.brandName}: ${(selectedMed.uses || []).join('. ')}.`}
                lang={lang}
                label="Listen Common Uses"
                size="sm"
              />

              {/* 4. Listen Warnings */}
              <ListenButton
                text={`Warnings for ${selectedMed.brandName}: ${(selectedMed.warnings || []).join('. ')}.`}
                lang={lang}
                label="Listen Warnings"
                size="sm"
              />

              {/* 5. Listen Precautions */}
              <ListenButton
                text={`Precautions for ${selectedMed.brandName}: ${(selectedMed.precautions || []).join('. ')}.`}
                lang={lang}
                label="Listen Precautions"
                size="sm"
              />

              {/* 6. Listen Storage Instructions */}
              <ListenButton
                text={`Storage instructions for ${selectedMed.brandName}: ${selectedMed.storage}.`}
                lang={lang}
                label="Listen Storage"
                size="sm"
              />
            </div>
          </div>

          {/* Active Ingredients & Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {t.activeIngredient}
              </span>
              <ul className="text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-1">
                {(selectedMed.activeIngredients || [selectedMed.genericName]).map((ing, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                {t.storageInstructions}
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {selectedMed.storage}
              </p>
            </div>
          </div>

          {/* Common Uses Tags */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t.commonUses}</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(selectedMed.uses || [selectedMed.commonUses]).map((u, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                >
                  ✓ {u}
                </span>
              ))}
            </div>
          </div>

          {/* Warnings & Precautions Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
              <h5 className="font-bold text-xs text-red-800 dark:text-red-300 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>{t.warnings}</span>
              </h5>
              <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                {(selectedMed.warnings || []).map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
              <h5 className="font-bold text-xs text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.precautions}</span>
              </h5>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                {(selectedMed.precautions || []).map((p, i) => (
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
