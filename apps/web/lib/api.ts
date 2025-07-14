export interface Country {
  name: string;
  flag: string;
  code: string;
  x: number;
  y: number;
}

// Same list as your HTML
export const countries: Country[] = [
  { name: 'France', flag: '🇫🇷', code: 'FR', x: 45, y: 25 },
  { name: 'États-Unis', flag: '🇺🇸', code: 'US', x: 20, y: 35 },
  /* … copy the rest … */
];

export async function fetchStations(countryCode: string) {
  const res = await fetch(
    `https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/${countryCode}?limit=30&hidebroken=true`,
    { next: { revalidate: 60 } } // ISR cache 1 minute
  );
  if (!res.ok) throw new Error('Failed to fetch stations');
  const data = await res.json();
  return data
    .filter((s: any) => s.url_resolved)
    .map((s: any) => ({
      name: s.name,
      genre: s.tags || 'Général',
      url: s.url_resolved,
      bitrate: s.bitrate || 'N/A',
      language: s.language || 'N/A',
      votes: s.votes || 0,
    }))
    .sort((a: any, b: any) => b.votes - a.votes);
}