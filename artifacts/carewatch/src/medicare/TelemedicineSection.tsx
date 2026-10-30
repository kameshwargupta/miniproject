import React, { useState } from 'react';
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
  UserCheck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { INITIAL_DOCTORS, type Doctor } from './mockData';
import { ListenButton } from './ListenButton';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

export const TelemedicineSection: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [activeCallDoc, setActiveCallDoc] = useState<Doctor | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'Connecting' | 'Connected' | 'Ended'>('Connected');
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  const { speak } = useVoice();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleStartCall = (doc: Doctor) => {
    setActiveCallDoc(doc);
    setCallStatus('Connected');
    speak(
      lang === 'hi'
        ? `?????? ${doc.name} ?? ??? ???????? ?????? ??????? ???? ?? ??? ???`
        : `Secure video consultation with ${doc.name} has started. Both audio and video are encrypted end-to-end.`,
      lang
    );
  };

  const handleBookAppointment = (doc: Doctor) => {
    setBookedSlot(`${doc.name} (${doc.availableSlot})`);
    speak(
      lang === 'hi'
        ? `?????? ${doc.name} ?? ??? ???? ?????????? ${doc.availableSlot} ?? ??? ???????? ??? ?? ?? ???`
        : `Your appointment with ${doc.name} has been booked for ${doc.availableSlot}.`,
      lang
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            WebRTC Encrypted Virtual Clinic
          </span>
          <h2 className="text-2xl font-bold mt-2">{t.navTelemedicine}</h2>
          <p className="text-indigo-100 text-sm max-w-xl mt-1">
            Book verified specialist consultations or initiate an instant encrypted video/audio call with certified doctors.
          </p>
        </div>
        <ListenButton
          text={
            lang === 'hi'
              ? '??????????? ??? ?????? ??????? ??? ???? ?????? ??? ???? ?? ???????? ???????? ?? ?????? ?????? ??? ?? ??????? ?? ???? ????'
              : 'Welcome to Telemedicine and Video Consultation. Consult certified doctors remotely via secure encrypted video calls.'
          }
          lang={lang}
          label="Listen Overview"
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        />
      </div>

      {/* Booking Success Toast */}
      {bookedSlot && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>
              Appointment confirmed with <strong>{bookedSlot}</strong>. SMS & Email confirmation sent.
            </span>
          </div>
          <button
            onClick={() => setBookedSlot(null)}
            className="text-xs font-bold text-emerald-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Video Room Simulation if Open */}
      {activeCallDoc && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border-2 border-indigo-500/50 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="font-bold text-base">
                Virtual Consultation with {activeCallDoc.name}
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              WebRTC Connected (Encrypted)
            </span>
          </div>

          {/* Video Frames Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-72">
            {/* Doctor feed */}
            <div className="relative rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-indigo-600/30 border-2 border-indigo-400 mx-auto flex items-center justify-center text-xl font-bold">
                  ?????
                </div>
                <p className="font-bold text-sm">{activeCallDoc.name}</p>
                <p className="text-xs text-indigo-300">{activeCallDoc.specialty}</p>
              </div>
              <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[11px]">
                Doctor Stream (1080p HD)
              </div>
            </div>

            {/* Patient feed */}
            <div className="relative rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
              {isVideoOn ? (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-600/30 border-2 border-emerald-400 mx-auto flex items-center justify-center text-xl font-bold">
                    ??
                  </div>
                  <p className="font-bold text-sm">You (Patient)</p>
                  <p className="text-xs text-emerald-300">Microphone: {isMicOn ? 'Active' : 'Muted'}</p>
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <VideoOff className="w-5 h-5 text-red-400" /> Camera is turned off
                </div>
              )}
              <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[11px]">
                Patient Video
              </div>
            </div>
          </div>

          {/* Media Call Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-full cursor-pointer transition-all ${
                isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 text-white'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full cursor-pointer transition-all ${
                isVideoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 text-white'
              }`}
              title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setActiveCallDoc(null)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Consultation</span>
            </button>
          </div>
        </div>
      )}

      {/* Doctors Specialist Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{doc.rating}</span>
                  <span className="text-slate-400">({doc.experience})</span>
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{doc.name}</h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {doc.specialty}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{doc.qualification}</p>
                <p className="text-[11px] text-slate-400">{doc.hospital}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Consultation</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                  {doc.consultationFee}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                Slot: <strong>{doc.availableSlot}</strong>
              </span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                Languages: {doc.languages.join(', ')}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <ListenButton
                text={`${doc.name}, specialist in ${doc.specialty}. Qualification: ${doc.qualification}. Affiliated with ${doc.hospital}. Next available consultation slot: ${doc.availableSlot}. Consultation fee is ${doc.consultationFee}.`}
                lang={lang}
                label="Listen Profile"
                size="sm"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBookAppointment(doc)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                >
                  Book Slot
                </button>
                <button
                  type="button"
                  onClick={() => handleStartCall(doc)}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Instant Call</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
