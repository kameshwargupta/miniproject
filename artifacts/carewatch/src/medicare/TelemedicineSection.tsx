import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { INITIAL_DOCTORS, type Doctor } from './mockData';
import { type LanguageCode, TRANSLATIONS } from './translations';

export const TelemedicineSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [activeCallDoc, setActiveCallDoc] = useState<Doctor | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'doctor', text: 'Hello! How can I help you today?', time: '10:00 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Call timer simulation
  useEffect(() => {
    let interval: any = null;
    if (activeCallDoc) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCallDoc]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === 'All' || doc.specialty.includes(selectedSpecialty);
    const matchesQuery =
      doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchDoctor.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  const handleStartCall = (doc: Doctor) => {
    setActiveCallDoc(doc);
    setChatMessages([
      {
        sender: 'doctor',
        text: `Hello! I am ${doc.name}. I have reviewed your primary records. Please describe your symptoms.`,
        time: 'Just now',
      },
    ]);
  };

  const handleEndCall = () => {
    setActiveCallDoc(null);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: 'patient',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'doctor',
          text: 'Understood. Let me note this in your clinical record and advise the proper regimen.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const handleBookAppointment = (doc: Doctor) => {
    setBookedSlot(`${doc.name} (${doc.availableSlot})`);
    setTimeout(() => setBookedSlot(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            WebRTC Encrypted Virtual Clinic
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.telemedTitle}</h2>
          <p className="text-indigo-100 text-sm max-w-xl mt-1">{t.telemedSubtitle}</p>
        </div>
      </div>

      {/* Booking Toast */}
      {bookedSlot && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Appointment confirmed with {bookedSlot}. Confirmation SMS and video link sent.</span>
          </div>
          <button onClick={() => setBookedSlot(null)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Specialty Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
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
          {['All', 'Cardiologist', 'Physician', 'Pediatrician', 'Neurologist'].map((spec) => (
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
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {doc.name}
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
                <span>Available:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {doc.availableSlot}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleBookAppointment(doc)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.bookAppointment}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartCall(doc)}
                className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{t.startCall}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Video Consultation Room Modal */}
      {activeCallDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[600px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-3.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{activeCallDoc.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    {activeCallDoc.specialty} • Encrypted Session
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-xs bg-slate-700 px-2.5 py-1 rounded-md text-emerald-400 font-bold">
                  {formatTimer(callDuration)}
                </span>
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Feed & Chat Layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
              {/* Doctor Video Area (Simulated 2/3) */}
              <div className="md:col-span-2 bg-slate-950 relative flex items-center justify-center p-4">
                {/* Simulated Doctor Feed */}
                <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
                  <div className="w-24 h-24 rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 text-3xl font-bold animate-pulse">
                    {activeCallDoc.name.replace('Dr. ', '').slice(0, 2)}
                  </div>
                  <span className="text-white font-bold text-base mt-3">
                    {activeCallDoc.name}
                  </span>
                  <span className="text-xs text-indigo-300">Speaking with you...</span>

                  {/* Patient Self-View Picture-in-Picture */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col items-center justify-center text-slate-400">
                    {isVideoOn ? (
                      <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center">
                        <User className="w-8 h-8 text-slate-300" />
                        <span className="text-[10px] text-slate-300 mt-1">You</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <VideoOff className="w-6 h-6 text-red-400" />
                        <span className="text-[9px] text-red-400 mt-1">Camera Off</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* In-Call Live Chat (1/3) */}
              <div className="bg-slate-900 border-l border-slate-800 flex flex-col h-full">
                <div className="px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.chat}</span>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === 'patient' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 ${
                          msg.sender === 'patient'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-800 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type to doctor..."
                    className="flex-1 bg-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendChat}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Call Controls Toolbar */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full cursor-pointer transition ${
                  isMicOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-red-600 text-white'
                }`}
                title={isMicOn ? t.micMute : t.micUnmute}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full cursor-pointer transition ${
                  isVideoOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-red-600 text-white'
                }`}
                title={isVideoOn ? t.videoOn : t.videoOff}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>{t.endCall}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
