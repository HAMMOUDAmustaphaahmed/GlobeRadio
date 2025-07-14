'use client';

import { useState } from 'react';
import { countries } from '@/lib/api';

interface Props {
  onSearch: (term: string) => void;   // remonte le mot-clé au parent
}

export default function SearchInput({ onSearch }: Props) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    onSearch(v.toLowerCase());
  };

  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Rechercher un pays..."
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}