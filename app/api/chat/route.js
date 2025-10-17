import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

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
    const { prompt, history = [], userData = null, apiKey = null } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Use provided API key from client or fallback to server env
    const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!effectiveApiKey || effectiveApiKey === 'sk-placeholder-key-replace-with-real-openai-key') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add your API key in Settings.' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: effectiveApiKey,
    });

    // Get context from submissions
    const submissions = readSubmissions();

    // Build context-aware prompt
    let contextPrompt = `You are NeuroAgent, a helpful AI assistant for neurodivergent individuals, companies, and therapists.

    Your role is to:
    - Provide supportive, understanding responses
    - Answer questions about neurodivergence, accommodations, and workplace integration
    - Offer practical advice and resources
    - Translate complex concepts into simple terms
    - Recommend next steps based on user needs

    Current user context: ${userData ? JSON.stringify(userData, null, 2) : 'No user data available'}

    Recent platform activity: ${submissions.length} total submissions (${submissions.filter(s => s.type === 'individual').length} individuals, ${submissions.filter(s => s.type === 'company').length} companies, ${submissions.filter(s => s.type === 'therapist').length} therapists)

    Chat history: ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    User message: ${prompt}

    Please respond in a helpful, supportive tone. If the user asks about specific features, games, or assessments, mention that they're available on the platform.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are NeuroAgent, a supportive AI assistant for the neurodivergent community. Be helpful, understanding, and practical in your responses."
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

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your Settings.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
} 