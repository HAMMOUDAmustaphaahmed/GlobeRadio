'use client';

import { useState, useRef, useEffect } from 'react';

export function useRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [station, setStation] = useState<any>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => audioRef.current?.pause();
  }, []);

  const play = (s: any) => {
    if (audioRef.current) {
      audioRef.current.src = s.url;
      audioRef.current.play().then(() => {
        setStation(s);
        setPlaying(true);
      });
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const stop = () => {
    pause();
    setStation(null);
  };

  return { station, playing, play, pause, stop };
}