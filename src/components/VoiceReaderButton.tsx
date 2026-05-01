import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useVoiceReader } from '../hooks/useVoiceReader';
import { useStore } from '../store/useStore';

interface VoiceReaderButtonProps {
  text: string;
  className?: string;
}

export default function VoiceReaderButton({ text, className = '' }: VoiceReaderButtonProps) {
  const { settings } = useStore();
  const { read, pause, resume, stop, isReading, isPaused } = useVoiceReader({
    rate: settings.voiceSpeed,
  });

  if (!settings.voiceEnabled || !text.trim()) {
    return null;
  }

  const handleClick = () => {
    if (isReading) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      read(text);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        aria-label={isReading ? (isPaused ? 'Resume reading' : 'Pause reading') : 'Read aloud'}
      >
        {isReading ? (
          isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            Read
          </>
        )}
      </button>
      {isReading && (
        <button
          onClick={stop}
          className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:underline"
          aria-label="Stop reading"
        >
          <VolumeX className="w-4 h-4" />
          Stop
        </button>
      )}
    </div>
  );
}

