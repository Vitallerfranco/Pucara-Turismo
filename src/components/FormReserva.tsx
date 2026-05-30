import React, { useState } from 'react';
import { validateEmail, validatePhone, normalizePhone, calculateTotalPrice } from '@/lib/utils';
import type { Paquete, Extra } from '@/types';

interface FormReservaProps {
  paquete: Paquete;
  extras?: Extra[];
  onSubmit?: (data: any) => void;
  whatsappPhone?: string;
}

export default function FormReserva({
  paquete,
  extras = [],
  onSubmit,
  whatsappPhone = '5491150000000',
}: FormReservaProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    cantidadPasajeros: 1,
    extrasSeleccionados: [] as string[],
    notas: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedExtras = extras.filter((e) =>
    formData.extrasSeleccionados.includes(e.id)
  );

  const totalPrice = calculateTotalPrice(
    paquete.precioBase,
    paquete.gastosAdmin,
    formData.cantidadPasajeros,
    selectedExtras
  );

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!validatePhone(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido';
    }

    if (formData.cantidadPasajeros < 1) {
      newErrors.cantidadPasajeros = 'Mínimo 1 pasajero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleToggleExtra = (extraId: string) => {
    setFormData({
      ...formData,
      extrasSeleccionados: formData.extrasSeleccionados.includes(extraId)
        ? formData.extrasSeleccionados.filter((id) => id !== extraId)
        : [...formData.extrasSeleccionados, extraId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Normalizar teléfono
      const telefonoNormalizado = normalizePhone(formData.telefono);

      const reservaData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: telefonoNormalizado,
        cantidadPasajeros: formData.cantidadPasajeros,
        paqueteId: paquete.id,
        extras: selectedExtras,
        totalPrice,
        notas: formData.notas,
      };

      onSubmit?.(reservaData);

      // Enviar a WhatsApp
      const mensaje = `Hola! Quiero reservar:

📌 ${paquete.titulo}
👤 Nombre: ${formData.nombre}
📧 Email: ${formData.email}
📱 Teléfono: ${formData.telefono}
👥 Pasajeros: ${formData.cantidadPasajeros}
${selectedExtras.length > 0 ? `Extras:\n${selectedExtras.map((e) => `• ${e.nombre}`).join('\n')}\n` : ''}
💰 Total: $${totalPrice.toLocaleString('es-AR')}

${formData.notas ? `Notas: ${formData.notas}` : ''}`;

      window.open(
        `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(mensaje)}`,
        '_blank'
      );

      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        cantidadPasajeros: 1,
        extrasSeleccionados: [],
        notas: '',
      });
      setStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step 1: Personal Info */}
      {step === 1 && (
        <form className="card p-6 md:p-8 space-y-6">
          <h3 className="text-2xl font-bold mb-6">📋 Datos personales</h3>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre completo *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Tu nombre"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-500 ${
                errors.nombre ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-500 ${
                errors.email ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-2">Teléfono/WhatsApp *</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+54 9 11 5000-0000"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-500 ${
                errors.telefono ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.telefono && (
              <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold mb-2">Cantidad de pasajeros *</label>
            <select
              value={formData.cantidadPasajeros}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cantidadPasajeros: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} pasajero{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            {errors.cantidadPasajeros && (
              <p className="text-red-500 text-sm mt-1">{errors.cantidadPasajeros}</p>
            )}
          </div>

          {/* Price summary */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-700">Paquete base:</span>
              <span className="font-semibold">
                ${(paquete.precioBase * formData.cantidadPasajeros).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-700">Gastos administrativos:</span>
              <span className="font-semibold">
                ${(paquete.gastosAdmin * formData.cantidadPasajeros).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
              <span className="font-bold">Subtotal:</span>
              <span className="text-xl font-bold text-orange-600">
                ${((paquete.precioBase + paquete.gastosAdmin) * formData.cantidadPasajeros).toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full btn btn-primary btn-lg"
          >
            Siguiente → Extras
          </button>
        </form>
      )}

      {/* Step 2: Extras */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
          <h3 className="text-2xl font-bold mb-6">✨ Añadir extras (opcional)</h3>

          {extras.length > 0 ? (
            <div className="space-y-3 mb-6">
              {extras.map((extra) => (
                <label
                  key={extra.id}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.extrasSeleccionados.includes(extra.id)}
                    onChange={() => handleToggleExtra(extra.id)}
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{extra.nombre}</div>
                    <p className="text-sm text-slate-600">{extra.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      ${extra.precio.toLocaleString('es-AR')}
                    </div>
                    <p className="text-xs text-slate-500">por persona</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-lg p-4 text-slate-600 text-center">
              No hay extras disponibles para este paquete
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notas adicionales</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Ej: Me gustaría cambiar fechas, tengo restricciones alimentarias, etc."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Total price */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total:</span>
              <span className="text-2xl font-bold text-orange-600">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {formData.cantidadPasajeros} pasajero{formData.cantidadPasajeros > 1 ? 's' : ''} ×{' '}
              {selectedExtras.length > 0 && `+ ${selectedExtras.length} extras`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 btn btn-secondary btn-lg"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary btn-lg"
            >
              {loading ? '⏳ Enviando...' : '💬 Reservar por WhatsApp'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
