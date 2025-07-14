'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

const RADIO_API = 'https://de1.api.radio-browser.info/json';

interface Country {
  name: string;
  iso_3166_1: string;
  stationcount: number;
  flag: string;
}

interface Station {
  stationuuid: string;
  name: string;
  url_resolved: string;
  genre?: string;
  bitrate: number;
  language?: string;
}

/* ---------- 3-D GLOBE ---------- */
function Globe() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => (ref.current.rotation.y += 0.002));
  return (
    <>
      <Stars radius={300} depth={60} count={8000} factor={7} saturation={0} fade />
      <Sphere ref={ref} args={[1.5, 64, 64]}>
        <meshStandardMaterial
          color="#00ffff"
          metalness={0.9}
          roughness={0.1}
          emissive="#00ffff"
          emissiveIntensity={0.4}
        />
      </Sphere>
      <pointLight position={[0, 0, 4]} intensity={1.5} color="#00ffff" />
    </>
  );
}

/* ---------- FONCTION D'EMOJI DRAPEAU ---------- */
function getFlagEmoji(countryCode: string) {
  if (!countryCode) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/* ---------- HEADPHONE ANIMATION ---------- */
function HeadphoneAnimation({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className={`absolute bottom-8 right-8 z-50 transition-all ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-24 h-24">
        <div className={`absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full animate-ping ${isPlaying ? 'opacity-30' : 'opacity-0'}`}></div>
        <div className="absolute inset-2 flex items-center justify-center">
          <div className={`text-5xl ${isPlaying ? 'animate-bounce' : ''}`}>🎧</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- LOADING SPINNER ---------- */
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-12 h-12 border-t-4 border-cyan-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
}

/* ---------- ERROR MESSAGE ---------- */
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
      <div className="text-2xl mb-2">⚠️</div>
      <p className="text-red-300">{message}</p>
    </div>
  );
}

/* ---------- MAIN PAGE ---------- */
export default function RadioGlobePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Country | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const PAGE_SIZE = 10;

  /* Nouveau fetch des pays */
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch('https://de1.api.radio-browser.info/json/countries')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        const data: Country[] = await r.json();
        
        if (!data || data.length === 0) throw new Error('No countries found');
        
        const countriesWithFlags = data.map(c => ({
          ...c,
          flag: getFlagEmoji(c.iso_3166_1)
        }));
        
        setCountries(countriesWithFlags);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load countries');
      })
      .finally(() => setLoading(false));
  }, []);

  /* stations pour le pays sélectionné */
  const fetchStations = async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `${RADIO_API}/stations/bycountrycodeexact/${code}?limit=50&hidebroken=true`
      );
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data: Station[] = await res.json();
      return data.filter((s) => s.url_resolved);
    } catch (err) {
      console.error('Station fetch error:', err);
      setError('Failed to load stations. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const playStation = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    const audio = new Audio(url);
    audio.volume = 0.5;
    
    audio.play()
      .then(() => {
        setIsPlaying(true);
        audioRef.current = audio;
      })
      .catch(err => {
        console.error('Playback failed:', err);
        setError('Failed to play station. The stream might be unavailable.');
      });
    
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      setError('Stream error. Please try another station.');
    };
  };

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination
  const paginatedCountries = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginatedCountries.length < filtered.length;

  return (
    <div className="relative w-full h-screen overflow-hidden text-slate-200">
      <style jsx>{`
        .country-list {
          scrollbar-width: thin;
          scrollbar-color: #00ffff #0f172a;
        }
        .country-list::-webkit-scrollbar {
          width: 6px;
        }
        .country-list::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .country-list::-webkit-scrollbar-thumb {
          background-color: #00ffff;
          border-radius: 10px;
        }
      `}</style>
      
      {/* Animated headphones when playing */}
      <HeadphoneAnimation isPlaying={isPlaying} />
      
      {/* animated star-field */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-purple-950" />
        <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <Globe />
        </Canvas>
      </div>

      {/* drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 md:w-80 bg-slate-900/80 backdrop-blur-xl border-r border-cyan-400/30 z-30 transition-transform duration-300
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl shadow-cyan-500/20`}
      >
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <span className="animate-pulse">🌍</span> Radio Globe
          </h2>
          <button 
            onClick={() => setDrawerOpen(false)} 
            className="md:hidden text-cyan-300 hover:text-cyan-100 transition"
          >
            ✕
          </button>
        </div>

        {/* search */}
        <div className="p-4 border-b border-cyan-400/20">
          <input
            type="text"
            placeholder="Search country..."
            className="w-full px-4 py-3 bg-slate-800/70 rounded-xl placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-cyan-400/30 transition-all"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* country list */}
        <div className="h-[calc(100%-130px)] flex flex-col">
          <ul className="country-list overflow-y-auto px-4 py-2 flex-grow">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              paginatedCountries.map((c) => (
                <li key={c.iso_3166_1} className="mb-3">
                  <button
                    onClick={async () => {
                      setSelected(c);
                      setDrawerOpen(false);
                      const st = await fetchStations(c.iso_3166_1);
                      setStations(st);
                    }}
                    className="flex w-full items-center gap-4 p-3 rounded-xl hover:bg-cyan-500/20 transition-all border border-cyan-400/10 hover:border-cyan-400/30 backdrop-blur-sm"
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-sm font-medium truncate flex-grow text-left">{c.name}</span>
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                      {c.stationcount} stations
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          
          {hasMore && !loading && !error && (
            <div className="p-4 border-t border-cyan-400/20">
              <button
                onClick={() => setPage(page + 1)}
                className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg text-cyan-300 transition-all"
              >
                Load More
              </button>
            </div>
          )}
        </div>
        <style >{`
  .country-list {
    scrollbar-width: thin;
    scrollbar-color: #00faff #d8d8e0ff;
  }

  .country-list::-webkit-scrollbar {
    width: 8px;
  }

  .country-list::-webkit-scrollbar-track {
    background: #0d0d1a;
    border-radius: 8px;
  }

  .country-list::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #00faff, #8a2be2);
    border-radius: 8px;
    border: 2px solid #0d0d1a;
  }

  .country-list li {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    backdrop-filter: blur(6px);
    transform-style: preserve-3d;
  }

  .country-list button {
    background: rgba(202, 212, 235, 0.6);
    border: 1px solid rgba(0, 255, 255, 0.2);
    transition: all 0.3s ease;
    box-shadow: 0 0 12px rgba(0, 255, 255, 0.08);
    backdrop-filter: blur(4px);
  }

  .country-list button:hover {
    background: radial-gradient(circle at top left, rgba(0, 255, 255, 0.25), rgba(139, 92, 246, 0.15));
    transform: translateY(-2px) scale(1.02);
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow: 0 0 24px rgba(0, 255, 255, 0.3);
  }

  .country-list li::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 180deg at 50% 50%, #00faff, transparent, #8a2be2, transparent, #00faff);
    animation: spinGlow 6s linear infinite;
    opacity: 0.05;
    z-index: 0;
    pointer-events: none;
  }

  @keyframes spinGlow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`}</style>

      </aside>

      {/* main */}
      <main className="relative z-10 flex flex-col items-center justify-center h-full p-4">
        <header className="w-full max-w-4xl mb-6 flex items-center justify-between">
          <button 
            onClick={() => setDrawerOpen(true)} 
            className="md:hidden p-3 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-xl transition-all"
          >
            ☰
          </button>
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-lg">
            Radio Globe
          </h1>
          <div className="w-8"></div>
        </header>

        {/* floating info card */}
        <div className="mt-8 p-6 bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-cyan-400/30 max-w-md text-center">
          
        </div>

        {/* station list modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-slate-900/90 border border-cyan-400/50 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl shadow-cyan-500/10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">
                  {selected.flag} {selected.name}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorMessage message={error} />
              ) : stations.length ? (
                <div className="space-y-3">
                  {stations.map((s) => (
                    <button
                      key={s.stationuuid}
                      onClick={() => playStation(s.url_resolved)}
                      className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 hover:from-cyan-500/20 hover:to-cyan-600/20 transition-all border border-slate-700 hover:border-cyan-400/30 backdrop-blur-sm"
                    >
                      <div className="font-semibold truncate">{s.name}</div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2">
                        {s.language && <span>🗣️ {s.language}</span>}
                        {s.bitrate > 0 && <span>💿 {s.bitrate} kbps</span>}
                        {s.genre && <span>🎵 {s.genre}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-4">📻</div>
                  <h4 className="text-xl font-medium mb-2">No Stations Found</h4>
                  <p className="text-slate-400">
                    This country doesn't have any available radio stations
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setSelected(null)}
                className="w-full mt-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* hidden audio element */}
        <audio ref={audioRef} />
      </main>
    </div>
  );
}