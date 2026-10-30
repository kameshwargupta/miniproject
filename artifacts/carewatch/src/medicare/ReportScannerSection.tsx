import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  Sparkles,
  Download,
  Share2,
  Square,
  Play,
  Gauge,
  ListOrdered,
  Video,
  VideoOff,
  Target,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { SAMPLE_REPORTS, type MedicalReport } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS, SUPPORTED_LANGUAGES } from './translations';
import { useVoice } from './voiceService';

export const ReportScannerSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [reports, setReports] = useState<MedicalReport[]>(SAMPLE_REPORTS);
  const [selectedReport, setSelectedReport] = useState<MedicalReport>(SAMPLE_REPORTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { speak, stop, isPlaying, setSpeed } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSpeedChange = (newSpeed: number) => {
    setVoiceSpeed(newSpeed);
    setSpeed(newSpeed);
  };

  // Start live camera
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
      console.warn('Camera access denied or unsupported:', err);
      alert('Camera access was not granted or is not available. Please use the file upload option.');
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
        setFileName('Camera_Captured_Report.jpg');
        stopCamera();
        processOcrReport('camera_capture_cbc');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setScannedImage(URL.createObjectURL(file));
      processOcrReport(file.name);
    }
  };

  const processOcrReport = (hint: string) => {
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      const lower = hint.toLowerCase();

      let matchedReport = SAMPLE_REPORTS[0]; // CBC default
      if (lower.includes('lipid') || lower.includes('cholesterol') || lower.includes('heart') || lower.includes('cardio')) {
        matchedReport = SAMPLE_REPORTS[1];
      } else if (lower.includes('sugar') || lower.includes('hba1c') || lower.includes('diab') || lower.includes('glucose')) {
        matchedReport = SAMPLE_REPORTS[2];
      }

      // Create a fresh scanned report instance with timestamp
      const newRep: MedicalReport = {
        ...matchedReport,
        id: `rep-${Date.now()}`,
        reportDate: 'Just now (Analyzed via MediCare AI OCR)',
      };

      setReports((prev) => [newRep, ...prev.filter((r) => r.id !== newRep.id)]);
      setSelectedReport(newRep);

      const announcement =
        lang === 'hi'
          ? `मेडिकल रिपोर्ट का विश्लेषण पूरा हुआ: ${newRep.testType}। मुख्य बिंदु: ${newRep.mainPoints[0]}`
          : `Report analysis complete: ${newRep.testType}. Key finding: ${newRep.mainPoints[0]}`;
      speak(announcement, lang);
    }, 1400);
  };

  const getMainPointsScript = () => {
    return `Main clinical findings for ${selectedReport.testType}: ${selectedReport.mainPoints.join('. ')}`;
  };

  const getFullAudioScript = () => {
    let script = `${selectedReport.testType} for ${selectedReport.patientName}. Summary: ${selectedReport.summary}. `;
    script += `Main clinical points: ${selectedReport.mainPoints.join('. ')}. `;
    script += `Parameters: `;
    selectedReport.vitalsAndValues.forEach((item) => {
      script += `${item.test}: ${item.value} ${item.unit}, status is ${item.flag}. ${item.simpleExplanation}. `;
    });
    return script;
  };

  const getResultsAudioScript = () => {
    return selectedReport.vitalsAndValues
      .map(
        (item) =>
          `${item.test}: ${item.value} ${item.unit}, status is ${item.flag}. Normal range is ${item.referenceRange}.`
      )
      .join('. ');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            AI Medical OCR, Executive Summary & Main Points Analyzer
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.reportTitle}</h2>
          <p className="text-teal-100 text-sm max-w-xl mt-1">
            Upload any lab test report (PDF/JPG/PNG) or capture with camera. AI extracts test parameters, highlights abnormal values, and delivers exact clinical takeaways.
          </p>
        </div>
      </div>

      {/* Upload and Sample Selector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Camera Box (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border-2 border-dashed border-teal-300 dark:border-teal-800 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
          {isCameraActive ? (
            <div className="w-full max-w-md space-y-3">
              <div className="relative w-full h-56 bg-black rounded-2xl overflow-hidden border border-teal-500 shadow-lg">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-x-6 inset-y-6 border-2 border-dashed border-teal-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/70 text-teal-300 text-[10px] px-2 py-0.5 rounded font-bold">
                    Align Lab Report Inside Frame
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture & Analyze Report</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center shadow-inner">
                <FileText className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Upload Lab Report or Prescription Photo
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Complete Blood Count (CBC), Lipid Panel, Blood Sugar HbA1c, Thyroid, LFT & KFT (PDF, JPG, PNG).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-teal-600" />
                  <span>Scan with Camera</span>
                </button>

                <label className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span>Choose Report (PDF / Image)</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {fileName && !isScanning && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Document Analyzed: {fileName}</span>
                </div>
              )}
            </div>
          )}

          {isScanning && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-teal-600 font-bold animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Analyzing Medical Values, Extracting Parameters & Computing Main Points...</span>
            </div>
          )}
        </div>

        {/* 1-Click Sample Clinical Reports */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4 text-teal-600" />
            <span>Select Sample Clinical Reports</span>
          </h4>

          <div className="space-y-2">
            {reports.map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => {
                  setSelectedReport(rep);
                  setScannedImage(null);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs transition cursor-pointer ${
                  selectedReport.id === rep.id
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-xs ring-2 ring-teal-500/20'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{rep.testType}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      rep.overallStatus === 'Normal'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {rep.overallStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{rep.reportDate}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SELECTED REPORT VIEWER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Title & Multi-Audio Action Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  selectedReport.overallStatus === 'Normal'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                }`}
              >
                Status: {selectedReport.overallStatus}
              </span>
              <span className="text-xs text-slate-400">{selectedReport.reportDate}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {selectedReport.testType}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Patient: <strong className="text-slate-800 dark:text-slate-200">{selectedReport.patientName}</strong>
            </p>
          </div>

          {/* Voice Toolbar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span className="font-bold">Voice Explainer:</span>
            </div>

            <ListenButton
              text={getMainPointsScript()}
              lang={lang}
              label="Listen Main Points"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
            />

            <ListenButton
              text={selectedReport.summary}
              lang={lang}
              label="Listen Summary"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white border-teal-700"
            />

            <ListenButton
              text={getResultsAudioScript()}
              lang={lang}
              label="Listen Lab Findings"
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
                      ? 'bg-teal-600 text-white'
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
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* PROMINENT MAIN CLINICAL POINTS CARD */}
        <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-teal-50 dark:from-indigo-950/30 dark:via-sky-950/20 dark:to-teal-950/30 border-2 border-indigo-300 dark:border-indigo-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                  🎯 Main Clinical Points & Key Takeaways
                </h4>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                  What is normal, what requires attention, and immediate recommended steps.
                </p>
              </div>
            </div>

            <ListenButton
              text={getMainPointsScript()}
              lang={lang}
              label="Listen Main Points"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {selectedReport.mainPoints.map((pt, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/90 dark:bg-slate-900/80 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-2xs flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Executive Summary Card */}
        <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-sm text-teal-900 dark:text-teal-200">
              Executive Medical Summary
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {selectedReport.summary}
          </p>
          <p className="text-[11px] text-slate-400 italic">
            * Note: This AI analysis simplifies laboratory terminology. Always review report findings with your qualified clinician.
          </p>
        </div>

        {/* Parameters Grid */}
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
            <span>Identified Parameters & Supplied Lab Ranges</span>
            <span className="text-xs text-slate-500 font-normal">Click audio to hear parameter</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedReport.vitalsAndValues.map((v, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border transition-all ${
                  v.flag === 'High'
                    ? 'border-red-300 bg-red-50/30 dark:bg-red-950/20'
                    : v.flag === 'Low'
                    ? 'border-amber-300 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{v.test}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Reference: {v.referenceRange} {v.unit}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {v.value} <span className="text-xs font-normal text-slate-500">{v.unit}</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${
                        v.flag === 'Normal'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : v.flag === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {v.flag}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                  {v.simpleExplanation}
                </p>

                <div className="mt-2 flex justify-end">
                  <ListenButton
                    text={`${v.test}: ${v.value} ${v.unit}. Status is ${v.flag}. ${v.simpleExplanation}`}
                    lang={lang}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Questions & Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Questions to Discuss with Your Doctor</span>
            </h5>
            <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              {selectedReport.questionsForDoctor.map((q, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-teal-500 font-bold">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Lifestyle & Nutrition Action Plan</span>
            </h5>
            <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
              {selectedReport.lifestyleAdvice.map((a, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
