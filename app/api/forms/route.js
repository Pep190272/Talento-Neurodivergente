import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // Validate and normalize
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

    // Create submission in PostgreSQL
    const submission = await prisma.formSubmission.create({
      data: {
        formType,
        data: validation.normalized,
        summary: validation.summary,
        validated: true,
      },
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        type: submission.formType,
        data: submission.data,
        summary: submission.summary,
        timestamp: submission.createdAt.toISOString(),
        validated: submission.validated,
      },
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
    const submissions = await prisma.formSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = submissions.map(s => ({
      id: s.id,
      type: s.formType,
      data: s.data,
      summary: s.summary,
      timestamp: s.createdAt.toISOString(),
      validated: s.validated,
    }));

    return NextResponse.json({
      submissions: formatted,
      count: formatted.length
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
