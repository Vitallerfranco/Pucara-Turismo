import React, { useState } from 'react';
import { getMatchScore, calculateTotalPrice } from '@/lib/utils';
import type { Paquete, RecomendadorAnswers } from '@/types';
import paquetesData from '@/data/paquetes.json';

interface Match {
  paquete: Paquete;
  score: number;
}

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

  const paquetes = paquetesData.paquetes;

  const handleDuracionChange = (value: string) => {
    setAnswers({ ...answers, duracion: value as any });
    setStep(1);
  };

  const handleTipoChange = (value: string) => {
    setAnswers({ ...answers, tipo: value });
    setStep(2);
  };

  const handlePresupuestoChange = (value: string) => {
    setAnswers({ ...answers, presupuesto: value as any });
    setStep(3);
  };

  const handleEpocaChange = (value: string) => {
    setAnswers({ ...answers, epoca: value });
    setStep(4);
  };

  const handleCompaniaChange = (value: string) => {
    setAnswers({ ...answers, compania: value });
    calculateMatches();
  };

  const calculateMatches = () => {
    const scored = paquetes.map((paquete) => ({
      paquete,
      score: getMatchScore(paquete, answers),
    }));

    const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    setMatches(sorted);
    setStep(5);
  };

  const resetRecomendador = () => {
    setStep(0);
    setAnswers({
      duracion: null,
      tipo: null,
      presupuesto: null,
      epoca: null,
      compania: null,
    });
    setMatches([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step 1: Duration */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">¿Cuánto tiempo tienes?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'corta', label: '1-2 días', emoji: '⚡' },
                { value: 'media', label: '3-4 días', emoji: '🏃' },
                { value: 'larga', label: '5+ días', emoji: '🛫' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDuracionChange(option.value)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-center cursor-pointer"
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold text-slate-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">¿Qué tipo de viaje te atrae?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'naturaleza', label: 'Naturaleza', emoji: '🏔️' },
                { value: 'aventura', label: 'Aventura', emoji: '🎿' },
                { value: 'familia', label: 'Familia', emoji: '👨‍👩‍👧‍👦' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTipoChange(option.value)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-center cursor-pointer"
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold text-slate-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Budget */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">¿Cuál es tu presupuesto?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'bajo', label: 'Bajo', range: '$25-100k', emoji: '💰' },
                { value: 'medio', label: 'Medio', range: '$100-250k', emoji: '💳' },
                { value: 'alto', label: 'Alto', range: '$250k+', emoji: '✨' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePresupuestoChange(option.value)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-center cursor-pointer"
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold text-slate-900">{option.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{option.range}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Season */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">¿Cuándo te gustaría viajar?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'verano', label: 'Verano', emoji: '☀️' },
                { value: 'invierno', label: 'Invierno', emoji: '❄️' },
                { value: 'primavera', label: 'Primavera', emoji: '🌸' },
                { value: 'otono', label: 'Otoño', emoji: '🍂' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleEpocaChange(option.value)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-center cursor-pointer"
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold text-slate-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Company */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">¿Con quién viajarías?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'solo', label: 'Solo/a', emoji: '🧘' },
                { value: 'pareja', label: 'Pareja', emoji: '💑' },
                { value: 'amigos', label: 'Amigos', emoji: '👫' },
                { value: 'familia', label: 'Familia', emoji: '👨‍👩‍👧' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleCompaniaChange(option.value)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-center cursor-pointer"
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold text-slate-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-6">✨ Tu viaje perfecto</h3>

            <div className="space-y-4 mb-8">
              {matches.map((match, idx) => (
                <div key={match.paquete.id} className="card p-6 border-l-4 border-orange-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm text-orange-600 font-semibold mb-1">
                        #{idx + 1} Coincidencia ({match.score}%)
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">
                        {match.paquete.titulo}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Rating</div>
                      <div className="text-lg font-bold text-slate-900">
                        ⭐ {match.paquete.rating}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4">{match.paquete.descripcionCorta}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      📅 {match.paquete.duracionDias}d/{match.paquete.duracionNoches}n
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      💰 ${match.paquete.precioBase + match.paquete.gastosAdmin}
                    </span>
                  </div>

                  <a
                    href={`/Pucara-Turismo/paquetes/${match.paquete.slug}`}
                    className="btn btn-primary btn-sm inline-block"
                  >
                    Ver detalles →
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={resetRecomendador}
              className="w-full btn btn-secondary btn-sm"
            >
              Hacer de nuevo
            </button>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      {step < 5 && (
        <div className="mt-8 space-y-2">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-orange-500' : 'bg-slate-200'
                }`}
              ></div>
            ))}
          </div>
          <p className="text-sm text-slate-500 text-center">
            Paso {step + 1} de 5
          </p>
        </div>
      )}
    </div>
  );
}

