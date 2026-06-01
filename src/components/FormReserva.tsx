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
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';
    if (!validatePhone(formData.telefono)) newErrors.telefono = 'Teléfono inválido';
    if (formData.cantidadPasajeros < 1) newErrors.cantidadPasajeros = 'Mínimo 1 pasajero';
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

      const mensaje = `Hola! Quiero reservar:\n\n📌 ${paquete.titulo}\n👤 Nombre: ${formData.nombre}\n📧 Email: ${formData.email}\n📱 Teléfono: ${formData.telefono}\n👥 Pasajeros: ${formData.cantidadPasajeros}\n${selectedExtras.length > 0 ? `Extras:\n${selectedExtras.map((e) => `• ${e.nombre}`).join('\n')}\n` : ''}\n💰 Total: $${totalPrice.toLocaleString('es-AR')}\n\n${formData.notas ? `Notas: ${formData.notas}` : ''}`;

      window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(mensaje)}`, '_blank');

      setFormData({ nombre: '', email: '', telefono: '', cantidadPasajeros: 1, extrasSeleccionados: [], notas: '' });
      setStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Estilos reutilizables ── */
  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    background: '#0a0a0a',
    border: '1px solid #272727',
    borderRadius: '8px',
    color: '#ccc',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const inputError: React.CSSProperties = { ...inputBase, borderColor: '#7f1d1d' };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#555',
    marginBottom: '6px',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#f87171',
    marginTop: '4px',
  };

  const chevronDown = (
    <svg
      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#555' }}
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  /* ── STEP 1 ── */
  if (step === 1) {
    return (
      <div className="w-full">
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '22px' }}>

          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Datos personales
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Tu nombre"
                style={errors.nombre ? inputError : inputBase}
              />
              {errors.nombre && <p style={errorStyle}>{errors.nombre}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                style={errors.email ? inputError : inputBase}
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label style={labelStyle}>Teléfono / WhatsApp *</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+54 9 11 5000-0000"
                style={errors.telefono ? inputError : inputBase}
              />
              {errors.telefono && <p style={errorStyle}>{errors.telefono}</p>}
            </div>

            {/* Pasajeros */}
            <div>
              <label style={labelStyle}>Cantidad de pasajeros *</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={formData.cantidadPasajeros}
                  onChange={(e) => setFormData({ ...formData, cantidadPasajeros: parseInt(e.target.value) })}
                  style={{ ...inputBase, padding: '9px 32px 9px 12px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <option key={n} value={n}>{n} pasajero{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
                {chevronDown}
              </div>
              {errors.cantidadPasajeros && <p style={errorStyle}>{errors.cantidadPasajeros}</p>}
            </div>

            {/* Resumen precio */}
            <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#555' }}>Paquete base:</span>
                <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>
                  ${(paquete.precioBase * formData.cantidadPasajeros).toLocaleString('es-AR')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#555' }}>Gastos administrativos:</span>
                <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>
                  ${(paquete.gastosAdmin * formData.cantidadPasajeros).toLocaleString('es-AR')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #1e1e1e' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#666' }}>Subtotal</span>
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#e8622a' }}>
                  ${((paquete.precioBase + paquete.gastosAdmin) * formData.cantidadPasajeros).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Botón siguiente → Extras */}
            <button
              type="button"
              onClick={handleNextStep}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: '#e8622a',
                border: '1px solid #e8622a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#cf5523')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#e8622a')}
            >
              Siguiente → Extras
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 2 ── */
  return (
    <div className="w-full">
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '22px' }}>

        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Extras opcionales
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Lista extras */}
          {extras.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {extras.map((extra) => {
                const checked = formData.extrasSeleccionados.includes(extra.id);
                return (
                  <label
                    key={extra.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      background: checked ? '#1a1208' : '#0d0d0d',
                      border: `1px solid ${checked ? '#e8622a44' : '#1e1e1e'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Checkbox custom */}
                    <div style={{
                      width: '16px', height: '16px', flexShrink: 0, marginTop: '2px',
                      borderRadius: '4px',
                      border: checked ? '1px solid #e8622a' : '1px solid #333',
                      background: checked ? '#e8622a' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checked && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleExtra(extra.id)}
                      style={{ display: 'none' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#ccc', margin: 0 }}>{extra.nombre}</p>
                      <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 0' }}>{extra.descripcion}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: checked ? '#e8622a' : '#888', margin: 0 }}>
                        ${extra.precio.toLocaleString('es-AR')}
                      </p>
                      <p style={{ fontSize: '10px', color: '#444', margin: '2px 0 0' }}>por persona</p>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '14px', textAlign: 'center', fontSize: '12px', color: '#444' }}>
              No hay extras disponibles para este paquete
            </div>
          )}

          {/* Notas */}
          <div>
            <label style={labelStyle}>Notas adicionales</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Ej: cambio de fecha, restricciones alimentarias..."
              rows={3}
              style={{ ...inputBase, resize: 'vertical', lineHeight: '1.5', paddingTop: '9px' }}
            />
          </div>

          {/* Total */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#666' }}>Total</span>
                <p style={{ fontSize: '11px', color: '#444', margin: '3px 0 0' }}>
                  {formData.cantidadPasajeros} pasajero{formData.cantidadPasajeros > 1 ? 's' : ''}
                  {selectedExtras.length > 0 && ` · ${selectedExtras.length} extra${selectedExtras.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#e8622a' }}>
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: '11px 16px',
                background: '#141414',
                border: '1px solid #272727',
                borderRadius: '8px',
                color: '#888',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#ccc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#272727'; e.currentTarget.style.color = '#888'; }}
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px 16px',
                background: '#e8622a',
                border: '1px solid #e8622a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#cf5523')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#e8622a')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {loading ? '⏳ Enviando...' : '💬 Reservar por WhatsApp'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}