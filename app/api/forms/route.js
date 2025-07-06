import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');

// Ensure data directory exists
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// Read submissions from JSON file
function readSubmissions() {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading submissions:', error);
    return [];
  }
}

// Write submissions to JSON file
function writeSubmissions(submissions) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
  } catch (error) {
    console.error('Error writing submissions:', error);
    throw error;
  }
}

// OpenAI validation and normalization
async function validateAndNormalize(formData, formType) {
  try {
    const prompt = `Please validate and normalize the following ${formType} form data. 
    Return a JSON object with:
    1. "validated": boolean - whether the data is valid
    2. "normalized": object - the cleaned/normalized data
    3. "summary": string - a human-readable summary
    4. "errors": array - any validation errors
    
    Form type: ${formType}
    Form data: ${JSON.stringify(formData, null, 2)}
    
    For normalization:
    - Standardize acronyms (e.g., "ADHD" not "adhd")
    - Clean up formatting
    - Ensure required fields are present
    - Convert to consistent data types`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data validation and normalization expert. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI validation error:', error);
    return {
      validated: false,
      normalized: formData,
      summary: 'Validation failed due to API error',
      errors: ['OpenAI API error occurred']
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, formType } = body;

    if (!formData || !formType) {
      return NextResponse.json(
        { error: 'Missing formData or formType' },
        { status: 400 }
      );
    }

    // Validate and normalize with OpenAI
    const validation = await validateAndNormalize(formData, formType);

    if (!validation.validated) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors,
          summary: validation.summary
        },
        { status: 400 }
      );
    }

    // Create submission object
    const submission = {
      id: Date.now().toString(),
      type: formType,
      data: validation.normalized,
      summary: validation.summary,
      timestamp: new Date().toISOString(),
      validated: true
    };

    // Read existing submissions
    const submissions = readSubmissions();
    
    // Add new submission
    submissions.push(submission);
    
    // Write back to file
    writeSubmissions(submissions);

    return NextResponse.json({
      success: true,
      submission,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const submissions = readSubmissions();
    return NextResponse.json({
      submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 