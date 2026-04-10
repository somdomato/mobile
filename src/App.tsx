import { useState, useRef } from "react";
import "./App.css";

interface Station {
  id: number;
  name: string;
  genre: string;
  url: string;
  country: string;
}

const STATIONS: Station[] = [
  { id: 1,  name: "Groove Salad",    genre: "Ambient · Electronic",   url: "https://ice1.somafm.com/groovesalad-256-mp3",      country: "US" },
];

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M4 3.2v11.6L14.5 9 4 3.2z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <rect x="3.5" y="2.5" width="4" height="13" rx="1.5" />
      <rect x="10.5" y="2.5" width="4" height="13" rx="1.5" />
    </svg>
  );
}

function IconVolume({ level }: { level: number }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {level > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
      {level > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
    </svg>
  );
}

function Equalizer() {
  return (
    <div className="equalizer">
      <span /><span /><span />
    </div>
  );
}

export default function App() {
  const [current, setCurrent] = useState<Station | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  function selectStation(station: Station) {
    const audio = audioRef.current;
    if (!audio) return;

    if (current?.id === station.id) {
      if (playing) {
        audio.pause();
      } else {
        setLoading(true);
        audio.play().catch(() => setLoading(false));
      }
      return;
    }

    setCurrent(station);
    setPlaying(false);
    setLoading(true);
    audio.src = station.url;
    audio.volume = volume;
    audio.load();
    audio.play().catch(() => setLoading(false));
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (playing) {
      audio.pause();
    } else {
      setLoading(true);
      audio.play().catch(() => setLoading(false));
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const statusLabel = loading ? "Conectando…" : playing ? "Ao vivo" : "Parado";

  return (
    <div className="app">
      <audio
        ref={audioRef}
        onPlaying={() => { setPlaying(true); setLoading(false); }}
        onWaiting={() => setLoading(true)}
        onPause={() => { setPlaying(false); setLoading(false); }}
        onError={() => { setPlaying(false); setLoading(false); }}
      />

      <header className="header">
        <img src="/logo.svg" className="logo" alt="Som do Mato" />
        <div className="header-status">
          <div className={`live-dot${playing ? " on" : ""}`} />
          <span className={`status-badge${playing ? " live" : ""}`}>{statusLabel}</span>
        </div>
      </header>

      <div className="list-header">Estações</div>

      <ul className="station-list">
        {STATIONS.map((s) => {
          const active = current?.id === s.id;
          return (
            <li
              key={s.id}
              className={`station-row${active ? " active" : ""}`}
              onClick={() => selectStation(s)}
            >
              <span className="country-badge">{s.country}</span>
              <div className="station-text">
                <span className="station-name">{s.name}</span>
                <span className="station-genre">{s.genre}</span>
              </div>
              {active && playing && <Equalizer />}
              {active && loading && <div className="mini-spinner" />}
            </li>
          );
        })}
      </ul>

      <div className="player-bar">
        <button
          className="play-btn"
          onClick={togglePlay}
          disabled={!current}
          aria-label={playing ? "Pausar" : "Tocar"}
        >
          {loading ? <div className="btn-spinner" /> : playing ? <IconPause /> : <IconPlay />}
        </button>

        <div className="now-playing">
          <span className="np-label">Tocando agora</span>
          <span className="np-name">{current?.name ?? "—"}</span>
          <span className="np-genre">{current?.genre ?? "Selecione uma estação"}</span>
        </div>

        <div className="volume-wrap">
          <span className="vol-icon">
            <IconVolume level={volume} />
          </span>
          <input
            type="range"
            className="volume-slider"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
