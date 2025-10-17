import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');

// Read submissions for context
function readSubmissions() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading submissions:', error);
    return [];
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, history = [], userData = null } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Get context from submissions
    const submissions = readSubmissions();
    
    // Build context-aware prompt
    let contextPrompt = `Eres NeuroDialect, un asistente de IA especializado en ayudar a personas neurodivergentes, empresas y terapeutas.

    Tu rol es:
    - Proporcionar respuestas comprensivas y de apoyo
    - Responder preguntas sobre neurodivergencia, adaptaciones e integración laboral
    - Ofrecer consejos prácticos y recursos
    - Traducir conceptos complejos en términos simples
    - Recomendar próximos pasos según las necesidades del usuario

    Contexto del usuario actual: ${userData ? JSON.stringify(userData, null, 2) : 'Sin datos de usuario disponibles'}

    Actividad reciente de la plataforma: ${submissions.length} envíos totales (${submissions.filter(s => s.type === 'individual').length} individuos, ${submissions.filter(s => s.type === 'company').length} empresas, ${submissions.filter(s => s.type === 'therapist').length} terapeutas)

    Historial del chat: ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    Mensaje del usuario: ${prompt}

    Por favor responde en un tono útil y de apoyo. Si el usuario pregunta sobre características específicas, juegos o evaluaciones, menciona que están disponibles en la plataforma. SIEMPRE responde en español.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres NeuroDialect, un asistente de IA de apoyo para la comunidad neurodivergente. Sé útil, comprensivo y práctico en tus respuestas. SIEMPRE responde en español."
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      context: {
        userData: userData ? 'available' : 'none',
        submissionsCount: submissions.length
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 