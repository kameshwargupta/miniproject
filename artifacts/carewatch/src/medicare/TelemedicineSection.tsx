import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Calendar,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Send,
  User,
  X,
  Search,
  Volume2,
  VolumeX,
  Share2,
  Download,
  AlertCircle,
  Sparkles,
  Check,
  FileText,
  Activity,
  Zap,
  Pill,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { INITIAL_DOCTORS, type Doctor } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export interface InCallPrescription {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ChatMessage {
  sender: 'doctor' | 'patient';
  text: string;
  time: string;
  prescribedMed?: InCallPrescription;
}

export const TelemedicineSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const { speak, stop } = useVoice();

  // Video Consultation State
  const [activeCallDoc, setActiveCallDoc] = useState<Doctor | null>(null);
  const [isCallConnecting, setIsCallConnecting] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasWebcam, setHasWebcam] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(true);
  const [doctorSubtitles, setDoctorSubtitles] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);

  // In-Call Prescription List (Dynamic)
  const [prescribedList, setPrescribedList] = useState<InCallPrescription[]>([
    {
      id: 'rx-init-1',
      name: 'Paracetamol 650mg (Dolo 650)',
      dosage: '1 Tablet',
      frequency: 'Every 6-8 hours post-meal (SOS)',
      duration: '3 Days',
      instructions: 'Take with warm water after light food. Do not exceed 3 tabs daily.',
    },
    {
      id: 'rx-init-2',
      name: 'Pantocid 40 (Pantoprazole Sodium)',
      dosage: '1 Tablet',
      frequency: 'Once daily in the morning',
      duration: '5 Days',
      instructions: 'Take 30 to 45 minutes before breakfast on an empty stomach.',
    },
  ]);

  // In-Call Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Post-Call Prescription State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [completedDoc, setCompletedDoc] = useState<Doctor | null>(null);
  const [pharmacySent, setPharmacySent] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Sound chime using Web Audio API
  const playChime = (type: 'connect' | 'end') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      if (type === 'connect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch {
      // Audio not supported
    }
  };

  // Manage Live Webcam & Audio Stream
  useEffect(() => {
    let captionTimer: any = null;
    let waveTimer: any = null;

    if (activeCallDoc) {
      setIsCallConnecting(true);
      setCallDuration(0);
      playChime('connect');

      // Attempt to access user webcam and mic
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            mediaStreamRef.current = stream;
            setHasWebcam(true);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            navigator.mediaDevices
              .getUserMedia({ video: true, audio: false })
              .then((stream) => {
                mediaStreamRef.current = stream;
                setHasWebcam(true);
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = stream;
                }
              })
              .catch(() => {
                setHasWebcam(false);
              });
          })
          .finally(() => {
            setTimeout(() => {
              setIsCallConnecting(false);
            }, 1000);
          });
      } else {
        setHasWebcam(false);
        setTimeout(() => setIsCallConnecting(false), 800);
      }

      // Voice greeting when call connects
      const welcomeSpeech =
        lang === 'hi'
          ? `नमस्ते! मैं ${activeCallDoc.name} हूँ। मैं आपकी लाइव वीडियो कॉल पर हूँ। कृपया मुझे अपनी स्वास्थ्य समस्या या लक्षण बताएं, मैं तुरंत उपयुक्त दवा प्रिस्क्राइब करूँगा।`
          : `Hello! I am ${activeCallDoc.name}. I am live on your consultation call. Please describe your health problem in the chat, and I will prescribe the appropriate medications for you right now.`;

      setDoctorSubtitles(`"${welcomeSpeech}"`);
      setIsDoctorSpeaking(true);
      setTimeout(() => {
        speak(welcomeSpeech, lang);
      }, 1200);

      const doctorSpeechSequence = [
        `"I have your medical chart open. Please describe what symptoms you are experiencing today."`,
        `"I understand. Have you noticed any temperature rise, headache, or throat irritation?"`,
        `"Your vitals and primary records appear steady. Let me note your observations in your clinical file."`,
        `"I am preparing your digital prescription with safe dosages. Ensure you drink warm fluids and get adequate rest."`,
      ];

      let index = 0;
      captionTimer = setInterval(() => {
        index = (index + 1) % doctorSpeechSequence.length;
        setDoctorSubtitles(doctorSpeechSequence[index]);
        setIsDoctorSpeaking(true);
        setTimeout(() => setIsDoctorSpeaking(false), 3800);
      }, 7500);

      waveTimer = setInterval(() => {
        setIsDoctorSpeaking((prev) => !prev);
      }, 3000);

      // In-call default chat message
      setChatMessages([
        {
          sender: 'doctor',
          text: `Hello! I am ${activeCallDoc.name} (${activeCallDoc.specialty}). I am live on your call. Please type your health symptoms or problem, and I will prescribe the exact medicine for you.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      clearInterval(captionTimer);
      clearInterval(waveTimer);
    };
  }, [activeCallDoc]);

  // Call duration counter
  useEffect(() => {
    let interval: any = null;
    if (activeCallDoc && !isCallConnecting) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCallDoc, isCallConnecting]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleVideo = () => {
    const nextState = !isVideoOn;
    setIsVideoOn(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  const handleToggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  const handleStartCall = (doc: Doctor) => {
    setActiveCallDoc(doc);
    setIsVideoOn(true);
    setIsMicOn(true);
    setIsScreenSharing(false);
  };

  const handleEndCall = () => {
    stop();
    playChime('end');
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (activeCallDoc) {
      setCompletedDoc(activeCallDoc);
      setShowPrescriptionModal(true);
    }
    setActiveCallDoc(null);
  };

  // SEND MESSAGE IN CALL: Analyzes problem and PRESCRIBES EXACT MEDICINE!
  const handleSendChat = (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const patientMsg: ChatMessage = {
      sender: 'patient',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, patientMsg]);
    if (!customText) setChatInput('');

    // Contextual clinical problem diagnosis & exact medicine prescription
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let docText = '';
      let prescription: InCallPrescription | undefined = undefined;

      // 1. FEVER / VIRAL
      if (lower.includes('fever') || lower.includes('temperature') || lower.includes('बुखार') || lower.includes('chills')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Dolo 650 (Paracetamol IP 650mg)',
          dosage: '1 Tablet',
          frequency: 'Every 6 to 8 hours post-meal (SOS)',
          duration: '3 Days',
          instructions: 'Take strictly after light food with water. Maintain 6-hour gap between tablets. Drink 3L fluids.',
        };
        docText =
          lang === 'hi'
            ? `मैंने आपके बुखार के लक्षण दर्ज कर लिए हैं। मैंने आपके लिए **Dolo 650** प्रिस्क्राइब कर दी है। कृपया भोजन के बाद 1 गोली लें।`
            : `I have diagnosed your elevated temperature. I am prescribing **Dolo 650 (Paracetamol 650mg)**. Take 1 tablet after meals if temperature exceeds 99.5°F.`;
      }
      // 2. HEADACHE / MIGRAINE / BODY ACHE
      else if (lower.includes('headache') || lower.includes('pain') || lower.includes('ache') || lower.includes('दर्द') || lower.includes('migraine')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Combiflam (Ibuprofen 400mg + Paracetamol 325mg)',
          dosage: '1 Tablet',
          frequency: 'Twice daily after meals (BD)',
          duration: '3 Days',
          instructions: 'Take strictly after a full meal with a full glass of water. Never take on an empty stomach.',
        };
        docText =
          lang === 'hi'
            ? `सिरदर्द और शरीर के दर्द के लिए मैंने **Combiflam** प्रिस्क्राइब की है। इसे भोजन के बाद लें और अंधेरे कमरे में 20 मिनट आराम करें।`
            : `For acute headache and muscular discomfort, I am prescribing **Combiflam**. Take 1 tablet twice daily strictly after meals with plenty of water.`;
      }
      // 3. COUGH / COLD / SORE THROAT
      else if (lower.includes('cough') || lower.includes('throat') || lower.includes('खांसी') || lower.includes('gala') || lower.includes('cold') || lower.includes('जुकाम')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Ascoril D Plus Syrup (100ml) + Cetirizine 10mg',
          dosage: '10 ml Syrup + 1 Tablet',
          frequency: 'Syrup 3 times daily + Cetirizine at bedtime',
          duration: '5 Days',
          instructions: 'Shake syrup bottle well before use. Gargle with warm saline water twice daily.',
        };
        docText =
          lang === 'hi'
            ? `खांसी और गले की खराश के लिए मैंने **Ascoril D Plus सिरप** और रात के लिए **Cetirizine 10mg** प्रिस्क्राइब की है। गुनगुने पानी के गरारे करें।`
            : `For airway congestion and cough, I am prescribing **Ascoril D Plus Syrup (10ml thrice daily)** and **Cetirizine 10mg at bedtime**.`;
      }
      // 4. ACIDITY / GAS / HEARTBURN / GERD
      else if (lower.includes('acid') || lower.includes('gas') || lower.includes('stomach') || lower.includes('pet') || lower.includes('heartburn') || lower.includes('jalan')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Pantocid 40 (Pantoprazole 40mg) + Digene Gel',
          dosage: '1 Tablet Pantocid + 10ml Digene Gel',
          frequency: 'Pantocid: Morning empty stomach | Digene: Post-meal SOS',
          duration: '7 Days',
          instructions: 'Take Pantocid 30-45 minutes before breakfast with water. Avoid oily, spicy, and deep-fried foods.',
        };
        docText =
          lang === 'hi'
            ? `एसिडिटी और पेट की जलन के लिए मैंने **Pantocid 40** (सुबह खाली पेट) और तुरंत राहत के लिए **Digene Gel** प्रिस्क्राइब किया है।`
            : `For gastric hyperacidity and reflux, I am prescribing **Pantocid 40mg (morning empty stomach)** and **Digene Gel (10ml SOS)**.`;
      }
      // 5. STOMACH CRAMP / PAIN
      else if (lower.includes('cramp') || lower.includes('spas') || lower.includes('pet dard') || lower.includes('मरोड़')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Meftal Spas (Dicyclomine 10mg + Mefenamic Acid 250mg)',
          dosage: '1 Tablet',
          frequency: 'Twice daily after food (SOS)',
          duration: '2 to 3 Days',
          instructions: 'Relieves visceral intestinal cramping and abdominal colic. Take with warm water.',
        };
        docText =
          lang === 'hi'
            ? `पेट की मरोड़ और ऐंठन के लिए मैंने **Meftal Spas** प्रिस्क्राइब की है। इसे भोजन के बाद लें।`
            : `For abdominal spasmodic cramping, I am prescribing **Meftal Spas**. Take 1 tablet after food as needed.`;
      }
      // 6. LOOSE MOTIONS / DIARRHEA / VOMITING
      else if (lower.includes('loose') || lower.includes('diarrhea') || lower.includes('dast') || lower.includes('vomit') || lower.includes('ulti')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Electral WHO-ORS Powder + Ondansetron 4mg (Emeset)',
          dosage: '1 Sachet in 1 Liter Water + 1 Tablet Emeset',
          frequency: 'Sip ORS continuously | Emeset before food',
          duration: '3 Days',
          instructions: 'Dissolve entire ORS sachet in 1L clean water. Drink throughout the day to prevent clinical dehydration.',
        };
        docText =
          lang === 'hi'
            ? `दस्त और उल्टी के लिए मैंने **Electral ORS घोल** और उल्टी रोकने के लिए **Ondansetron (Emeset 4mg)** प्रिस्क्राइब किया है। लगातार ओआरएस पिएं।`
            : `For acute gastroenteritis, I am prescribing **Electral WHO-ORS** for continuous oral rehydration and **Ondansetron 4mg** before meals.`;
      }
      // 7. INFECTION / ANTIBIOTIC REQUEST
      else if (lower.includes('infection') || lower.includes('antibiotic') || lower.includes('tonsil') || lower.includes('pus')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Augmentin 625 Duo (Amoxicillin 500mg + Clavulanate 125mg)',
          dosage: '1 Tablet',
          frequency: 'Twice daily strictly after meals (every 12 hours)',
          duration: '5 Days Course',
          instructions: 'Complete full 5-day course to prevent bacterial resistance. Take with food to avoid gastric upset.',
        };
        docText =
          lang === 'hi'
            ? `संक्रमण नियंत्रण के लिए मैंने ब्रॉड-स्पेक्ट्रम एंटीबायोटिक **Augmentin 625 Duo** प्रिस्क्राइब की है। 5 दिन का पूरा कोर्स अवश्य करें।`
            : `For bacterial infection management, I am prescribing **Augmentin 625 Duo (1 tablet twice daily after meals for 5 days)**.`;
      }
      // 8. ALLERGY / ITCHING / SKIN RASH
      else if (lower.includes('allergy') || lower.includes('itch') || lower.includes('rash') || lower.includes('hives') || lower.includes('khujli')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Allegra 120 (Fexofenadine 120mg)',
          dosage: '1 Tablet',
          frequency: 'Once daily in the evening',
          duration: '5 Days',
          instructions: 'Non-sedating antihistamine for allergic skin hives, itching, and sneezing. Take with water.',
        };
        docText =
          lang === 'hi'
            ? `एलर्जी और खुजली के लिए मैंने **Allegra 120 (Fexofenadine)** प्रिस्क्राइब की है। शाम को 1 गोली लें।`
            : `For acute allergic reaction and cutaneous itching, I am prescribing **Allegra 120mg (once daily in evening)**.`;
      }
      // 9. BLOOD PRESSURE
      else if (lower.includes('bp') || lower.includes('pressure') || lower.includes('hypertension')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Telma 40 (Telmisartan 40mg)',
          dosage: '1 Tablet',
          frequency: 'Once daily in morning (Fixed timing)',
          duration: '30 Days Maintenance',
          instructions: 'Take consistently every morning. Maintain low sodium diet (< 5g salt daily).',
        };
        docText =
          lang === 'hi'
            ? `ब्लड प्रेशर नियंत्रण के लिए मैंने **Telma 40** प्रिस्क्राइब की है। इसे प्रतिदिन सुबह एक ही समय पर लें और नमक कम करें।`
            : `For blood pressure regulation, I am prescribing **Telma 40 (Telmisartan 40mg once daily in morning)**. Keep dietary salt low.`;
      }
      // 10. DIABETES / SUGAR
      else if (lower.includes('sugar') || lower.includes('diabetes') || lower.includes('glucose')) {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Glycomet 500 SR (Metformin 500mg Sustained Release)',
          dosage: '1 Tablet',
          frequency: 'Once daily with main meal (Lunch/Dinner)',
          duration: '30 Days Maintenance',
          instructions: 'Take with or immediately after food. Never skip meals after taking this tablet.',
        };
        docText =
          lang === 'hi'
            ? `ब्लड शुगर नियंत्रण के लिए मैंने **Glycomet 500 SR (Metformin)** प्रिस्क्राइब की है। इसे हमेशा भोजन के साथ लें।`
            : `For glycemic control, I am prescribing **Glycomet 500 SR (Metformin 500mg with main meal)**.`;
      }
      // 11. GENERAL / CONSULTATION
      else {
        prescription = {
          id: `rx-${Date.now()}`,
          name: 'Becosules Z (B-Complex + Zinc + Vitamin C)',
          dosage: '1 Capsule',
          frequency: 'Once daily after breakfast',
          duration: '10 Days',
          instructions: 'Daily metabolic and immunity booster. Enhances stamina and cellular recovery.',
        };
        docText =
          lang === 'hi'
            ? `मैंने आपकी समस्या नोट कर ली है। आपके स्वास्थ्य को तेजी से सुधारने के लिए मैंने **Becosules Z** और आवश्यक सावधानियां प्रिस्क्राइब की हैं।`
            : `I have evaluated your health concerns. I am prescribing **Becosules Z Capsule** along with hydration and rest.`;
      }

      // Add to in-call prescription roster
      if (prescription) {
        setPrescribedList((prev) => {
          const exists = prev.some((p) => p.name.toLowerCase().includes(prescription!.name.slice(0, 8).toLowerCase()));
          if (!exists) {
            return [...prev, prescription!];
          }
          return prev;
        });
      }

      const doctorMsg: ChatMessage = {
        sender: 'doctor',
        text: docText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prescribedMed: prescription,
      };

      setChatMessages((prev) => [...prev, doctorMsg]);
      setDoctorSubtitles(`"${docText}"`);
      setIsDoctorSpeaking(true);

      if (isSpeakerOn) {
        speak(docText, lang);
      }
      setTimeout(() => setIsDoctorSpeaking(false), 4500);
    }, 900);
  };

  const handleBookAppointment = (doc: Doctor) => {
    setBookedSlot(`${doc.name} (${doc.availableSlot})`);
    setTimeout(() => setBookedSlot(null), 5000);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec =
      selectedSpecialty === 'All' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesQuery =
      doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchDoctor.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            AI-Assisted WebRTC Telemedicine & Clinical Consultation
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.telemedTitle}</h2>
          <p className="text-indigo-100 text-sm max-w-xl mt-1">
            Connect live with medical specialists via high-definition video call. Describe your problems in the in-call chatbox to receive instant digital prescriptions.
          </p>
        </div>

        {/* Priority Emergency Call */}
        <button
          type="button"
          onClick={() => handleStartCall(doctors[0])}
          className="px-5 py-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-2"
        >
          <Zap className="w-4 h-4 text-amber-500 fill-current" />
          <span>⚡ Instant Priority Consultation (Dr. Sarah Khan)</span>
        </button>
      </div>

      {/* Booking Toast */}
      {bookedSlot && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Appointment confirmed with {bookedSlot}. Confirmation SMS and secure video link dispatched.</span>
          </div>
          <button onClick={() => setBookedSlot(null)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Specialty Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchDoctor}
            onChange={(e) => setSearchDoctor(e.target.value)}
            placeholder={t.searchDoctor}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {['All', 'Medicine', 'Cardiologist', 'Pediatrician', 'Pulmonologist'].map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap border ${
                selectedSpecialty === spec
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {doc.name.replace('Dr. ', '').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {doc.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {doc.specialty}
                  </p>
                  <p className="text-[11px] text-slate-500">{doc.hospital}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center my-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.doctorExp}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {doc.experience}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.rating}</span>
                  <span className="text-xs font-bold text-amber-500 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" /> {doc.rating}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.consultFee}</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {doc.consultationFee}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>Next Slot:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {doc.availableSlot}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleBookAppointment(doc)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.bookAppointment}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartCall(doc)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md group"
              >
                <Video className="w-4 h-4 group-hover:scale-110 transition-transform text-white" />
                <span>Start Video Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* LIVE VIDEO CONSULTATION ROOM MODAL (WebRTC LIVE STREAM + HD DOCTOR FEED) */}
      {/* ========================================================================= */}
      {activeCallDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl h-[680px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    {activeCallDoc.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeCallDoc.specialty} • {activeCallDoc.hospital}
                  </p>
                </div>
              </div>

              {/* Call Status & Live Prescriptions Counter */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                  <Pill className="w-3 h-3 text-emerald-400" />
                  <span>Prescribed: {prescribedList.length} Meds</span>
                </span>
                <span className="font-mono text-xs bg-slate-800 px-3 py-1 rounded-md text-emerald-400 font-bold border border-slate-700">
                  {formatTimer(callDuration)}
                </span>
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Close Consultation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Connecting State Banner */}
            {isCallConnecting && (
              <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center gap-4 text-white p-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-400">
                    {activeCallDoc.name.replace('Dr. ', '').slice(0, 2)}
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-base font-bold">Connecting Secure WebRTC Session...</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Establishing peer-to-peer encrypted video channel with {activeCallDoc.name}
                  </p>
                </div>
              </div>
            )}

            {/* Main Stage: Video + Chat Layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
              {/* Doctor Video Area (2/3 Grid) */}
              <div className="md:col-span-2 bg-slate-950 relative flex items-center justify-center p-3 sm:p-4 overflow-hidden">
                <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
                  {/* Doctor Consultation Avatar */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-indigo-300 text-3xl sm:text-4xl font-black">
                        {activeCallDoc.name.replace('Dr. ', '').slice(0, 2)}
                      </div>
                    </div>

                    <span className="text-white font-bold text-lg mt-3 flex items-center gap-1.5">
                      {activeCallDoc.name}
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </span>
                    <span className="text-xs text-indigo-300 font-medium">
                      {activeCallDoc.qualification} • {activeCallDoc.specialty}
                    </span>

                    {/* Animated Doctor Audio Equalizer */}
                    <div className="flex items-center gap-1.5 mt-3 h-6">
                      {[12, 24, 16, 28, 14].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full bg-emerald-400 transition-all duration-300 ${
                            isDoctorSpeaking ? 'opacity-100' : 'opacity-30'
                          }`}
                          style={{
                            height: isDoctorSpeaking ? `${h}px` : '4px',
                            animation: isDoctorSpeaking ? `bounce 1s infinite ${i * 0.15}s` : 'none',
                          }}
                        />
                      ))}
                      <span className="text-[11px] text-emerald-400 font-semibold ml-2">
                        {isDoctorSpeaking ? 'Doctor Speaking...' : 'Listening to you...'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Dynamic Subtitles / Speech Bubble */}
                  <div className="absolute bottom-4 left-4 right-36 sm:right-44">
                    <div className="bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white text-xs shadow-lg animate-in fade-in">
                      <p className="text-slate-200 italic line-clamp-2">{doctorSubtitles}</p>
                    </div>
                  </div>

                  {/* PATIENT SELF-VIEW PICTURE-IN-PICTURE */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-28 bg-slate-900 rounded-xl border-2 border-indigo-500/60 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                    {isVideoOn ? (
                      hasWebcam ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-center p-2 relative">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            You
                          </div>
                          <span className="text-[9px] text-emerald-400 font-semibold mt-1">
                            Camera Active (HD)
                          </span>
                          <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                        <VideoOff className="w-5 h-5 text-red-400" />
                        <span className="text-[9px] text-red-400 font-semibold mt-1">Camera Off</span>
                      </div>
                    )}

                    <div className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex items-center gap-1">
                      <span>You</span>
                      {!isMicOn && <MicOff className="w-2.5 h-2.5 text-red-400" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* In-Call Live Chat Drawer (1/3 Grid) with PRESCRIPTION GENERATION */}
              <div
                className={`bg-slate-900 border-l border-slate-800 flex flex-col h-full ${
                  isChatOpen ? 'flex' : 'hidden md:flex'
                }`}
              >
                <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>Live Prescription & Symptoms Chat</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Online
                  </span>
                </div>

                {/* Quick Symptom Chips */}
                <div className="p-2 border-b border-slate-800 bg-slate-950/40">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Type or Click Problem:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      '🌡️ High Fever & Chills',
                      '🤕 Severe Headache',
                      '🔥 Stomach Acidity & Gas',
                      '🤮 Loose Motion & Vomiting',
                      '😮‍💨 Cough & Sore Throat',
                      '💊 Request Prescription',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendChat(chip)}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages Stream with INTERACTIVE PRESCRIPTION CARDS */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === 'patient' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.sender === 'patient'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                            : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* PRESCRIBED MEDICINE CARD INSIDE CHAT */}
                        {msg.prescribedMed && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/50 text-white space-y-1.5 shadow-md">
                            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1">
                              <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                                <Pill className="w-3.5 h-3.5" /> Doctor Prescribed (Rx)
                              </span>
                              <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                {msg.prescribedMed.duration}
                              </span>
                            </div>

                            <div className="font-bold text-sm text-emerald-300">
                              {msg.prescribedMed.name}
                            </div>

                            <div className="text-[11px] text-slate-200">
                              <span className="text-slate-400">Dosage:</span>{' '}
                              <strong className="text-white">{msg.prescribedMed.dosage}</strong> •{' '}
                              {msg.prescribedMed.frequency}
                            </div>

                            <div className="text-[10px] text-slate-400 italic">
                              Instructions: {msg.prescribedMed.instructions}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* In-Call Chat Input */}
                <div className="p-2.5 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Describe your health problem for prescription..."
                    className="flex-1 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendChat()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer transition shadow-md"
                    title="Send Problem"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Call Controls Toolbar */}
            <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="hidden sm:inline">Active Consultation:</span>
                <span className="font-mono text-indigo-400 font-bold hidden sm:inline">
                  {prescribedList.length} Medicines Prescribed
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Mic Mute / Unmute */}
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-3 rounded-full cursor-pointer transition ${
                    isMicOn
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/20'
                  }`}
                  title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Video On / Off */}
                <button
                  type="button"
                  onClick={handleToggleVideo}
                  className={`p-3 rounded-full cursor-pointer transition ${
                    isVideoOn
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/20'
                  }`}
                  title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                {/* Doctor Audio Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-3 rounded-full cursor-pointer transition ${
                    isSpeakerOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-amber-600 text-white'
                  }`}
                  title={isSpeakerOn ? 'Mute Doctor Speaker' : 'Unmute Doctor Speaker'}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                {/* Screen Share Simulation */}
                <button
                  type="button"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-3 rounded-full cursor-pointer transition ${
                    isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  title="Share Medical Records"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {/* End Call Button */}
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition active:scale-95"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Consultation & Get Rx</span>
                </button>
              </div>

              {/* Chat Toggle Mobile */}
              <button
                type="button"
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="md:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST-CONSULTATION PRESCRIPTION & CLINICAL SUMMARY MODAL */}
      {/* ========================================================================= */}
      {showPrescriptionModal && completedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold uppercase flex items-center gap-1 w-fit">
                  <CheckCircle className="w-3.5 h-3.5" /> Consultation Completed
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  Official Digital Prescription & Consultation Summary
                </h3>
                <p className="text-xs text-slate-500">
                  Issued by {completedDoc.name} • {completedDoc.hospital}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor & Patient Info */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Kameshwar Gupta (Male, 28)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Attending Doctor:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completedDoc.name} ({completedDoc.specialty})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Session Duration:</span>
                <span className="font-bold text-emerald-600">{formatTimer(callDuration)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration / Rx ID:</span>
                <span className="font-mono font-bold text-indigo-600">RX-2026-MED-{completedDoc.id.toUpperCase()}</span>
              </div>
            </div>

            {/* Doctor Clinical Diagnosis */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
                Clinical Diagnosis & Observations:
              </h4>
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl text-xs text-slate-800 dark:text-slate-200">
                Consultation conducted via encrypted video call. Target complaints and symptoms assessed through real-time communication. Patient advised to take prescribed medications post-prandially with adequate hydration.
              </div>
            </div>

            {/* Prescribed Medications Table (DYNAMIC FROM IN-CALL CHAT) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Prescribed Medications (Rx - {prescribedList.length} Items):
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold">
                  ✓ Verified Clinical Formulations
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">Medicine Name</th>
                      <th className="p-2.5">Dosage</th>
                      <th className="p-2.5">Frequency</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {prescribedList.map((med) => (
                      <tr key={med.id}>
                        <td className="p-2.5 font-bold text-indigo-600">{med.name}</td>
                        <td className="p-2.5">{med.dosage}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{med.frequency}</td>
                        <td className="p-2.5 font-semibold text-emerald-600">{med.duration}</td>
                        <td className="p-2.5 text-[11px] text-slate-500">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Follow-up & Advice */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold block">Doctor Advice & Follow-Up:</span>
              Drink at least 2.5–3 liters of warm water daily. Complete full course of any prescribed antibiotics. If symptoms persist beyond 48 hours, book an immediate follow-up visit.
            </div>

            {/* Pharmacy Dispatch Alert */}
            {pharmacySent && (
              <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Prescription routed to Sewa Hospital Pharmacy (150m from BIET) for express dispatch!</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPharmacySent(true)}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Send to Sewa Hospital Pharmacy (1-Click)</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Official Digital Prescription PDF saved successfully.')}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download Prescription</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrescriptionModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
