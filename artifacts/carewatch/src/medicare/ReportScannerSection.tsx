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
  Languages,
} from 'lucide-react';
import { SAMPLE_REPORTS, type MedicalReport } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const ReportScannerSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [reports, setReports] = useState<MedicalReport[]>(SAMPLE_REPORTS);
  const [selectedReport, setSelectedReport] = useState<MedicalReport>(SAMPLE_REPORTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const { speak } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setIsScanning(true);

      // Simulate OCR and AI Report Extraction
      setTimeout(() => {
        setIsScanning(false);
        const newRep: MedicalReport = {
          id: `rep-${Date.now()}`,
          patientName: 'Kameshwar Gupta',
          reportDate: 'Just now (Analyzed via MediCare OCR)',
          testType: 'Comprehensive Lipid & Metabolic Profile',
          summary:
            'Blood tests indicate healthy kidney parameters. Triglycerides are slightly elevated. Maintain physical activity and lower sugar/fried food intake.',
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

        speak(
          lang === 'hi'
            ? '???? ?????? ??????? ?? ???????? ???? ?? ??? ??? ?????? ?? ???????? ???? ??????? ?? ????????? ????'
            : 'Medical report OCR extraction complete. Summary and flagged values are ready to view and listen.',
          lang
        );
      }, 1800);
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            AI OCR & Plain Language Explainer
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.navReportScanner}</h2>
          <p className="text-teal-100 text-sm max-w-xl mt-1">
            Upload blood tests, CBC, lipid profiles or pathology PDFs. The AI extracts values, flags High/Low ranges, explains terms simply, and reads everything aloud.
          </p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? '??? ?????? ??????? ?????? ??? ???? ?????? ??? ???? ?? ???? ?????? ?? ???? ??????? ????? ???? ??? ???? ??? ??? ???? ????'
              : 'Welcome to AI Medical Report Scanner. Upload your medical lab reports to understand test values in simple terms with voice assistance.'
          }
          lang={lang}
          label="Listen Overview"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-teal-500/40 rounded-2xl p-6 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mb-3">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">
          {t.uploadPrompt}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          Supports CBC, Blood Sugar, Thyroid, Lipid Profile, Liver function reports (PDF, JPG, PNG).
        </p>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold text-xs shadow-md cursor-pointer transition-all">
          <Camera className="w-4 h-4" />
          <span>Upload or Capture Report</span>
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
            <span>Scanning report with OCR & analyzing medical values...</span>
          </div>
        )}
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
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
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

          {/* Voice Buttons Pack (Requirement: Listen to Complete, Listen Summary, Listen High/Low) */}
          <div className="flex flex-wrap gap-2">
            <ListenButton
              text={getFullAudioScript()}
              lang={lang}
              label="?? Listen Full Report"
              size="md"
              className="bg-teal-600 hover:bg-teal-700 text-white border-teal-700"
            />
            <ListenButton
              text={selectedReport.summary}
              lang={lang}
              label="Listen Summary"
              size="sm"
            />
            <ListenButton
              text={selectedReport.questionsForDoctor.join('. ')}
              lang={lang}
              label="Doctor Questions"
              size="sm"
            />
          </div>
        </div>

        {/* AI Plain English Summary */}
        <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-sm text-teal-900 dark:text-teal-200">
              AI Plain-Language Summary
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedReport.summary}
          </p>
          <p className="text-[11px] text-slate-400 mt-2 italic">{t.aiExplainerNote}</p>
        </div>

        {/* Values Table / Cards */}
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
            <span>Extracted Test Parameters & Normal Ranges</span>
            <span className="text-xs text-slate-500 font-normal">Click speaker on any row to listen</span>
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
                          ? 'bg-red-100 text-red-800'
                          : v.flag === 'Low'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
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

        {/* Questions for Doctor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Suggested Questions for your Doctor
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
              General Lifestyle Recommendations
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              {selectedReport.lifestyleAdvice.map((a, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">?</span>
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
