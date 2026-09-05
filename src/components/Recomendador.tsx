import React, { useState } from 'react';
import { getMatchScore, calculateTotalPrice } from '@/lib/utils';
import type { Paquete, RecomendadorAnswers } from '@/types';
import paquetesData from '@/data/paquetes.json';
 
interface Match {
  paquete: Paquete;
  score: number;
}
 
const Icon = ({ children, size = 32 }: { children: React.ReactNode; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
 
const icons = {
  bolt: <Icon><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></Icon>,
  run: <Icon><circle cx="12" cy="4" r="1.5" /><path d="M9 8l-2 4h5l-1 4" /><path d="M12 8l3 2 2-3" /></Icon>,
  plane: <Icon><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 2s-4 0-5.5 1.5L10 7 1.8 5.2l-1 1 7 4-1.5 1.5-4-1-1 1 5.5 3.5 3.5 5.5 1-1-1-4 1.5-1.5 4 7 1-1z" /></Icon>,
  mountain: <Icon><path d="M8 3L2 21h20L14 3z" /><path d="M12 8l-2 5h4z" /></Icon>,
  adventure: <Icon><path d="M12 2L2 19h20z" /><path d="M12 6v8" /><path d="M9 14h6" /></Icon>,
  family: <Icon><circle cx="9" cy="5" r="2" /><circle cx="15" cy="5" r="2" /><path d="M6 21v-4a3 3 0 0 1 6 0v4" /><path d="M12 21v-4a3 3 0 0 1 6 0v4" /></Icon>,
  wallet: <Icon><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" /><path d="M2 10h20" /></Icon>,
  card: <Icon><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 15h4" /></Icon>,
  diamond: <Icon><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /></Icon>,
  sun: <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></Icon>,
  snowflake: <Icon><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5l-5 5-5-5" /><path d="M7 19l5-5 5 5" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M19 7l-5 5 5 5" /><path d="M5 17l5-5-5-5" /></Icon>,
  flower: <Icon><circle cx="12" cy="12" r="2" /><path d="M12 2a3 3 0 0 1 3 3c0 1.5-1.5 2.5-3 3-1.5-.5-3-1.5-3-3a3 3 0 0 1 3-3z" /><path d="M12 22a3 3 0 0 1-3-3c0-1.5 1.5-2.5 3-3 1.5.5 3 1.5 3 3a3 3 0 0 1-3 3z" /><path d="M2 12a3 3 0 0 1 3-3c1.5 0 2.5 1.5 3 3-.5 1.5-1.5 3-3 3a3 3 0 0 1-3-3z" /><path d="M22 12a3 3 0 0 1-3 3c-1.5 0-2.5-1.5-3-3 .5-1.5 1.5-3 3-3a3 3 0 0 1 3 3z" /></Icon>,
  leaf: <Icon><path d="M17 8C8 10 5.9 16.17 3.82 19.34C3 20.5 3 22 3 22s9-1 14-9c.5-.85.86-1.76 1-2.67" /><path d="M21 3c-3 0-7 2-9 6 2-1 5-1 7 1" /></Icon>,
  person: <Icon><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></Icon>,
  couple: <Icon><circle cx="8" cy="6" r="3" /><circle cx="16" cy="6" r="3" /><path d="M3 21v-2a5 5 0 0 1 10 0v2" /><path d="M13 21v-2a5 5 0 0 1 10 0v2" /></Icon>,
  friends: <Icon><circle cx="9" cy="6" r="3" /><circle cx="15" cy="6" r="3" /><path d="M3 21v-1a6 6 0 0 1 12 0v1" /><path d="M15 21v-1a6 6 0 0 1 6-6" /></Icon>,
  star: <Icon size={18}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Icon>,
  calendar: <Icon size={14}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>,
  money: <Icon size={14}><circle cx="12" cy="12" r="10" /><path d="M12 6v2m0 8v2m-4-6h8" /></Icon>,
  sparkle: <Icon size={28}><path d="M12 2l2.5 7.5H22l-6.5 4.5 2.5 7.5L12 17l-6 4.5 2.5-7.5L2 9.5h7.5z" /></Icon>,
  refresh: <Icon size={16}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></Icon>,
  arrow: <Icon size={16}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>,
};
 
const S = {
  optionBtn: {
    padding: '24px 16px',
    border: '2px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  label: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#ffffff',
  },
  sublabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  cardResult: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderLeft: '4px solid #f97316',
    borderRadius: '10px',
    padding: '24px',
    marginBottom: '16px',
  },
  badge: {
    fontSize: '0.75rem',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.75)',
    padding: '4px 12px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  badgeOrange: {
    fontSize: '0.75rem',
    background: 'rgba(249,115,22,0.15)',
    color: '#fb923c',
    padding: '4px 12px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
};
 
export default function Recomendador() {
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<RecomendadorAnswers>({
    duracion: null,
    tipo: null,
    presupuesto: null,
    epoca: null,
    compania: null,
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
 
  const paquetes = paquetesData.paquetes;
 
  const handleDuracionChange = (value: string) => { setAnswers({ ...answers, duracion: value as any }); setStep(1); };
  const handleTipoChange = (value: string) => { setAnswers({ ...answers, tipo: value }); setStep(2); };
  const handlePresupuestoChange = (value: string) => { setAnswers({ ...answers, presupuesto: value as any }); setStep(3); };
  const handleEpocaChange = (value: string) => { setAnswers({ ...answers, epoca: value }); setStep(4); };
  const handleCompaniaChange = (value: string) => { setAnswers({ ...answers, compania: value }); calculateMatches(); };
 
  const calculateMatches = () => {
    const scored = paquetes.map((paquete) => ({ paquete, score: getMatchScore(paquete, answers) }));
    const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    setMatches(sorted);
    setStep(5);
  };
 
  const resetRecomendador = () => {
    setStep(0);
    setAnswers({ duracion: null, tipo: null, presupuesto: null, epoca: null, compania: null });
    setMatches([]);
  };
 
  const OptionBtn = ({ value, label, sublabel, icon, onClick }: { value: string; label: string; sublabel?: string; icon: React.ReactNode; onClick: () => void }) => {
    const isHovered = hoveredBtn === value;
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHoveredBtn(value)}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          ...S.optionBtn,
          border: isHovered ? '2px solid #f97316' : '2px solid rgba(255,255,255,0.15)',
          background: isHovered ? 'rgba(249,115,22,0.08)' : 'transparent',
          color: isHovered ? '#f97316' : 'rgba(255,255,255,0.8)',
        }}
      >
        {icon}
        <span style={S.label}>{label}</span>
        {sublabel && <span style={S.sublabel}>{sublabel}</span>}
      </button>
    );
  };
 
  return (
    <div className="w-full max-w-2xl mx-auto">
 
      {step === 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">¿Cuánto tiempo tienes?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'corta', label: '1-2 días', icon: icons.bolt },
              { value: 'media', label: '3-4 días', icon: icons.run },
              { value: 'larga', label: '5+ días', icon: icons.plane },
            ].map((o) => <OptionBtn key={o.value} value={o.value} label={o.label} icon={o.icon} onClick={() => handleDuracionChange(o.value)} />)}
          </div>
        </div>
      )}
 
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">¿Qué tipo de viaje te atrae?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'naturaleza', label: 'Naturaleza', icon: icons.mountain },
              { value: 'aventura', label: 'Aventura', icon: icons.adventure },
              { value: 'familia', label: 'Familia', icon: icons.family },
            ].map((o) => <OptionBtn key={o.value} value={o.value} label={o.label} icon={o.icon} onClick={() => handleTipoChange(o.value)} />)}
          </div>
        </div>
      )}
 
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">¿Cuál es tu presupuesto?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'bajo', label: 'Bajo', sublabel: '$25-100k', icon: icons.wallet },
              { value: 'medio', label: 'Medio', sublabel: '$100-250k', icon: icons.card },
              { value: 'alto', label: 'Alto', sublabel: '$250k+', icon: icons.diamond },
            ].map((o) => <OptionBtn key={o.value} value={o.value} label={o.label} sublabel={o.sublabel} icon={o.icon} onClick={() => handlePresupuestoChange(o.value)} />)}
          </div>
        </div>
      )}
 
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">¿Cuándo te gustaría viajar?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'verano', label: 'Verano', icon: icons.sun },
              { value: 'invierno', label: 'Invierno', icon: icons.snowflake },
              { value: 'primavera', label: 'Primavera', icon: icons.flower },
              { value: 'otono', label: 'Otoño', icon: icons.leaf },
            ].map((o) => <OptionBtn key={o.value} value={o.value} label={o.label} icon={o.icon} onClick={() => handleEpocaChange(o.value)} />)}
          </div>
        </div>
      )}
 
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">¿Con quién viajarías?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'solo', label: 'Solo/a', icon: icons.person },
              { value: 'pareja', label: 'Pareja', icon: icons.couple },
              { value: 'amigos', label: 'Amigos', icon: icons.friends },
              { value: 'familia', label: 'Familia', icon: icons.family },
            ].map((o) => <OptionBtn key={o.value} value={o.value} label={o.label} icon={o.icon} onClick={() => handleCompaniaChange(o.value)} />)}
          </div>
        </div>
      )}
 
      {step === 5 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-6" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f97316' }}>{icons.sparkle}</span>
            Tu viaje perfecto
          </h3>
 
          <div style={{ marginBottom: '32px' }}>
            {matches.map((match, idx) => (
              <div key={match.paquete.id} style={S.cardResult}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#fb923c', fontWeight: 600, marginBottom: '4px' }}>
                      #{idx + 1} Coincidencia ({match.score}%)
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      {match.paquete.titulo}
                    </h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Rating</div>
                    <div style={{ fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <span style={{ color: '#fb923c' }}>{icons.star}</span>
                      {match.paquete.rating}
                    </div>
                  </div>
                </div>
 
                <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '16px', fontSize: '0.9rem' }}>
                  {match.paquete.descripcionCorta}
                </p>
 
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
                  <span style={S.badge}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{icons.calendar}</span>
                    {match.paquete.duracionDias}d/{match.paquete.duracionNoches}n
                  </span>
                  <span style={S.badgeOrange}>
                    {icons.money}
                    ${match.paquete.precioBase + match.paquete.gastosAdmin}
                  </span>
                </div>
 
                <a
                  href={`/paquetes/${match.paquete.slug}`}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  Ver detalles
                  {icons.arrow}
                </a>
              </div>
            ))}
          </div>
 
          <button
            onClick={resetRecomendador}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {icons.refresh}
            Hacer de nuevo
          </button>
        </div>
      )}
 
      {step < 5 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {[0, 1, 2, 3, 4].map((s) => (
              <div key={s} style={{
                height: '6px', flex: 1, borderRadius: '9999px',
                background: s <= step ? '#f97316' : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            Paso {step + 1} de 5
          </p>
        </div>
      )}
    </div>
  );
}