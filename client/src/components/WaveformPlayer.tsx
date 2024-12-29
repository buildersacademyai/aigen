import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformPlayerProps {
  audioUrl: string;
  className?: string;
}

export function WaveformPlayer({ audioUrl, className = "" }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize WaveSurfer
    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgb(var(--primary) / 0.5)',
      progressColor: 'rgb(var(--primary))',
      cursorColor: 'rgb(var(--primary))',
      barWidth: 2,
      barGap: 1,
      height: 60,
      barRadius: 3,
      normalize: true,
      backend: 'WebAudio'
    });

    // Load audio file
    waveSurfer.load(audioUrl);

    // Set up event listeners
    waveSurfer.on('ready', () => {
      setDuration(waveSurfer.getDuration());
      waveSurferRef.current = waveSurfer;
    });

    waveSurfer.on('audioprocess', () => {
      setCurrentTime(waveSurfer.getCurrentTime());
    });

    waveSurfer.on('play', () => setIsPlaying(true));
    waveSurfer.on('pause', () => setIsPlaying(false));
    waveSurfer.on('finish', () => setIsPlaying(false));

    // Cleanup
    return () => {
      waveSurfer.destroy();
    };
  }, [audioUrl]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.playPause();
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Waveform container */}
      <div
        ref={containerRef}
        className="w-full cursor-pointer rounded-md bg-accent/5 p-2"
      />
      
      {/* Controls */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <button
          onClick={togglePlayPause}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="flex gap-2">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
