import React, { useState } from 'react';
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
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  const { speak, stop, isPlaying, setSpeed } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSpeedChange = (newSpeed: number) => {
    setVoiceSpeed(newSpeed);
    setSpeed(newSpeed);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setIsScanning(true);

      setTimeout(() => {
        setIsScanning(false);
        const newRep: MedicalReport = {
          id: `rep-${Date.now()}`,
          patientName: 'Kameshwar Gupta',
          reportDate: 'Just now (Analyzed via MediCare OCR)',
          testType: 'Complete Metabolic & Lipid Profile',
          summary:
            'Blood tests indicate healthy kidney parameters. Triglycerides are slightly elevated. Maintain physical activity and lower sugar and fried food intake.',
          overallStatus: 'Needs Attention',
          vitalsAndValues: [
            {
              test: 'Serum Triglycerides',
              value: '185',
              unit: 'mg/dL',
              referenceRange: '< 150',
              flag: 'High',
              simpleExplanation: 'Triglycerides are blood fats stored after excess calories. Slightly elevated.',
            },
            {
              test: 'HDL Good Cholesterol',
              value: '44',
              unit: 'mg/dL',
              referenceRange: '> 40',
              flag: 'Normal',
              simpleExplanation: 'Good cholesterol protects blood vessels. Yours is in the safe range.',
            },
            {
              test: 'Serum Creatinine',
              value: '0.9',
              unit: 'mg/dL',
              referenceRange: '0.7 - 1.2',
              flag: 'Normal',
              simpleExplanation: 'Tests kidney filtering function. Perfectly normal.',
            },
            {
              test: 'HbA1c (3-Month Sugar)',
              value: '5.6',
              unit: '%',
              referenceRange: '< 5.7',
              flag: 'Normal',
              simpleExplanation: 'Average 90-day blood sugar level. Healthy non-diabetic range.',
            },
          ],
          questionsForDoctor: [
            'Do I need any lipid-lowering medication for triglycerides?',
            'What natural diet plan will help lower my lipid levels?',
          ],
          lifestyleAdvice: [
            'Reduce deep fried and refined oil foods.',
            'Include 30 minutes of aerobic walking daily.',
            'Stay well hydrated with clean water.',
          ],
        };

        setReports([newRep, ...reports]);
        setSelectedReport(newRep);

        const announcement =
          lang === 'hi'
            ? 'मेडिकल रिपोर्ट का विश्लेषण पूरा हो गया है। सारांश और जांच परिणाम सुनने के लिए तैयार हैं।'
            : 'Medical report OCR extraction complete. Summary and flagged values are ready to view and listen.';
        speak(announcement, lang);
      }, 1500);
    }
  };

  const getFullAudioScript = () => {
    let script = `${selectedReport.testType} for ${selectedReport.patientName}. Summary: ${selectedReport.summary}. `;
    script += `Here are the extracted parameters: `;
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
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            AI OCR & Voice Explainer
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.reportTitle}</h2>
          <p className="text-teal-100 text-sm max-w-xl mt-1">{t.reportSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <ListenButton
            text={
              lang === 'hi'
                ? 'AI मेडिकल रिपोर्ट स्कैनर में आपका स्वागत है। अपनी लैब रिपोर्ट अपलोड करें और सरल भाषा में आवाज के साथ विश्लेषण सुनें।'
                : 'Welcome to AI Medical Report Scanner. Upload lab reports to understand test values with voice explanation.'
            }
            lang={lang}
            label={t.listenComplete}
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          />
        </div>
      </div>

      {/* Upload Box & Sample Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border-2 border-dashed border-teal-500/40 rounded-2xl p-6 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mb-3">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">
            {t.uploadReport}
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">{t.dropFiles}</p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-xs shadow-md cursor-pointer transition-all">
            <Camera className="w-4 h-4" />
            <span>Upload or Capture Report (PDF / JPG / PNG)</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleSimulateUpload}
              className="hidden"
            />
          </label>

          {isScanning && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-teal-600 font-medium animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>{t.analyzingReport}</span>
            </div>
          )}

          {fileName && !isScanning && (
            <p className="text-xs text-emerald-600 font-medium mt-3">
              Analyzed: {fileName}
            </p>
          )}
        </div>

        {/* Sample Reports List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-teal-600" />
            <span>{t.sampleReports}</span>
          </h4>
          <div className="space-y-2">
            {SAMPLE_REPORTS.map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => setSelectedReport(rep)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                  selectedReport.id === rep.id
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{rep.testType}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      rep.overallStatus === 'Normal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
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

      {/* Selected Report Viewer with Audio Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Report Title & Voice Action Bar */}
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
                {selectedReport.overallStatus}
              </span>
              <span className="text-xs text-slate-400">{selectedReport.reportDate}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {selectedReport.testType}
            </h3>
            <p className="text-xs text-slate-500">Patient: {selectedReport.patientName}</p>
          </div>

          {/* Dedicated Voice Assistance Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span className="font-semibold">Voice Assistance:</span>
            </div>

            <ListenButton
              text={getFullAudioScript()}
              lang={lang}
              label={t.listenComplete}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white border-teal-700"
            />

            <ListenButton
              text={selectedReport.summary}
              lang={lang}
              label={t.listenSummary}
              size="sm"
            />

            <ListenButton
              text={getResultsAudioScript()}
              lang={lang}
              label={t.listenResults}
              size="sm"
            />

            <ListenButton
              text={selectedReport.questionsForDoctor.join('. ')}
              lang={lang}
              label={t.listenQuestions}
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
                <span>{t.stopAudio}</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Clinical Summary */}
        <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-sm text-teal-900 dark:text-teal-200">
              {t.reportSummary}
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedReport.summary}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 italic">{t.disclaimer}</p>
        </div>

        {/* Extracted Parameters Table & Cards */}
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
            <span>{t.keyFindings}</span>
            <span className="text-xs text-slate-500 font-normal">Click speaker to hear each parameter</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedReport.vitalsAndValues.map((v, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-all ${
                  v.flag === 'High'
                    ? 'border-red-300 bg-red-50/20 dark:bg-red-950/10'
                    : v.flag === 'Low'
                    ? 'border-amber-300 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{v.test}</h5>
                    <p className="text-[11px] text-slate-500">Ref Range: {v.referenceRange} {v.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        v.flag === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : v.flag === 'Low'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {v.value} {v.unit} ({v.flag})
                    </span>
                    <ListenButton
                      text={`${v.test}: Value is ${v.value} ${v.unit}. Normal reference is ${v.referenceRange}. Status is ${v.flag}. ${v.simpleExplanation}`}
                      lang={lang}
                      label=""
                      size="sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {v.simpleExplanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions for Doctor & Lifestyle Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>{t.doctorQuestions}</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              {selectedReport.questionsForDoctor.map((q, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>General Lifestyle Guidance</span>
            </h4>
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
      </div>
    </div>
  );
};
