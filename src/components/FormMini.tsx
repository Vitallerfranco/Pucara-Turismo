import React, { useState } from 'react';
import { validatePhone, normalizePhone } from '@/lib/utils';

interface FormMiniProps {
  paqueteId?: string;
  whatsappPhone?: string;
  placeholder?: string;
  onSuccess?: () => void;
}

export default function FormMini({
  paqueteId,
  whatsappPhone = '5491150000000',
  placeholder = 'Tu nombre y teléfono',
  onSuccess,
}: FormMiniProps) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate
    if (!nombre.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!validatePhone(telefono)) {
      setError('Teléfono inválido (ej: +54 9 11 5000-0000)');
      return;
    }

    setLoading(true);

    try {
      const telefonoNormalizado = normalizePhone(telefono);

      const mensaje = `Hola! Mi nombre es ${nombre}.

Estoy interesado/a en reservar un viaje${paqueteId ? ' a través de tu sitio' : ''}.

Mi teléfono es: ${telefono}

¿Puedes ayudarme con disponibilidad y opciones?`;

      // Open WhatsApp
      window.open(
        `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(mensaje)}`,
        '_blank'
      );

      setSuccess(true);
      setNombre('');
      setTelefono('');
      onSuccess?.();

      // Reset success message after 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex-1">
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+54 9 11 5000-0000"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-sm whitespace-nowrap"
        >
          {loading ? '⏳' : '💬'} Consultar
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mt-2">
          ✅ ¡Perfecto! Abriendo WhatsApp...
        </p>
      )}
    </form>
  );
}
