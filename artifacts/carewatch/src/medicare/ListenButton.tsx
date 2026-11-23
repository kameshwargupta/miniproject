import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { type LanguageCode } from './translations';
import { useVoice } from './voiceService';

interface ListenButtonProps {
  text: string;
  lang?: LanguageCode;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ListenButton: React.FC<ListenButtonProps> = ({
  text,
  lang = 'en',
  label = 'Listen',
  className = '',
  size = 'md',
}) => {
  const { speak, stop, isPlaying, currentText } = useVoice();
  const isActive = isPlaying && currentText === text;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      stop();
    } else {
      speak(text, lang);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Listen to content"
      className={`inline-flex items-center font-medium rounded-full transition-all duration-200 cursor-pointer shadow-xs border ${
        isActive
          ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
          : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
      } ${sizeClasses} ${className}`}
      title="Click to hear spoken audio in selected language"
    >
      {isActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
      <span>{isActive ? 'Stop' : label}</span>
    </button>
  );
};
