'use client';

import { useState } from 'react';
import { countries, Country } from '@/lib/api';
import SearchInput from './SearchInput';

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (c: Country) => void;
}

export default function CountryList({ open, setOpen, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search)
  );

  return (
    <aside className={`sidebar ${open ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">Radio Globe</div>
        <SearchInput onSearch={setSearch} />
      </div>

      <div className="countries-list">
        {filtered.map((c) => (
          <div
            key={c.code}
            className="country-item"
            onClick={() => {
              onSelect(c);
              setOpen(false);
            }}
          >
            <span className="country-flag">{c.flag}</span>
            <span className="country-name">{c.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}