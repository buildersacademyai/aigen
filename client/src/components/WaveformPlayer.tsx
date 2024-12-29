import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, Volume2, VolumeX, Forward, Rewind } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);

    // Initialize WaveSurfer with enhanced options
    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(var(--primary) / 0.3)',
      progressColor: 'hsl(var(--primary))',
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 2,
      height: 60,
      barRadius: 3,
      normalize: true,
      backend: 'WebAudio',
      barMinHeight: 1,
      mediaControls: true,
      hideScrollbar: true,
    });

    // Load audio file
    waveSurfer.load(audioUrl);

    // Set up event listeners
    waveSurfer.on('ready', () => {
      setDuration(waveSurfer.getDuration());
      waveSurferRef.current = waveSurfer;
      setIsLoading(false);
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

  const handleVolumeChange = (value: number[]) => {
    if (!waveSurferRef.current) return;
    const newVolume = value[0];
    setVolume(newVolume);
    waveSurferRef.current.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!waveSurferRef.current) return;
    if (isMuted) {
      waveSurferRef.current.setVolume(volume || 1);
      setIsMuted(false);
    } else {
      waveSurferRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  const handlePlaybackRateChange = (speed: number) => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.setPlaybackRate(speed);
    setPlaybackRate(speed);
  };

  const skipForward = () => {
    if (!waveSurferRef.current) return;
    const newTime = Math.min(currentTime + 10, duration);
    waveSurferRef.current.seekTo(newTime / duration);
  };

  const skipBackward = () => {
    if (!waveSurferRef.current) return;
    const newTime = Math.max(currentTime - 10, 0);
    waveSurferRef.current.seekTo(newTime / duration);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayPause}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full hover:scale-105 transition-transform"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          ) : isPlaying ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </Button>

        {/* Time Display */}
        <div className="text-sm font-medium">
          <span>{formatTime(currentTime)}</span>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <div className="w-24">
            <Slider
              defaultValue={[1]}
              max={1}
              step={0.1}
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePlaybackRateChange(1)}
            className={cn(
              "text-xs px-2",
              playbackRate === 1 && "bg-primary text-primary-foreground"
            )}
          >
            1x
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePlaybackRateChange(1.5)}
            className={cn(
              "text-xs px-2",
              playbackRate === 1.5 && "bg-primary text-primary-foreground"
            )}
          >
            1.5x
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePlaybackRateChange(2)}
            className={cn(
              "text-xs px-2",
              playbackRate === 2 && "bg-primary text-primary-foreground"
            )}
          >
            2x
          </Button>
        </div>

        {/* Skip Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            className="w-8 h-8"
          >
            <Rewind className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            className="w-8 h-8"
          >
            <Forward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Waveform container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0.5 : 1 }}
        className="relative"
      >
        <div
          ref={containerRef}
          className={cn(
            "w-full cursor-pointer rounded-lg bg-accent/5 p-4 transition-opacity duration-200",
            isLoading && "opacity-50"
          )}
        />
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="animate-pulse text-sm text-muted-foreground">
                Loading audio...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}