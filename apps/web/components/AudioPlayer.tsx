'use client';

import { useRadio } from '@/hooks/useRadio';

export default function AudioPlayer() {
  const { station, playing, pause, stop } = useRadio();
  if (!station) return null;

  return (
    <div className="audio-player active">
      <div className="player-info">
        <div>
          <div className="radio-name">{station.name}</div>
          <div className="radio-genre">{station.genre}</div>
        </div>
      </div>
      <div className="player-controls">
        <button className="control-btn" onClick={pause}>
          {playing ? '⏸️' : '▶️'}
        </button>
        <button className="control-btn" onClick={stop}>⏹️</button>
      </div>
    </div>
  );
}