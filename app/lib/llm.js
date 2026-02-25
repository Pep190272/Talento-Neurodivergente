/**
 * Ollama LLM Client for Diversia
 *
 * Self-hosted Ollama on VPS Hostinger (Paris, France) with Llama 3.2 3B.
 *
 * Decision (25 Feb 2026): Self-hosted is the definitive choice for DiversIA.
 * Reasons:
 * - GDPR Art. 9: Neurodivergent data (special category) never leaves our infra
 * - Budget $0: No external API costs
 * - Llama 3.2 3B: IFEval 77.4 (25% better than Gemma 2B at instruction following)
 * - Timeout protection (10s max) + graceful fallback if VPS down
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'
const REQUEST_TIMEOUT = 10000 // 10 seconds

/**
 * Prompt template for inclusivity analysis
 */
const INCLUSIVITY_ANALYSIS_PROMPT = (jobData) => `
Eres un experto en inclusividad laboral para personas neurodivergentes.

Analiza esta oferta de trabajo y retorna SOLO JSON válido sin texto adicional.

**FORMATO DE RESPUESTA (JSON):**
{
  "score": <número 0-100>,
  "discriminatoryLanguage": <true o false>,
  "issues": [
    {
      "type": "age|ableism|gender|cultural",
      "term": "<término problemático encontrado>",
      "severity": "low|medium|high"
    }
  ],
  "accommodations": {
    "count": <número de accommodations detectadas>,
    "quality": "poor|good|excellent"
  },
  "suggestions": "<texto breve con sugerencias de mejora>"
}

**DATOS DEL JOB:**
Título: ${jobData.title}
Descripción: ${jobData.description || 'No description'}
Skills Requeridas: ${jobData.requiredSkills?.join(', ') || 'None'}
Accommodations: ${jobData.accommodations?.join(', ') || 'None specified'}

**CRITERIOS DE EVALUACIÓN:**
1. Score Base: 50 puntos
2. Por cada accommodation: +10 puntos (máximo 6 accommodations = 60 puntos)
3. Si hay lenguaje discriminatorio: -20 puntos
4. Accommodations de calidad (remote work, flexible hours, async communication): +5 puntos adicionales cada una

**TÉRMINOS DISCRIMINATORIOS A DETECTAR:**
- Discriminación por edad: "young", "energetic", "digital native", "recent graduate"
- Ableism: "perfect communication", "flawless", "no limitations", "neurotypical"
- Sesgo de género: "rockstar", "ninja", "guru"
- Sesgo cultural: "native speaker", "cultural fit"

RETORNA SOLO EL JSON, SIN TEXTO ANTES O DESPUÉS.
`.trim()

/**
 * Generic Ollama completion
 * 
 * @param {string} prompt - The prompt to send
 * @param {object} options - Optional parameters
 * @returns {Promise<string>} Raw response text
 */
export async function generateCompletion(prompt, options = {}) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
        const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                format: 'json',
                stream: false,
                ...options
            })
        })

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return data.response

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('LLM request timeout after 10s')
        }
        throw error
    } finally {
        clearTimeout(timeout)
    }
}

/**
 * Analyze job posting for inclusivity
 * 
 * Returns scoring (0-100), discriminatory language detection,
 * and suggestions for improvement.
 * 
 * @param {object} jobData - Job posting data
 * @param {string} jobData.title - Job title
 * @param {string} jobData.description - Job description
 * @param {string[]} jobData.requiredSkills - Required skills
 * @param {string[]} jobData.accommodations - Accommodations offered
 * @returns {Promise<object>} Analysis result with score, issues, suggestions
 */
export async function analyzeJobInclusivity(jobData) {
    try {
        // Generate prompt
        const prompt = INCLUSIVITY_ANALYSIS_PROMPT(jobData)

        // Call LLM
        const rawResponse = await generateCompletion(prompt)

        // Parse JSON response
        let analysis
        try {
            analysis = JSON.parse(rawResponse)
        } catch (parseError) {
            console.error('LLM response is not valid JSON:', rawResponse)
            throw new Error('Invalid JSON response from LLM')
        }

        // Validate structure (basic check, Zod validation comes next)
        if (typeof analysis.score !== 'number') {
            throw new Error('Missing or invalid score in LLM response')
        }

        return analysis

    } catch (error) {
        console.warn('LLM analysis failed:', error.message)

        // Fallback: basic analysis without LLM
        const accommodationsCount = jobData.accommodations?.length || 0
        const baseScore = 50 + (accommodationsCount * 10)

        return {
            score: Math.min(baseScore, 100),
            discriminatoryLanguage: false,
            issues: [],
            accommodations: {
                count: accommodationsCount,
                quality: accommodationsCount >= 3 ? 'good' : 'poor'
            },
            suggestions: 'LLM analysis unavailable. Basic scoring applied.',
            fallback: true // Flag to indicate this is a fallback response
        }
    }
}

/**
 * Health check for Ollama service
 * 
 * @returns {Promise<boolean>} True if Ollama is responsive
 */
export async function checkOllamaHealth() {
    try {
        const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        })
        return response.ok
    } catch {
        return false
    }
}
