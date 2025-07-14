'use client';

import { useEffect, useState } from 'react';
import { fetchStations, Country } from '@/lib/api';
import { useRadio } from '@/hooks/useRadio';

interface Props {
  open: boolean;
  country: Country | null;
  stations: any[];
  setStations: (s: any[]) => void;
  onClose: () => void;
}

export default function RadioPanel({ open, country, stations, setStations, onClose }: Props) {
  const { play } = useRadio();

  useEffect(() => {
    if (!country) return;
    fetchStations(country.code).then(setStations).catch(console.error);
  }, [country, setStations]);

  if (!country) return null;

  return (
    <aside className={`radio-panel ${open ? 'active' : ''}`}>
      <div className="radio-panel-header">
        <h2 className="radio-panel-title">Radios – {country.name}</h2>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="radio-list">
        {stations.length ? (
          stations.map((s) => (
            <div key={s.url} className="radio-item" onClick={() => play(s)}>
              <div className="radio-name">{s.name}</div>
              <div className="radio-genre">{s.genre}</div>
              <div className="text-xs text-slate-500 mt-1">
                {s.bitrate} kbps • {s.language} • ❤️ {s.votes}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500 p-10">Chargement…</p>
        )}
      </div>
    </aside>
  );
}