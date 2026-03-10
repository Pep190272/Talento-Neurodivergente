# Neuro-Vector Dimensions: Clinical Standards Mapping — Issue #72

> **Status:** v1.0 — Research & Design Document
> **Compliance:** EU AI Act Art. 10 (Data governance), Art. 13 (Transparency)

## Purpose

This document maps each dimension of the DiversIA neuro-vector to validated
clinical assessment standards. The neuro-vector is a multidimensional profile
representing a candidate's cognitive strengths, used for job matching.

**Important:** The neuro-vector is NOT a diagnostic tool. It measures workplace-
relevant cognitive capabilities through gamified assessments and self-report.

## Neuro-Vector Dimensions

### 1. Attention (`attention`)

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Clinical Domain** | Sustained & Selective Attention           |
| **DSM-5 Reference** | 314.0x (ADHD) — Inattention criteria      |
| **ICD-11 Code**     | 6A05 — Attention deficit hyperactivity disorder |
| **Assessment Tools**| CPT-3 (Conners), TOVA, d2 Test of Attention |
| **DiversIA Games**  | ColorMatch (inhibition), ReactionTime (alertness) |
| **Quiz Mapping**    | Focus & Attention category responses      |
| **Score Range**     | 0–100 (normalized percentile)             |
| **Strengths Frame** | Hyperfocus capability, divergent attention, creative exploration |

### 2. Working Memory (`workingMemory`)

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Clinical Domain** | Verbal & Visual-Spatial Working Memory    |
| **DSM-5 Reference** | Cross-diagnostic (ADHD, SLD, ASD)         |
| **ICD-11 Code**     | N/A — component of multiple disorders     |
| **Assessment Tools**| WISC-V Working Memory Index, Digit Span, Corsi Block |
| **DiversIA Games**  | MemoryGrid (visual WM), SimonSays (auditory WM) |
| **Score Range**     | 0–100 (normalized percentile)             |
| **Strengths Frame** | Pattern retention, procedural learning efficiency |

### 3. Processing Speed (`processingSpeed`)

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Clinical Domain** | Cognitive Processing Speed                |
| **DSM-5 Reference** | Often reduced in ADHD, SLD; variable in ASD |
| **ICD-11 Code**     | N/A — neuropsychological measure          |
| **Assessment Tools**| WISC-V PSI, Trail Making Test (Part A), Symbol Digit |
| **DiversIA Games**  | ReactionTime (simple RT), ColorMatch (choice RT) |
| **Score Range**     | 0–100 (normalized percentile)             |
| **Strengths Frame** | Deliberate processing leads to higher accuracy |

### 4. Pattern Recognition (`patternRecognition`)

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Clinical Domain** | Fluid Reasoning & Perceptual Reasoning    |
| **DSM-5 Reference** | Often elevated in ASD (systemizing)       |
| **ICD-11 Code**     | 6A02 — ASD (restricted patterns strength) |
| **Assessment Tools**| Raven's Progressive Matrices, WISC-V FRI  |
| **DiversIA Games**  | PatternMatrix (visual patterns), NumberSequence (numeric patterns) |
| **Score Range**     | 0–100 (normalized percentile)             |
| **Strengths Frame** | Superior systemizing, analytical capability, detail orientation |

### 5. Executive Function (`executiveFunction`)

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Clinical Domain** | Planning, Cognitive Flexibility, Inhibition |
| **DSM-5 Reference** | 314.0x (ADHD), cross-diagnostic           |
| **ICD-11 Code**     | 6A05 — ADHD executive function deficits   |
| **Assessment Tools**| BRIEF-2, Wisconsin Card Sorting, Tower of London |
| **DiversIA Games**  | PathFinder (planning), ShapeSorter (flexibility) |
| **Quiz Mapping**    | Organization category responses           |
| **Score Range**     | 0–100 (normalized percentile)             |
| **Strengths Frame** | Creative problem-solving, non-linear thinking |

### 6. Social Cognition (`socialCognition`)

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Clinical Domain** | Theory of Mind, Pragmatic Language         |
| **DSM-5 Reference** | 299.00 (ASD) — Social communication       |
| **ICD-11 Code**     | 6A02 — ASD social interaction patterns    |
| **Assessment Tools**| ADOS-2, Sally-Anne Task, Reading the Mind in the Eyes |
| **DiversIA Mapping**| Quiz: Social Interaction + Communication  |
| **Score Range**     | 0–100 (normalized percentile)             |
| **Strengths Frame** | Direct communication, logical social reasoning, honesty |

### 7. Sensory Processing (`sensoryProcessing`)

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Clinical Domain** | Sensory Integration & Modulation          |
| **DSM-5 Reference** | 299.00 (ASD) — Sensory reactivity criteria |
| **ICD-11 Code**     | 6A02.Y — ASD with sensory features       |
| **Assessment Tools**| Sensory Profile-2 (Dunn), AASP            |
| **DiversIA Mapping**| Quiz: Sensory Sensitivity responses       |
| **Score Range**     | 0–100 (higher = more sensory sensitivity) |
| **Strengths Frame** | Environmental awareness, quality detection |

## Normalization Method

All game scores are normalized using z-score transformation against population data:

```
normalizedScore = clip(50 + (rawScore - populationMean) / populationSD * 15, 0, 100)
```

This produces a distribution centered at 50 with most scores between 20–80,
analogous to standard scores in neuropsychological assessment (mean=100, SD=15)
but rescaled to 0–100 for user-friendliness.

## Ethical Constraints

1. **No pathologizing:** Scores describe capabilities, never deficits
2. **No diagnosis inference:** The system must never suggest or imply a diagnosis
3. **Consent required:** Neuro-vector data is special category data (GDPR Art. 9)
4. **Encryption:** All neuro-vector data encrypted at rest (AES-256-GCM)
5. **Right to deletion:** Users can delete all assessment data (GDPR Art. 17)
6. **No score-based rejection:** Low scores in any dimension cannot be used
   to automatically reject a candidate
