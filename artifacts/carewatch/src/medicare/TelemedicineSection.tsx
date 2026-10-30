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
} from 'lucide-react';
import { INITIAL_DOCTORS, type Doctor } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const TelemedicineSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

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

  // In-Call Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'doctor' | 'patient'; text: string; time: string }>>([]);
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
      // Audio not supported or blocked by browser policy
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

      // Attempt to access user webcam and mic via WebRTC MediaDevices
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
          .catch((err) => {
            console.warn('Real webcam access not available or blocked, using simulated video feed:', err);
            // Try video only fallback
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

      // Initialize doctor greeting and dynamic subtitles
      const doctorSpeechSequence = [
        `"Hello! I am ${activeCallDoc.name}. I have your medical chart open. Please describe what symptoms you are experiencing today."`,
        `"I understand. Have you noticed any temperature rise, headache, or throat irritation?"`,
        `"Your vitals and primary records appear steady. Let me note your observations in your clinical file."`,
        `"I am preparing your digital prescription with safe dosages. Ensure you drink warm fluids and get adequate rest."`,
      ];

      setDoctorSubtitles(doctorSpeechSequence[0]);
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
          text: `Hello! I am ${activeCallDoc.name} (${activeCallDoc.specialty}). I am live on your call. Please feel free to share your symptoms.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      // Clean up media tracks when call ends
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

  // Toggle Video Track
  const handleToggleVideo = () => {
    const nextState = !isVideoOn;
    setIsVideoOn(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  // Toggle Microphone Track
  const handleToggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  // Start Call
  const handleStartCall = (doc: Doctor) => {
    setActiveCallDoc(doc);
    setIsVideoOn(true);
    setIsMicOn(true);
    setIsScreenSharing(false);
  };

  // End Call & Show Prescription Summary
  const handleEndCall = () => {
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

  // Send message in call
  const handleSendChat = (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const patientMsg = {
      sender: 'patient' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, patientMsg]);
    if (!customText) setChatInput('');

    // Contextual intelligent doctor response
    setTimeout(() => {
      let docResponse = 'I have noted that in your consultation notes. Let us monitor this closely.';
      const lower = textToSend.toLowerCase();

      if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills')) {
        docResponse =
          'For temperature elevation, keep hydrated and take Paracetamol 650mg after food if above 99.5°F. I will prescribe it in your summary.';
      } else if (lower.includes('headache') || lower.includes('pain') || lower.includes('ache')) {
        docResponse =
          'Headache can accompany viral fatigue or dehydration. Rest in a dimly lit room and avoid screen glare. Take the prescribed analgesic.';
      } else if (lower.includes('chest') || lower.includes('breath') || lower.includes('heart')) {
        docResponse =
          'Please sit upright and relax. If you experience severe chest tightness or radiation to your jaw/left arm, click Emergency immediately.';
      } else if (lower.includes('prescription') || lower.includes('medicine') || lower.includes('dose')) {
        docResponse =
          'Your digital prescription is ready with complete dosage timings. It will be available when we end our call.';
      } else if (lower.includes('report') || lower.includes('cbc') || lower.includes('blood')) {
        docResponse =
          'I reviewed your uploaded lab report. Your hemoglobin is slightly low, but WBC and platelets are normal. Iron-rich nutrition is recommended.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'doctor',
          text: docResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setDoctorSubtitles(`"${docResponse}"`);
      setIsDoctorSpeaking(true);
      setTimeout(() => setIsDoctorSpeaking(false), 3500);
    }, 1100);
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
            WebRTC Encrypted Telemedicine Clinic
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.telemedTitle}</h2>
          <p className="text-indigo-100 text-sm max-w-xl mt-1">
            Connect live with certified medical specialists via high-definition video, audio, and encrypted real-time consultation.
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

              {/* Call Status & Timer */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>HD 1080p • 60 FPS • Encrypted</span>
                </span>
                <span className="font-mono text-xs bg-slate-800 px-3 py-1 rounded-md text-emerald-400 font-bold border border-slate-700">
                  {formatTimer(callDuration)}
                </span>
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
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
                {/* Doctor Visual Video Consultation Box */}
                <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
                  {/* Doctor Consultation Background / Avatar */}
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

                    {/* Animated Doctor Audio Equalizer Waveform */}
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

                  {/* PATIENT SELF-VIEW PICTURE-IN-PICTURE (Live WebRTC Video Stream) */}
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
                        // Graceful Simulated Camera Feed if physical device is blocked
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
                      // Camera Muted View
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                        <VideoOff className="w-5 h-5 text-red-400" />
                        <span className="text-[9px] text-red-400 font-semibold mt-1">Camera Off</span>
                      </div>
                    )}

                    {/* Self Video Label & Mic Status */}
                    <div className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex items-center gap-1">
                      <span>You</span>
                      {!isMicOn && <MicOff className="w-2.5 h-2.5 text-red-400" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* In-Call Live Chat Drawer (1/3 Grid) */}
              <div
                className={`bg-slate-900 border-l border-slate-800 flex flex-col h-full ${
                  isChatOpen ? 'flex' : 'hidden md:flex'
                }`}
              >
                <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>Live Consultation Chat</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Online
                  </span>
                </div>

                {/* Quick Symptom Chips */}
                <div className="p-2 border-b border-slate-800 bg-slate-950/40">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Quick Symptoms:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      '🌡️ High Fever & Chills',
                      '🤕 Severe Headache',
                      '🫀 Chest Discomfort',
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

                {/* Chat Stream */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === 'patient' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          msg.sender === 'patient'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                            : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
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
                    placeholder="Describe your symptoms to doctor..."
                    className="flex-1 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendChat()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer transition shadow-md"
                    title="Send Message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Call Controls Toolbar */}
            <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="hidden sm:inline">Room ID:</span>
                <span className="font-mono text-indigo-400 font-bold hidden sm:inline">
                  MED-RTC-{activeCallDoc.id}
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
                  <span>End Consultation</span>
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
                Patient presented with mild seasonal fever, headache, and bodily fatigue. Physical appearance and breathing pattern are stable. Advised rest, adequate oral hydration, and 3-day targeted symptomatic therapy.
              </div>
            </div>

            {/* Prescribed Medications Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Prescribed Medications (Rx):
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">Medicine Name</th>
                      <th className="p-2.5">Dosage</th>
                      <th className="p-2.5">Frequency</th>
                      <th className="p-2.5">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-2.5 font-bold text-indigo-600">Paracetamol 650mg (Dolo)</td>
                      <td className="p-2.5">1 Tablet</td>
                      <td className="p-2.5">Thrice daily after meals (TDS)</td>
                      <td className="p-2.5">3 Days</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-indigo-600">Cetirizine 10mg</td>
                      <td className="p-2.5">1 Tablet</td>
                      <td className="p-2.5">Once daily at bedtime (HS)</td>
                      <td className="p-2.5">3 Days</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-indigo-600">Vitamin C + Zinc Chewable</td>
                      <td className="p-2.5">1 Tablet</td>
                      <td className="p-2.5">Once daily in morning</td>
                      <td className="p-2.5">7 Days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Follow-up & Advice */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold block">Doctor Advice & Follow-Up:</span>
              Drink at least 2.5–3 liters of warm water daily. If fever persists above 101°F beyond 48 hours, book an immediate follow-up visit or visit the nearest emergency department.
            </div>

            {/* Pharmacy Dispatch Alert */}
            {pharmacySent && (
              <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Prescription successfully routed to Apollo Pharmacy for express home delivery!</span>
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
                <Sparkles className="w-4 h-4" />
                <span>Send to MediCare Pharmacy (1-Click)</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Digital Prescription PDF downloaded successfully.')}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Prescription (PDF)</span>
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
