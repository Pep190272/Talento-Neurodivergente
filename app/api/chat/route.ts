/**
 * NeuroDialect Chat API
 *
 * Connects to Ollama (llama3.2:3b) for AI-powered responses.
 * Falls back to curated static responses if Ollama is unavailable.
 *
 * Sprint 4: Integrated with LlmService (replaces demo mode)
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateCompletion, checkOllamaHealth } from '@/lib/services/llm.service'

const SYSTEM_PROMPT = `Eres NeuroDialect, el asistente de IA de DiversIA — una plataforma que conecta talento neurodivergente (TDAH, Autismo, Dislexia, Dispraxia) con empresas inclusivas.

Tu misión: ayudar a candidatos, empresas y terapeutas a entender cómo DiversIA puede apoyarles.
Principios: lenguaje positivo, enfocado en fortalezas, breve (máximo 3-4 oraciones), en el idioma del usuario.
Si algo está fuera de tu alcance, redirige a soporte@diversia.app.`

const FALLBACK_RESPONSES = [
  'Soy NeuroDialect, el asistente de DiversIA. Conecto talento neurodivergente con empresas inclusivas. ¿En qué puedo ayudarte?',
  'DiversIA usa IA transparente para matching laboral con supervisión humana. ¿Te interesa saber cómo funciona?',
  'Puedes explorar nuestras evaluaciones cognitivas en JUEGOS, o registrarte como candidato, empresa o terapeuta en FORMULARIOS.',
  '¿Eres candidato, empresa o terapeuta? Cuéntame más y te explico cómo DiversIA puede ayudarte.',
]


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, userData = null } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const ollamaUp = await checkOllamaHealth()

    if (ollamaUp) {
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUsuario: ${prompt.slice(0, 1000)}\n\nNeuroDialect:`
      const raw = await generateCompletion(fullPrompt, { temperature: 0.7, numPredict: 256 })

      return NextResponse.json({
        response: raw.trim(),
        timestamp: new Date().toISOString(),
        context: { userData: userData ? 'available' : 'none', mode: 'llm' },
      })
    }

    // Fallback when Ollama is down
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return NextResponse.json({
      response: fallback,
      timestamp: new Date().toISOString(),
      context: { userData: userData ? 'available' : 'none', mode: 'fallback' },
    })

  } catch (error) {
    console.error('[Chat API] error:', error)
    return NextResponse.json(
      {
        response: 'Disculpa, estoy teniendo dificultades técnicas. Por favor intenta de nuevo en un momento.',
        error: 'Internal server error',
      },
      { status: 200 }
    )
  }
}
