import type { APIRoute } from 'astro';
import paquetesData from '@/data/paquetes.json';

export const GET: APIRoute = async ({ params }) => {
  try {
    const paquetes = paquetesData.paquetes;

    return new Response(JSON.stringify({
      success: true,
      data: paquetes,
      total: paquetes.length,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error fetching paquetes',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
