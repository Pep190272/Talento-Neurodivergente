import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

// Simple validation and normalization
async function validateAndNormalize(formData, formType) {
  try {
    const errors = [];
    const normalized = { ...formData };

    if (formType === 'individual') {
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        errors.push('First name is required and must be at least 2 characters');
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('Valid email is required');
      }
      normalized.firstName = formData.firstName?.trim();
      normalized.email = formData.email?.toLowerCase().trim();
    } else if (formType === 'company') {
      if (!formData.companyName || formData.companyName.trim().length < 2) {
        errors.push('Company name is required');
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('Valid email is required');
      }
      normalized.companyName = formData.companyName?.trim();
      normalized.email = formData.email?.toLowerCase().trim();
    } else if (formType === 'therapist') {
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        errors.push('First name is required');
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.push('Valid email is required');
      }
      normalized.firstName = formData.firstName?.trim();
      normalized.email = formData.email?.toLowerCase().trim();
    }

    const validated = errors.length === 0;
    const summary = validated
      ? `${formType} form validated successfully`
      : `${formType} form has validation errors`;

    return {
      validated,
      normalized,
      summary,
      errors
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      validated: false,
      normalized: formData,
      summary: 'Validation failed due to error',
      errors: ['Validation error occurred']
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