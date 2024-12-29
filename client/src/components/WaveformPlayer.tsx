import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";

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
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Audio Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlayPause}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          {isPlaying ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </Button>
        <div className="text-sm">
          <span className="font-medium">{formatTime(currentTime)}</span>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Waveform container */}
      <div
        ref={containerRef}
        className="w-full cursor-pointer rounded-lg bg-accent/5 p-4"
      />
    </div>
  );
}