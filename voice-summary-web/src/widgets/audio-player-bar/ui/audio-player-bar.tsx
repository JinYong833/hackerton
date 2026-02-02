import { useRef, useEffect, useCallback } from 'react';
import { useAudioPlayer } from '../model';
import { PlaybackControls } from './playback-controls';
import { ProgressBar } from '@/shared/ui';
import { useKeyboardShortcut } from '@/shared/hooks';

interface AudioPlayerBarProps {
  audioUrl: string;
}

export const AudioPlayerBar = ({ audioUrl }: AudioPlayerBarProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    isMuted,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    setIsMuted,
    seekTo,
  } = useAudioPlayer();

  // Sync audio element with store
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentTime, setDuration, setIsPlaying]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sync muted state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Play/Pause sync
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        seekTo(time);
      }
    },
    [seekTo]
  );

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleSkipBack = useCallback(() => {
    handleSeek(Math.max(0, currentTime - 10));
  }, [currentTime, handleSeek]);

  const handleSkipForward = useCallback(() => {
    handleSeek(Math.min(duration, currentTime + 10));
  }, [currentTime, duration, handleSeek]);

  // Keyboard shortcuts
  useKeyboardShortcut(' ', handlePlayPause);
  useKeyboardShortcut('ArrowLeft', handleSkipBack);
  useKeyboardShortcut('ArrowRight', handleSkipForward);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress bar */}
      <div className="px-4 pt-2">
        <ProgressBar current={currentTime} total={duration} onSeek={handleSeek} />
      </div>

      {/* Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        playbackRate={playbackRate}
        isMuted={isMuted}
        onPlayPause={handlePlayPause}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onPlaybackRateChange={setPlaybackRate}
        onMuteToggle={() => setIsMuted(!isMuted)}
        currentTime={currentTime}
        duration={duration}
      />
    </div>
  );
};
