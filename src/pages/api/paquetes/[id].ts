import type { APIRoute, GetStaticPaths } from 'astro';
import paquetesData from '@/data/paquetes.json';

export const getStaticPaths = (() => {
  return paquetesData.paquetes.map((p) => ({
    params: { id: p.slug },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.id;
    const paquete = paquetesData.paquetes.find((p) => p.slug === slug);
    if (!paquete) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Paquete no encontrado',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data: paquete,
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
      error: 'Error fetching paquete',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
