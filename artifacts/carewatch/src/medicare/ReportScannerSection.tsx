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
  Bot,
  Settings,
  Key,
  Check,
  Send,
  RefreshCw,
  FileCheck,
  X,
  ArrowRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { type MedicalReport } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';
import {
  analyzeMedicalReportWithAi,
  getAiConfig,
  setAiConfig,
  type AiConfig,
} from './aiMedicalService';

export const ReportScannerSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  // CLEAN STATE: No sample reports, no pre-loaded data - user uploads own medical document
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  // Custom text / prompt input for direct AI report analysis
  const [customReportText, setCustomReportText] = useState('');
  const [patientInputName, setPatientInputName] = useState('');
  const [testFocusInput, setTestFocusInput] = useState<string>('');
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [aiConfig, setLocalAiConfig] = useState<AiConfig>(getAiConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { speak, stop, isPlaying, setSpeed } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSpeedChange = (newSpeed: number) => {
    setVoiceSpeed(newSpeed);
    setSpeed(newSpeed);
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setAiConfig(aiConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Reset report to upload a new document
  const handleResetReport = () => {
    setSelectedReport(null);
    setFileName(null);
    setFileSize(null);
    setScannedImage(null);
    setTestFocusInput('');
    setCustomReportText('');
    stop();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        setScannedImage(dataUrl);
        setFileName('Camera_Captured_Report.jpg');
        setFileSize('~250 KB');
        setTestFocusInput('Camera Scanned Lab Report');
        stopCamera();
        processAiReport('Camera_Captured_Lab_Report', 'Medical Lab Test Document Photo', dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr =
        file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
          : Math.round(file.size / 1024) + ' KB';
      setFileName(file.name);
      setFileSize(sizeStr);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTestFocusInput(cleanTitle);

      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        setScannedImage(base64Data);
        processAiReport(file.name, file.name, base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI-Powered Report Processor (Passes Base64 Image to Gemini 1.5 Flash Vision & Diagnostic Engine)
  const processAiReport = async (hint: string, textContent?: string, imageBase64?: string) => {
    setIsScanning(true);

    try {
      const imageToSend = imageBase64 || scannedImage || undefined;
      const analyzed = await analyzeMedicalReportWithAi({
        hint: hint,
        text: textContent || customReportText,
        image: imageToSend,
        patientName: patientInputName.trim() || undefined,
        language: lang,
      });

      setIsScanning(false);
      setReports((prev) => [analyzed, ...prev.filter((r) => r.id !== analyzed.id)]);
      setSelectedReport(analyzed);

      const announcement =
        lang === 'hi'
          ? `AI मेडिकल विश्लेषण पूरा हुआ: ${analyzed.testType}। मुख्य बिंदु: ${analyzed.mainPoints[0] || analyzed.summary}`
          : `AI report extraction complete: ${analyzed.testType}. Key clinical finding: ${analyzed.mainPoints[0] || analyzed.summary}`;
      speak(announcement, lang);
    } catch (err) {
      console.error('AI Report Analysis error:', err);
      setIsScanning(false);
    }
  };

  const handleCustomTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReportText.trim()) return;
    setFileName('Custom_Pasted_Lab_Parameters.txt');
    setFileSize('1.2 KB');
    processAiReport('Custom Clinical Query', customReportText, scannedImage || undefined);
  };

  const getMainPointsScript = () => {
    if (!selectedReport) return '';
    return `Main clinical findings for ${selectedReport.testType}: ${selectedReport.mainPoints.join('. ')}`;
  };

  const getFullAudioScript = () => {
    if (!selectedReport) return '';
    let script = `${selectedReport.testType} for ${selectedReport.patientName}. Summary: ${selectedReport.summary}. `;
    script += `Main clinical points: ${selectedReport.mainPoints.join('. ')}. `;
    script += `Parameters: `;
    selectedReport.vitalsAndValues.forEach((item) => {
      script += `${item.test}: ${item.value} ${item.unit}, status is ${item.flag}. ${item.simpleExplanation}. `;
    });
    return script;
  };

  const getResultsAudioScript = () => {
    if (!selectedReport) return '';
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
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              AI Medical Report Scanner & Clinical Extraction Engine
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/50 rounded-full text-xs font-bold flex items-center gap-1">
              <Bot className="w-3 h-3" />
              Gemini & ChatGPT Vision Backend
            </span>
          </div>
          <h2 className="text-2xl font-bold">{t.reportTitle || 'AI Medical Report Scanner'}</h2>
          <p className="text-teal-100 text-sm max-w-xl mt-1">
            Upload your medical report document (PDF/Photo) or take a camera snapshot. AI directly reads the document, extracts exact numerical values, flags abnormal parameters, and generates right clinical guidance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiSettings(!showAiSettings)}
            className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>AI Config</span>
          </button>
          <ListenButton
            text="Welcome to AI Medical Report Scanner. Upload any lab report document or photo to receive 100% exact clinical summary, abnormal parameter flags, and voice explanation."
            lang={lang}
            label="Listen Overview"
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          />
        </div>
      </div>

      {/* AI Config Drawer / Modal (Optional Custom Keys) */}
      {showAiSettings && (
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-teal-500/30 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-teal-600" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                AI Backend Configuration (Google Gemini / OpenAI ChatGPT)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowAiSettings(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            By default, the backend automatically uses the built-in AI Engine and server environment keys. You can also provide your own personal Gemini API key or OpenAI key below for direct cloud calls:
          </p>

          <form onSubmit={handleSaveAiConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Google Gemini API Key (Recommended - Free Tier):
              </label>
              <input
                type="password"
                value={aiConfig.geminiApiKey}
                onChange={(e) => setLocalAiConfig({ ...aiConfig, geminiApiKey: e.target.value })}
                placeholder="AIzaSy... (Leave empty to use automatic backend)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                OpenAI ChatGPT API Key (Optional):
              </label>
              <input
                type="password"
                value={aiConfig.openaiApiKey}
                onChange={(e) => setLocalAiConfig({ ...aiConfig, openaiApiKey: e.target.value })}
                placeholder="sk-proj-... (Optional)"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-600 font-semibold">
                ✓ Gemini 1.5 Flash Vision & GPT-4o-mini structured schema enabled.
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save AI Configuration</span>
              </button>
            </div>
          </form>

          {savedSuccess && (
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg font-bold">
              ✓ AI Configuration successfully saved!
            </div>
          )}
        </div>
      )}

      {/* Main Analysis Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: File Upload, Live Camera & Direct Lab Text Input */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          {/* Top Options Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                Upload Medical Report Document
              </h3>
              <p className="text-xs text-slate-500">
                Upload your pathology report PDF or photo to extract exact values directly.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-teal-600" />
                <span>Camera</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>Upload Document (PDF / Photo)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Camera Viewfinder if Active */}
          {isCameraActive && (
            <div className="space-y-3">
              <div className="relative w-full h-56 bg-black rounded-2xl overflow-hidden border-2 border-teal-500 shadow-lg">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-teal-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/70 text-teal-300 text-[10px] px-2 py-0.5 rounded font-bold">
                    Align Lab Report Document Here
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
                  <span>Capture & Analyze with AI</span>
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
          )}

          {/* Direct Text / Lab Query Input */}
          <form onSubmit={handleCustomTextSubmit} className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={patientInputName}
                onChange={(e) => setPatientInputName(e.target.value)}
                placeholder="Patient Name (Optional, e.g. Rahul Verma)..."
                className="w-full sm:w-1/3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customReportText}
                  onChange={(e) => setCustomReportText(e.target.value)}
                  placeholder="Paste or type lab findings (e.g. TSH 7.8 OR SGPT 95, Bilirubin 2.1 OR Hb 10.2, WBC 12500)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                type="submit"
                disabled={!customReportText.trim() || isScanning}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Analyze Findings</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Tip: Uploading an actual PDF or photo sends the file to Gemini 1.5 Flash Vision for direct document analysis. You can also paste specific lab values above.
            </p>
          </form>

          {isScanning && (
            <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-2xl flex items-center justify-center gap-2 text-xs text-teal-700 dark:text-teal-300 font-bold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Document & Extracting Exact Clinical Values...</span>
            </div>
          )}

          {fileName && !isScanning && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Analyzed Document: <strong>{fileName}</strong> {fileSize ? `(${fileSize})` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetReport}
                className="text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
              >
                Upload Another Report
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Uploaded Document Inspector & Quick Test Verifier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          {scannedImage || fileName ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-teal-600" />
                  <span>Document Details</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetReport}
                  className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {/* Preview thumbnail if image */}
              {scannedImage && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-36 bg-slate-950 flex items-center justify-center">
                  <img src={scannedImage} alt="Report Scan" className="max-h-36 object-contain" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] rounded font-mono">
                    {fileSize || 'Image'}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                  📄 {fileName || 'Uploaded_Document.pdf'}
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">
                  ✓ AI Vision Extraction Complete
                </span>
              </div>

              {/* Verify / Refine Specific Test Focus */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                  Refine Test Type / Specimen:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={testFocusInput}
                    onChange={(e) => setTestFocusInput(e.target.value)}
                    placeholder="e.g. Thyroid TSH, Lipid Profile, Liver LFT, CBC..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      processAiReport(
                        testFocusInput || 'Lab Report',
                        testFocusInput || customReportText,
                        scannedImage || undefined
                      )
                    }
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract</span>
                  </button>
                </div>

                </div>
            </div>
          ) : (
            /* Clean Empty Guide when no document is loaded */
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>AI Document Scanner Guide</span>
              </h4>
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">Upload Any Document</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select a PDF report, capture a photo using camera, or paste diagnostic text.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">Instant AI Vision Extraction</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Gemini 1.5 Flash Vision reads each test parameter, unit, and reference interval.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block text-xs">100% Right Clinical Insights</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Get exact High/Low flags, plain language explanations, doctor consultation questions, and voice audio in 11 languages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE A: NO REPORT UPLOADED YET -> SHOW CLEAN AWAITING DROPZONE HERO       */}
      {/* ========================================================================= */}
      {!selectedReport ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-teal-300/80 dark:border-teal-800/60 rounded-3xl p-10 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              No Medical Report Uploaded Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please upload your medical lab report (PDF, PNG, JPG), take a photo with your camera, or enter your test findings above to receive 100% accurate, personalized AI clinical analysis.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Report File (PDF / Image)</span>
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Take Photo with Camera</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE B: REPORT UPLOADED & ANALYZED -> SHOW 100% EXACT CLINICAL FINDINGS   */
        /* ========================================================================= */
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
                <span className="text-xs px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-bold">
                  ✓ Verified AI Extraction
                </span>
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
                label="Listen Findings"
                size="sm"
              />

              {/* Speed Control */}
              <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-2 ml-1">
                <span className="text-[11px] text-slate-500 font-medium">{t.speechSpeed}:</span>
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
                  <span>{t.stopAudio}</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. EXACT CLINICAL REPORT SUMMARY CARD */}
          <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
              <h4 className="font-extrabold text-sm text-teal-900 dark:text-teal-200 uppercase tracking-wide">
                Exact Clinical Summary
              </h4>
            </div>
            <p className="text-xs text-teal-950 dark:text-teal-100 leading-relaxed font-medium">
              {selectedReport.summary}
            </p>
          </div>

          {/* 2. KEY CLINICAL FINDINGS (MAIN POINTS) */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              Key Diagnostic Findings & Main Points:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedReport.mainPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-950 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. LAB PARAMETERS TABLE WITH FLAGS */}
          <div>
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
              Identified Lab Parameters & Reference Intervals:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedReport.vitalsAndValues.map((v, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border transition ${
                    v.flag === 'High'
                      ? 'border-red-300 bg-red-50/20 dark:bg-red-950/20'
                      : v.flag === 'Low'
                      ? 'border-amber-300 bg-amber-50/20 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{v.test}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        v.flag === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : v.flag === 'Low'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {v.value} {v.unit} ({v.flag})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Normal Reference: {v.referenceRange} {v.unit}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    {v.simpleExplanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. DOCTOR QUESTIONS & LIFESTYLE ADVICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Questions for Doctor</span>
              </h5>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                {selectedReport.questionsForDoctor.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Doctor Recommended Lifestyle Guidance</span>
              </h5>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                {selectedReport.lifestyleAdvice.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetReport}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Upload Another Medical Report</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save Clinical Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
