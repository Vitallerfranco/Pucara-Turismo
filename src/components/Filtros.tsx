import React, { useState, useMemo } from 'react';
import type { Paquete } from '@/types';
import paquetesData from '@/data/paquetes.json';

interface FiltrosProps {
  onResultsChange?: (paquetes: Paquete[]) => void;
}

export default function Filtros({ onResultsChange }: FiltrosProps) {
  const allPaquetes = paquetesData.paquetes;

  const [filters, setFilters] = useState({
    duracion: 'todas',
    presupuesto: 'todos',
    tipo: 'todos',
  });

  const [sortBy, setSortBy] = useState('rating');

  const filteredPaquetes = useMemo(() => {
    let result = allPaquetes;

    // Duration filter
    if (filters.duracion === 'corta') {
      result = result.filter((p) => p.duracionDias <= 2);
    } else if (filters.duracion === 'media') {
      result = result.filter((p) => p.duracionDias >= 3 && p.duracionDias <= 4);
    } else if (filters.duracion === 'larga') {
      result = result.filter((p) => p.duracionDias >= 5);
    }

    // Budget filter
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

    // Type filter
    if (filters.tipo !== 'todos') {
      result = result.filter((p) => p.tags.includes(filters.tipo));
    }

    // Sort
    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'precio-asc') {
      result = [...result].sort((a, b) => (a.precioBase + a.gastosAdmin) - (b.precioBase + b.gastosAdmin));
    } else if (sortBy === 'precio-desc') {
      result = [...result].sort((a, b) => (b.precioBase + b.gastosAdmin) - (a.precioBase + a.gastosAdmin));
    } else if (sortBy === 'dias') {
      result = [...result].sort((a, b) => a.duracionDias - b.duracionDias);
    }

    onResultsChange?.(result);
    return result;
  }, [filters, sortBy, onResultsChange]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-4">🔍 Filtrar</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold mb-2">Duración</label>
            <select
              value={filters.duracion}
              onChange={(e) =>
                setFilters({ ...filters, duracion: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="todas">Todas</option>
              <option value="corta">1-2 días</option>
              <option value="media">3-4 días</option>
              <option value="larga">5+ días</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold mb-2">Presupuesto</label>
            <select
              value={filters.presupuesto}
              onChange={(e) =>
                setFilters({ ...filters, presupuesto: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="todos">Todos</option>
              <option value="bajo">$20-100k</option>
              <option value="medio">$100-250k</option>
              <option value="alto">$250k+</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo</label>
            <select
              value={filters.tipo}
              onChange={(e) =>
                setFilters({ ...filters, tipo: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="todos">Todos</option>
              <option value="naturaleza">Naturaleza</option>
              <option value="aventura">Aventura</option>
              <option value="familia">Familia</option>
              <option value="fotografia">Fotografía</option>
              <option value="gourmet">Gourmet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-4">⬆️ Ordenar por</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: 'rating', label: '⭐ Rating' },
            { value: 'precio-asc', label: '💰 Menor precio' },
            { value: 'precio-desc', label: '💎 Mayor precio' },
            { value: 'dias', label: '📅 Más cortos' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-3 py-2 rounded-lg font-sm transition-all ${
                sortBy === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-600">
        Se encontraron <span className="font-bold text-slate-900">{filteredPaquetes.length}</span> paquetes
      </div>
    </div>
  );
}
