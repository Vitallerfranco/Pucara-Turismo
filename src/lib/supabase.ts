ñimport { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export async function getPaquetes() {
  const { data, error } = await supabase
    .from('paquetes')
    .select('*')
    .eq('activo', true)
    .order('rating', { ascending: false });
  
  if (error) {
    console.error('Error fetching paquetes:', error);
    return [];
  }
  return data || [];
}

export async function getPaqueteById(id: string) {
  const { data, error } = await supabase
    .from('paquetes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching paquete:', error);
    return null;
  }
  return data;
}

export async function getDestinos() {
  const { data, error } = await supabase
    .from('destinos')
    .select('*')
    .order('nombre');
  
  if (error) {
    console.error('Error fetching destinos:', error);
    return [];
  }
  return data || [];
}

export async function getDisponibilidad(salidaId: string) {
  const { data, error } = await supabase
    .from('disponibilidad')
    .select('*')
    .eq('salida_id', salidaId)
    .single();
  
  if (error) {
    console.error('Error fetching disponibilidad:', error);
    return null;
  }
  return data;
}

export async function crearReserva(paqueteId: string, usuarioId: string, cantidad: number) {
  const { data, error } = await supabase
    .from('reservas')
    .insert([
      {
        paquete_id: paqueteId,
        usuario_id: usuarioId,
        cantidad_pasajeros: cantidad,
        estado: 'pre-reserva'
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating reserva:', error);
    return null;
  }
  return data;
}

export async function getReservasPorUsuario(usuarioId: string) {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching reservas:', error);
    return [];
  }
  return data || [];
}
