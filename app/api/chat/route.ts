import { NextRequest, NextResponse } from 'next/server';

const fallbackResponses = [
  "¡Hola! Soy NeuroDialect. Actualmente estoy en modo de demostración. ¿Te gustaría saber más sobre nuestras características de evaluación cognitiva?",
  "¡Gracias por tu interés! Como asistente de IA especializado en talento neurodivergente, puedo ayudarte con información sobre juegos cognitivos, evaluaciones y estrategias de inclusión laboral.",
  "¡Encantado de ayudarte! Puedes explorar nuestros juegos de evaluación cognitiva en la sección de JUEGOS, o conocer más sobre nuestros formularios en CARACTERÍSTICAS.",
  "Soy NeuroDialect, tu asistente para descubrir y potenciar el talento neurodivergente. ¿Quieres saber sobre evaluaciones cognitivas, matching laboral o estrategias de inclusión?"
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, userData = null } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    let response = '';

    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('juego') || lowerPrompt.includes('evalua') || lowerPrompt.includes('cognitiv')) {
      response = "¡Excelente pregunta! Tenemos 11 juegos de evaluación cognitiva que miden memoria, atención, razonamiento lógico y velocidad de procesamiento. Puedes acceder a ellos en la sección JUEGOS del menú principal. Cada juego está diseñado científicamente para identificar fortalezas cognitivas únicas.";
    } else if (lowerPrompt.includes('empresa') || lowerPrompt.includes('contratar') || lowerPrompt.includes('trabajo')) {
      response = "Para empresas, ofrecemos: 1) Evaluaciones científicas de candidatos, 2) Matching inteligente basado en fortalezas cognitivas, 3) Formación en inclusión neurodivergente, y 4) Consultoría personalizada. Visita la sección EMPRESA para más detalles.";
    } else if (lowerPrompt.includes('formulario') || lowerPrompt.includes('registro') || lowerPrompt.includes('inscrib')) {
      response = "Puedes registrarte completando nuestro formulario dinámico en la sección FORMULARIOS. Allí podrás indicar tus fortalezas, experiencia y preferencias laborales. El proceso es 100% confidencial y adaptado a tus necesidades.";
    } else if (lowerPrompt.includes('ayuda') || lowerPrompt.includes('como') || lowerPrompt.includes('funciona')) {
      response = "DiversIA es una plataforma que conecta talento neurodivergente con empresas inclusivas. Ofrecemos: evaluaciones cognitivas (JUEGOS), formularios personalizados (FORMULARIOS), matching laboral, y recursos para empresas. ¿En qué área específica te gustaría más información?";
    } else {
      response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      context: {
        userData: userData ? 'available' : 'none',
        mode: 'demo'
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        response: "Disculpa, estoy teniendo dificultades técnicas. Por favor intenta de nuevo en un momento.",
        error: 'Internal server error'
      },
      { status: 200 }
    );
  }
} 