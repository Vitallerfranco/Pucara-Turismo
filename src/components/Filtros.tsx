import React, { useState, useMemo, useEffect } from 'react';
import type { Paquete } from '@/types';
import paquetesData from '@/data/paquetes.json';

interface FiltrosProps {
  onResultsChange?: (paquetes: Paquete[]) => void;
}

export default function Filtros({ onResultsChange }: FiltrosProps) {
  const allPaquetes = paquetesData.paquetes as Paquete[];

  const [filters, setFilters] = useState({
    duracion: 'todas',
    presupuesto: 'todos',
    tipo: 'todos',
  });

  const [sortBy, setSortBy] = useState('rating');

  const filteredPaquetes = useMemo(() => {
    // ... (Mantén tu lógica de filtrado exacta aquí, no cambia nada)
    let result = [...allPaquetes];

    if (filters.duracion === 'corta') {
      result = result.filter((p) => p.duracionDias <= 2);
    } else if (filters.duracion === 'media') {
      result = result.filter((p) => p.duracionDias >= 3 && p.duracionDias <= 4);
    } else if (filters.duracion === 'larga') {
      result = result.filter((p) => p.duracionDias >= 5);
    }

    if (filters.presupuesto === 'bajo') {
      result = result.filter((p) => p.precioBase + p.gastosAdmin <= 100000);
    } else if (filters.presupuesto === 'medio') {
      result = result.filter((p) => {
        const total = p.precioBase + p.gastosAdmin;
        return total > 100000 && total <= 250000;
      });
    } else if (filters.presupuesto === 'alto') {
      result = result.filter((p) => p.precioBase + p.gastosAdmin > 250000);
    }

    if (filters.tipo !== 'todos') {
      result = result.filter((p) => p.tags.includes(filters.tipo));
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'precio-asc') {
      result.sort((a, b) => (a.precioBase + a.gastosAdmin) - (b.precioBase + b.gastosAdmin));
    } else if (sortBy === 'precio-desc') {
      result.sort((a, b) => (b.precioBase + b.gastosAdmin) - (a.precioBase + a.gastosAdmin));
    } else if (sortBy === 'dias') {
      result.sort((a, b) => a.duracionDias - b.duracionDias);
    }

    onResultsChange?.(result);
    return result;
  }, [filters, sortBy]);

  // NUEVO: Emitimos un evento global con los IDs de los paquetes filtrados/ordenados
  useEffect(() => {
    const event = new CustomEvent('paquetes-filtrados', {
      detail: filteredPaquetes.map(p => p.id) 
    });
    window.dispatchEvent(event);
  }, [filteredPaquetes]);

  // ... (El resto de tu código de UI se mantiene igual)

  const sortOptions = [
    { value: 'rating',      icon: '★', label: 'Rating' },
    { value: 'precio-asc',  icon: '↓', label: 'Menor precio' },
    { value: 'precio-desc', icon: '↑', label: 'Mayor precio' },
    { value: 'dias',        icon: '◷', label: 'Más cortos' },
  ];

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    background: '#0a0a0a',
    border: '1px solid #272727',
    borderRadius: '8px',
    color: '#ccc',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: '#555',
    marginBottom: '6px',
  };

  const cardStyle: React.CSSProperties = {
    background: '#111',
    border: '1px solid #1e1e1e',
    borderRadius: '12px',
    padding: '18px 20px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#888',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    marginBottom: '14px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Filtros */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filtros
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Duración */}
          <div>
            <label style={labelStyle}>Duración</label>
            <div style={{ position: 'relative' }}>
              <select
                value={filters.duracion}
                onChange={(e) => setFilters({ ...filters, duracion: e.target.value })}
                style={selectStyle}
              >
                <option value="todas">Todas</option>
                <option value="corta">1–2 días</option>
                <option value="media">3–4 días</option>
                <option value="larga">5+ días</option>
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#555' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Presupuesto */}
          <div>
            <label style={labelStyle}>Presupuesto</label>
            <div style={{ position: 'relative' }}>
              <select
                value={filters.presupuesto}
                onChange={(e) => setFilters({ ...filters, presupuesto: e.target.value })}
                style={selectStyle}
              >
                <option value="todos">Todos</option>
                <option value="bajo">$20 – $100k</option>
                <option value="medio">$100k – $250k</option>
                <option value="alto">$250k+</option>
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#555' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label style={labelStyle}>Tipo de viaje</label>
            <div style={{ position: 'relative' }}>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                style={selectStyle}
              >
                <option value="todos">Todos</option>
                <option value="naturaleza">Naturaleza</option>
                <option value="aventura">Aventura</option>
                <option value="familia">Familia</option>
                <option value="fotografia">Fotografía</option>
                <option value="gourmet">Gourmet</option>
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#555' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ordenar */}
      <div style={cardStyle}>
        <p style={sectionTitleStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Ordenar
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {sortOptions.map((opt) => {
            const active = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: active ? '1px solid #e8622a' : '1px solid #272727',
                  background: active ? '#e8622a18' : '#0a0a0a',
                  color: active ? '#e8622a' : '#666',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.03em',
                }}
              >
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{opt.icon}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contador */}
      <div style={{
        padding: '10px 14px',
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#555',
      }}>
        Se encontraron{' '}
        <span style={{ fontWeight: 700, color: '#fff' }}>{filteredPaquetes.length}</span>{' '}
        paquetes
      </div>

      {/* Reset */}
      {(filters.duracion !== 'todas' || filters.presupuesto !== 'todos' || filters.tipo !== 'todos') && (
        <button
          onClick={() => setFilters({ duracion: 'todas', presupuesto: 'todos', tipo: 'todos' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px',
            background: 'transparent',
            border: '1px solid #272727',
            borderRadius: '8px',
            color: '#555',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a3a';
            (e.currentTarget as HTMLButtonElement).style.color = '#aaa';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#272727';
            (e.currentTarget as HTMLButtonElement).style.color = '#555';
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Limpiar filtros
        </button>
      )}

    </div>
  );
}