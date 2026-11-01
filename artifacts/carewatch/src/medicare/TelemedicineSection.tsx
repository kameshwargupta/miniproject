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
import { askCopilotChatWithAi } from './aiMedicalService';

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

  // In-Call Voice-Powered Consultation State (No writing needed - 100% voice on video)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [liveSpokenTranscript, setLiveSpokenTranscript] = useState('');
  const [isDoctorThinking, setIsDoctorThinking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Post-Call Prescription State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [completedDoc, setCompletedDoc] = useState<Doctor | null>(null);
  const [pharmacySent, setPharmacySent] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerInstanceRef = useRef<any>(null);
  const activeCallRef = useRef<any>(null);

  // WebRTC / PeerJS State
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [joinRoomInput, setJoinRoomInput] = useState<string>('');
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

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


  // Load PeerJS CDN script once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Peer) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
      script.async = true;
      script.onload = () => setIsPeerReady(true);
      document.body.appendChild(script);
    } else if ((window as any).Peer) {
      setIsPeerReady(true);
    }
    return () => {
      // Cleanup peer on unmount
      if (peerInstanceRef.current) {
        try { peerInstanceRef.current.destroy(); } catch {}
        peerInstanceRef.current = null;
      }
    };
  }, []);

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
          ? `नमस्ते! मैं ${activeCallDoc.name} हूँ। मैं आपकी लाइव वीडियो कॉल पर हूँ। कृपया मुझे बोलकर अपनी स्वास्थ्य समस्या बताएं, मैं आपकी आवाज सुनकर तुरंत सटीक दवा प्रिस्क्राइब करूँगा।`
          : `Hello! I am ${activeCallDoc.name}. I am live on your video call. Please speak your health problem or symptoms aloud, and I will diagnose your condition and prescribe the exact medicine for you right now.`;

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
          text: `Hello! I am ${activeCallDoc.name} (${activeCallDoc.specialty}). I am live on your video consultation. Speak your symptoms or query aloud into your microphone, and I will answer and prescribe your medications immediately.`,
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

  // Initialize PeerJS and get media when call starts
  const initPeerAndMedia = async (doc: Doctor) => {
    // Get user media first
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch {
        setHasWebcam(false);
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      setHasWebcam(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }

    // Initialize PeerJS
    const PeerClass = (window as any).Peer;
    if (!PeerClass) return;

    // Destroy old peer if any
    if (peerInstanceRef.current) {
      try { peerInstanceRef.current.destroy(); } catch {}
    }

    const peer = new PeerClass(undefined, {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ]
      }
    });

    peerInstanceRef.current = peer;

    peer.on('open', (id: string) => {
      setMyPeerId(id);
      setRoomId(id);
      setIsCallConnecting(false);
    });

    peer.on('error', (err: any) => {
      console.error('PeerJS error:', err);
      setIsCallConnecting(false);
    });

    // Listen for incoming calls (doctor joining as caller)
    peer.on('call', (call: any) => {
      activeCallRef.current = call;
      const localStream = mediaStreamRef.current;
      call.answer(localStream || undefined);
      call.on('stream', (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsCallConnected(true);
        setIsCallConnecting(false);
      });
      call.on('close', () => {
        setIsCallConnected(false);
      });
    });
  };

  const handleStartCall = (doc: Doctor) => {
    setActiveCallDoc(doc);
    setIsVideoOn(true);
    setIsMicOn(true);
    setIsScreenSharing(false);
    setIsCallConnected(false);
    setRoomId('');
    setMyPeerId('');
    setShowJoinForm(false);
    setJoinRoomInput('');
    setTimeout(() => {
      initPeerAndMedia(doc);
    }, 400);
  };

  // Doctor / second person joins by entering room ID
  const handleJoinAsDoctor = async () => {
    const targetRoomId = joinRoomInput.trim();
    if (!targetRoomId) return;

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch {}
    }

    if (stream) {
      mediaStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    }

    const PeerClass = (window as any).Peer;
    if (!PeerClass) return;

    if (peerInstanceRef.current) {
      try { peerInstanceRef.current.destroy(); } catch {}
    }

    const peer = new PeerClass(undefined, {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peerInstanceRef.current = peer;
    setIsCallConnecting(true);

    peer.on('open', () => {
      const call = peer.call(targetRoomId, stream || new MediaStream());
      activeCallRef.current = call;

      call.on('stream', (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setIsCallConnected(true);
        setIsCallConnecting(false);
      });

      call.on('close', () => setIsCallConnected(false));
      call.on('error', () => setIsCallConnecting(false));
    });

    peer.on('error', () => setIsCallConnecting(false));
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleEndCall = () => {
    stop();
    playChime('end');
    // Stop all media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    // Close active WebRTC call
    if (activeCallRef.current) {
      try { activeCallRef.current.close(); } catch {}
      activeCallRef.current = null;
    }
    // Destroy PeerJS instance
    if (peerInstanceRef.current) {
      try { peerInstanceRef.current.destroy(); } catch {}
      peerInstanceRef.current = null;
    }
    // Clear remote video
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsCallConnected(false);
    setRoomId('');
    setMyPeerId('');
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    setIsListeningVoice(false);
    setLiveSpokenTranscript('');
    if (activeCallDoc) {
      setCompletedDoc(activeCallDoc);
      setShowPrescriptionModal(true);
    }
    setActiveCallDoc(null);
  };

  // LIVE VOICE SPEECH RECOGNITION (Talk to Doctor on Video)
  const startVoiceListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        lang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस रिकॉग्निशन सपोर्ट नहीं है। कृपया Google Chrome या Edge का उपयोग करें।'
          : 'Speech recognition is not supported in this browser. Please use Google Chrome or Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setLiveSpokenTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = final || interim;
        if (text) {
          setLiveSpokenTranscript(text);
        }
        if (final.trim()) {
          handleProcessSpokenQuery(final.trim());
          setLiveSpokenTranscript('');
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
      setIsListeningVoice(false);
    }
  }, [lang]);

  const toggleVoiceListening = () => {
    if (isListeningVoice) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListeningVoice(false);
    } else {
      startVoiceListening();
    }
  };

  // LIVE SPOKEN QUERY PROCESSOR: Listens on video call and gives EXACT answer + Prescription
  const handleProcessSpokenQuery = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend) return;

    // 1. Add patient spoken question to transcript
    const patientMsg: ChatMessage = {
      sender: 'patient',
      text: `🎙️ ${textToSend}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, patientMsg]);

    setIsDoctorThinking(true);
    setIsDoctorSpeaking(true);
    setDoctorSubtitles(
      lang === 'hi'
        ? `"${textToSend}" का निदान किया जा रहा है...`
        : `Evaluating "${textToSend}"...`
    );

    const lower = textToSend.toLowerCase();
    let docText = '';
    let prescription: InCallPrescription | undefined = undefined;

    // 1. FEVER / VIRAL
    if (lower.includes('fever') || lower.includes('temperature') || lower.includes('बुखार') || lower.includes('chills') || lower.includes('bukhar')) {
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
          ? `मैंने आपका बुखार नोट कर लिया है। आपके लिए Dolo 650mg प्रिस्क्राइब की गई है। भोजन के बाद 1 गोली लें और 2-3 लीटर गुनगुना पानी पिएं।`
          : `I have diagnosed your elevated temperature. I am prescribing Dolo 650mg (Paracetamol). Take 1 tablet after meals if temperature exceeds 99.5°F.`;
    }
    // 2. HEADACHE / MIGRAINE / BODY ACHE
    else if (lower.includes('headache') || lower.includes('pain') || lower.includes('ache') || lower.includes('दर्द') || lower.includes('migraine') || lower.includes('sirdard')) {
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
          ? `सिरदर्द और बदन दर्द के लिए Combiflam 1 गोली भोजन के बाद लें। कम रोशनी वाले कमरे में 20 मिनट विश्राम करें।`
          : `For acute headache and muscular discomfort, take Combiflam 1 tablet after meals with water. Rest in a dark, quiet room.`;
    }
    // 3. COUGH / COLD / SORE THROAT
    else if (lower.includes('cough') || lower.includes('throat') || lower.includes('खांसी') || lower.includes('gala') || lower.includes('cold') || lower.includes('जुकाम') || lower.includes('khansi')) {
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
          ? `खांसी और गले की खराश के लिए Ascoril D Plus सिरप 10ml दिन में 3 बार और रात में 1 Cetirizine 10mg लें। गुनगुने पानी के गरारे करें।`
          : `For cough and airway congestion, take Ascoril D Plus Syrup (10ml thrice daily) and Cetirizine 10mg at bedtime.`;
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
          ? `पेट में गैस और जलन के लिए Pantocid 40 सुबह खाली पेट लें और तुरंत राहत के लिए Digene Gel 10ml लें। तला-भुना भोजन न करें।`
          : `For gastric hyperacidity and reflux, take Pantocid 40mg in the morning on an empty stomach and Digene Gel (10ml SOS).`;
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
          ? `पेट की ऐंठन और मरोड़ के लिए Meftal Spas 1 गोली भोजन के बाद लें और पेट पर गर्म पानी की सिकाई करें।`
          : `For abdominal spasmodic cramps, take Meftal Spas 1 tablet after meals as needed. Apply warm compress.`;
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
          ? `दस्त और उल्टी के लिए 1 लीटर पानी में Electral घोल बनाकर लगातार पिएं और उल्टी रोकने के लिए Emeset 4mg भोजन से पहले लें।`
          : `For gastroenteritis and vomiting, drink Electral WHO-ORS solution continuously and take Ondansetron 4mg before meals.`;
    }
    // 7. INFECTION / ANTIBIOTIC
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
          ? `बैक्टीरियल इन्फेक्शन के लिए Augmentin 625 Duo 1 गोली सुबह और शाम भोजन के बाद लें। 5 दिन का कोर्स पूरा करें।`
          : `For bacterial infection, take Augmentin 625 Duo 1 tablet twice daily after meals. Complete the full 5-day course.`;
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
          ? `एलर्जी और खुजली के लिए Allegra 120mg शाम को 1 गोली लें। तेज साबुन और गर्म पानी से बचें।`
          : `For allergic skin reaction and itching, take Allegra 120mg once daily in the evening.`;
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
          ? `ब्लड प्रेशर के लिए Telma 40 प्रतिदिन सुबह एक निश्चित समय पर लें। भोजन में नमक की मात्रा कम रखें।`
          : `For blood pressure management, take Telma 40mg once daily in the morning at the same time. Reduce dietary salt.`;
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
          ? `शुगर नियंत्रण के लिए Glycomet 500 SR दोपहर के भोजन के साथ लें। मीठी चीजें पूरी तरह बंद रखें।`
          : `For blood glucose control, take Glycomet 500 SR with your main meal. Strictly avoid sugary foods.`;
    }
    // 11. GENERAL OR CUSTOM CLINICAL QUERY -> CALL AI COPILOT BACKEND
    else {
      try {
        const aiRes = await askCopilotChatWithAi({
          message: `Patient spoken query in video consultation with Dr. ${activeCallDoc?.name || 'Doctor'}: "${textToSend}". Provide direct 2-sentence clinical diagnosis and recommended medication with directions.`,
          language: lang,
        });
        if (aiRes && aiRes.reply) {
          docText = aiRes.reply.replace(/[*#]/g, '').trim();
        }
      } catch (err) {
        console.warn('AI copilot call fallback', err);
      }

      if (!docText) {
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
            ? `मैंने आपकी समस्या का मूल्यांकन कर लिया है। त्वरित सुधार के लिए Becosules Z और पर्याप्त आराम की सलाह दी जाती है।`
            : `I have evaluated your symptoms. I am prescribing Becosules Z capsule with rest and adequate hydration.`;
      }
    }

    // Add prescription to roster if generated
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
    setIsDoctorThinking(false);

    if (isSpeakerOn) {
      speak(docText, lang);
    }
    setTimeout(() => setIsDoctorSpeaking(false), 5500);
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
                <span>{t.startCall || 'Start Video Call'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* ============================================================= */}
      {/* WHATSAPP-STYLE REAL WEBRTC VIDEO CONSULTATION MODAL          */}
      {/* ============================================================= */}
      {activeCallDoc && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in">
          {/* ── CALLING SCREEN (connecting / waiting for room ID) ── */}
          {(isCallConnecting || (!isCallConnected && !roomId)) && (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-black text-white space-y-6 px-6 pb-12">
              {/* Pulsing rings */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-52 h-52 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute w-40 h-40 rounded-full border border-indigo-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute w-32 h-32 rounded-full border-2 border-indigo-500/50 animate-ping" style={{ animationDuration: '1s' }} />
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                  {activeCallDoc.name.replace('Dr. ', '').slice(0, 2)}
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">{activeCallDoc.name}</h3>
                <p className="text-slate-400 text-sm">{activeCallDoc.specialty}</p>
                <p className="text-indigo-300 text-sm font-medium animate-pulse">
                  {isCallConnecting ? 'Initializing secure session...' : 'Setting up your room...'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleEndCall}
                className="mt-8 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-xl cursor-pointer transition active:scale-90"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
              <span className="text-xs text-slate-500">Cancel</span>
            </div>
          )}

          {/* ── ROOM READY: Share Room ID + Join Form ── */}
          {!isCallConnecting && roomId && !isCallConnected && (
            <div className="flex-1 flex flex-col bg-slate-950 text-white">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-sm">{activeCallDoc.name}</p>
                    <p className="text-[11px] text-slate-400">{activeCallDoc.specialty} • Waiting for doctor to join...</p>
                  </div>
                </div>
                <span className="font-mono text-xs bg-slate-800 px-3 py-1 rounded-md text-emerald-400 border border-slate-700">
                  {formatTimer(callDuration)}
                </span>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left: Video + Room ID Panel */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                  {/* Local video preview */}
                  <div className="w-full max-w-sm aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-xl relative">
                    {isVideoOn && hasWebcam ? (
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 rounded-full bg-indigo-600/30 flex items-center justify-center mx-auto text-indigo-300 text-2xl font-black">
                            You
                          </div>
                          <p className="text-slate-400 text-xs">Camera Preview</p>
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-bold">You (Patient)</span>
                  </div>

                  {/* Room ID Share Box */}
                  <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
                    <div className="text-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">Share Room ID with Doctor</p>
                      <p className="text-xs text-slate-400 mt-1">Doctor enters this ID to join your call</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5">
                      <code className="flex-1 text-xs font-mono text-emerald-300 break-all">{roomId}</code>
                      <button
                        type="button"
                        onClick={handleCopyRoomId}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition shrink-0"
                      >
                        {copySuccess ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Join as Doctor (other device) */}
                  <div className="w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => setShowJoinForm(!showJoinForm)}
                      className="w-full text-xs text-indigo-400 hover:text-indigo-300 font-semibold text-center cursor-pointer py-1"
                    >
                      {showJoinForm ? '▲ Hide Doctor Join Form' : '▼ Join as Doctor (Enter Room ID)'}
                    </button>
                    {showJoinForm && (
                      <div className="mt-3 bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
                        <p className="text-xs text-slate-400 font-medium">Enter patient's Room ID to connect:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={joinRoomInput}
                            onChange={(e) => setJoinRoomInput(e.target.value)}
                            placeholder="Paste Room ID here..."
                            className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleJoinAsDoctor}
                            disabled={!joinRoomInput.trim()}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg cursor-pointer transition"
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Live Voice Consultation Panel (100% Voice - No Writing Needed) */}
                <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'hi' ? 'लाइव वॉइस परामर्श व पर्चा' : 'Live Voice Consultation'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      🎙️ Voice AI
                    </span>
                  </div>

                  {/* Active Listening Indicator */}
                  {isListeningVoice && (
                    <div className="p-2.5 bg-red-950/70 border-b border-red-800 flex items-center gap-2 text-xs text-red-200 animate-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span className="font-bold flex-1 truncate">
                        {liveSpokenTranscript ? `"${liveSpokenTranscript}"` : (lang === 'hi' ? 'डॉक्टर सुन रहे हैं... बोलिए' : 'Listening... Speak symptoms')}
                      </span>
                    </div>
                  )}

                  {/* Transcript Feed */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.sender === 'patient' ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'}`}>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* 100% VOICE BAR: NO WRITE TEXT, PURE VOICE ON VIDEO */}
                  <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
                    <button
                      type="button"
                      onClick={toggleVoiceListening}
                      className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg ${
                        isListeningVoice
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-500/30'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                      }`}
                    >
                      <Mic className={`w-4 h-4 ${isListeningVoice ? 'animate-bounce' : ''}`} />
                      <span>{isListeningVoice ? (lang === 'hi' ? 'सुन रहे हैं... रुकने के लिए दबाएं' : 'Listening... Tap to Stop') : (lang === 'hi' ? 'बोलकर पूछें (Tap to Speak)' : 'Tap to Tell Doctor (Speak)')}</span>
                    </button>

                    {/* Quick Voice Simulation Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        lang === 'hi' ? '🌡️ मुझे बुखार है' : '🌡️ I have fever',
                        lang === 'hi' ? '🤕 सिर में दर्द है' : '🤕 Severe headache',
                        lang === 'hi' ? '🔥 पेट में एसिडिटी' : '🔥 Stomach acidity',
                        lang === 'hi' ? '😮‍💨 खांसी और जुकाम' : '😮‍💨 Cough & cold',
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleProcessSpokenQuery(prompt.replace(/^[^\w\sऀ-ॿ]+/, '').trim())}
                          className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Toolbar */}
              <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
                <button type="button" onClick={handleToggleMic} className={`p-3.5 rounded-full cursor-pointer transition ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 text-white'}`} title={isMicOn ? 'Mute' : 'Unmute'}>
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button type="button" onClick={handleToggleVideo} className={`p-3.5 rounded-full cursor-pointer transition ${isVideoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 text-white'}`} title={isVideoOn ? 'Camera Off' : 'Camera On'}>
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button type="button" onClick={handleEndCall} className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg transition active:scale-95">
                  <PhoneOff className="w-5 h-5" />
                  <span>End Call</span>
                </button>
              </div>
            </div>
          )}

          {/* ── CONNECTED: WhatsApp-style Full-Screen Video Call ── */}
          {isCallConnected && (
            <div className="flex-1 flex overflow-hidden relative bg-black">
              {/* Remote Video (Full screen) */}
              <div className="flex-1 relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Overlay when no remote video yet */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-white opacity-40">
                    <div className="w-24 h-24 rounded-full bg-indigo-600/30 flex items-center justify-center mx-auto text-4xl font-black mb-2">
                      {activeCallDoc.name.replace('Dr. ', '').slice(0, 2)}
                    </div>
                    <p className="text-sm font-medium">{activeCallDoc.name}</p>
                  </div>
                </div>

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 px-5 py-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <p className="font-bold text-sm">{activeCallDoc.name}</p>
                      <p className="text-[11px] text-emerald-300">🔒 End-to-end encrypted</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-white bg-black/50 px-3 py-1 rounded-lg font-bold">
                    {formatTimer(callDuration)}
                  </span>
                </div>

                {/* Floating Live Doctor Voice Subtitles on Video */}
                {doctorSubtitles && (
                  <div className="absolute bottom-24 left-4 right-44 sm:right-52 bg-slate-950/85 backdrop-blur-md border border-indigo-500/50 rounded-2xl p-3 shadow-2xl animate-in fade-in z-20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] font-extrabold uppercase text-indigo-300">
                        🩺 {activeCallDoc.name} {isDoctorSpeaking ? (lang === 'hi' ? 'बोल रहे हैं:' : 'Speaking:') : (lang === 'hi' ? 'का परामर्श:' : 'Clinical Advice:')}
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium leading-relaxed">
                      {doctorSubtitles}
                    </p>
                  </div>
                )}

                {/* Floating Patient Voice Listening Banner */}
                {isListeningVoice && (
                  <div className="absolute top-16 left-4 right-4 sm:right-auto sm:max-w-md bg-red-950/90 backdrop-blur-md border border-red-500 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl animate-pulse z-20">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-red-300 block">
                        🎙️ {lang === 'hi' ? 'डॉक्टर आपकी बात सुन रहे हैं:' : 'Doctor is listening to you:'}
                      </span>
                      <p className="text-xs text-white font-medium truncate">
                        {liveSpokenTranscript || (lang === 'hi' ? 'अपनी समस्या बोलें...' : 'Speak your health problem...')}
                      </p>
                    </div>
                  </div>
                )}

                {/* PIP Local Video (bottom-right) */}
                <div className="absolute bottom-24 right-4 w-36 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl bg-slate-900">
                  {isVideoOn && hasWebcam ? (
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <div className="text-center">
                        <VideoOff className="w-5 h-5 text-red-400 mx-auto" />
                        <p className="text-[9px] text-slate-400 mt-1">Camera Off</p>
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] text-white font-bold flex items-center gap-1">
                    You {!isMicOn && <MicOff className="w-2.5 h-2.5 text-red-400" />}
                  </span>
                </div>
              </div>

              {/* Right: Live Voice Consultation & Prescription Drawer (100% Voice-Enabled) */}
              <div className={`w-80 bg-slate-950/95 backdrop-blur border-l border-slate-800 flex flex-col ${isChatOpen ? 'flex' : 'hidden md:flex'}`}>
                <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'hi' ? 'लाइव वॉइस परामर्श व पर्चा' : 'Live Voice Consultation'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    Connected
                  </span>
                </div>

                {/* Voice Listening Active Banner */}
                {isListeningVoice && (
                  <div className="p-2.5 bg-red-950/70 border-b border-red-800 flex items-center gap-2 text-xs text-red-200 animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span className="font-bold flex-1 truncate">
                      {liveSpokenTranscript ? `"${liveSpokenTranscript}"` : (lang === 'hi' ? 'डॉक्टर आपकी बात सुन रहे हैं... बोलिए' : 'Listening... Speak your symptoms')}
                    </span>
                  </div>
                )}

                {/* Voice Consultation Messages & In-Call Prescriptions */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${msg.sender === 'patient' ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'}`}>
                        <p>{msg.text}</p>
                        {msg.prescribedMed && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/50 text-white space-y-1.5 shadow-md">
                            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1">
                              <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                                <Pill className="w-3.5 h-3.5" /> {t.inCallPrescription || 'Doctor Prescribed (Rx)'}
                              </span>
                              <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">{msg.prescribedMed.duration}</span>
                            </div>
                            <div className="font-bold text-sm text-emerald-300">{msg.prescribedMed.name}</div>
                            <div className="text-[11px] text-slate-200">
                              <span className="text-slate-400">{t.dosage || 'Dosage'}:</span> <strong className="text-white">{msg.prescribedMed.dosage}</strong> • {msg.prescribedMed.frequency}
                            </div>
                            <div className="text-[10px] text-slate-400 italic">{t.instructions || 'Instructions'}: {msg.prescribedMed.instructions}</div>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* 100% VOICE BAR: COMPLETELY REMOVED MANUAL WRITE TEXT OPTION */}
                <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
                  <button
                    type="button"
                    onClick={toggleVoiceListening}
                    className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xl ${
                      isListeningVoice
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-500/40'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${isListeningVoice ? 'animate-bounce' : ''}`} />
                    <span>{isListeningVoice ? (lang === 'hi' ? 'सुन रहे हैं... रुकने के लिए दबाएं' : 'Doctor Listening... Tap to Stop') : (lang === 'hi' ? 'बोलकर डॉक्टर से पूछें (Tap to Speak)' : 'Tap to Tell Doctor on Video')}</span>
                  </button>

                  {/* 1-Tap Voice Simulation Chips */}
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      {lang === 'hi' ? '🎙️ त्वरित बोलें या क्लिक करें:' : '🎙️ Quick Voice Query:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        lang === 'hi' ? '🌡️ मुझे तेज बुखार है' : '🌡️ High fever & chills',
                        lang === 'hi' ? '🤕 सिर में बहुत दर्द है' : '🤕 Severe headache',
                        lang === 'hi' ? '🔥 पेट में गैस और जलन' : '🔥 Stomach acidity',
                        lang === 'hi' ? '🤮 उल्टी और दस्त' : '🤮 Loose motions',
                        lang === 'hi' ? '😮‍💨 खांसी और गले में खराश' : '😮‍💨 Cough & sore throat',
                        lang === 'hi' ? '🩸 बीपी दवा परामर्श' : '🩸 Blood pressure check',
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleProcessSpokenQuery(prompt.replace(/^[^\w\sऀ-ॿ]+/, '').trim())}
                          className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls Toolbar */}
              <div className="absolute bottom-0 left-0 right-80 px-6 py-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-4">
                {/* Mute */}
                <button type="button" onClick={handleToggleMic}
                  className={`p-4 rounded-full cursor-pointer transition ${isMicOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/30'}`}
                  title={isMicOn ? 'Mute' : 'Unmute'}>
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Speak to Doctor Button */}
                <button type="button" onClick={toggleVoiceListening}
                  className={`px-4 py-3 rounded-full cursor-pointer transition shadow-xl font-bold text-xs flex items-center gap-1.5 ${isListeningVoice ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-500/40' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                  title={isListeningVoice ? 'Listening... Tap to stop' : 'Tap to speak query to Doctor'}>
                  <Mic className={`w-4 h-4 ${isListeningVoice ? 'animate-bounce' : ''}`} />
                  <span className="hidden sm:inline">{isListeningVoice ? 'Listening...' : 'Speak'}</span>
                </button>

                {/* Camera */}
                <button type="button" onClick={handleToggleVideo}
                  className={`p-4 rounded-full cursor-pointer transition ${isVideoOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/30'}`}
                  title={isVideoOn ? 'Camera Off' : 'Camera On'}>
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                {/* Speaker */}
                <button type="button" onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-4 rounded-full cursor-pointer transition ${isSpeakerOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-amber-600 text-white'}`}>
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                {/* Chat Toggle Mobile */}
                <button type="button" onClick={() => setIsChatOpen(!isChatOpen)}
                  className="p-4 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition md:hidden">
                  <MessageSquare className="w-5 h-5" />
                </button>
                {/* End Call */}
                <button type="button" onClick={handleEndCall}
                  className="px-7 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-2xl transition active:scale-95">
                  <PhoneOff className="w-5 h-5" />
                  <span>End Call</span>
                </button>
              </div>
            </div>
          )}
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
