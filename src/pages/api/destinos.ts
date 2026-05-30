import type { APIRoute } from 'astro';
import destinosData from '@/data/destinos.json';

export const GET: APIRoute = async () => {
  try {
    const destinos = destinosData.destinos;

    return new Response(JSON.stringify({
      success: true,
      data: destinos,
      total: destinos.length,
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
      error: 'Error fetching destinos',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
