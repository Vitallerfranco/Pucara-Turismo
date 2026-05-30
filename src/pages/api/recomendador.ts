import type { APIRoute } from 'astro';
import { getMatchScore } from '@/lib/utils';
import paquetesData from '@/data/paquetes.json';

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { duracion, tipo, presupuesto, epoca, compania } = body;

    // Validate inputs
    if (!duracion || !tipo || !presupuesto || !compania) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const answers = {
      duracion,
      tipo,
      presupuesto,
      epoca,
      compania,
    };

    // Calculate matches
    const matches = paquetesData.paquetes
      .map((paquete) => ({
        paquete,
        score: getMatchScore(paquete, answers),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5

    return new Response(JSON.stringify({
      success: true,
      data: matches,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in recomendador:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error processing request',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
