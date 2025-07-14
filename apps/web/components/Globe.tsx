'use client';

import { countries } from '@/lib/api';
import { Country } from '@/lib/api';

interface Props {
  onSelect: (c: Country) => void;
}

export default function Globe({ onSelect }: Props) {
  return (
    <div className="globe-container">
      <div className="globe" id="globe">
        <div className="globe-overlay" />
        {countries.map((c) => (
          <div
            key={c.code}
            className="country-dot"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            title={c.name}
            onClick={() => onSelect(c)}
          />
        ))}
      </div>
      <div className="text-center absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-slate-500">
        🌍 Cliquez sur un pays pour découvrir ses radios
        <br />
        <span className="text-xs">Propulsé par Radio-Browser.info</span>
      </div>
    </div>
  );
}