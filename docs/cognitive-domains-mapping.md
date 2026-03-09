# Cognitive Domains Mapping for Matching Algorithm — Issue #67

> **Status:** v1.0 — Informational Document
> **EU AI Act Art. 13:** Transparency of AI system design decisions

## Overview

This document maps the cognitive domains used by the DiversIA matching algorithm
to established neuropsychological constructs. The matching system evaluates
candidate-job compatibility across **four weighted dimensions**, each grounded
in cognitive science research.

## Matching Dimensions → Cognitive Domains

| Dimension        | Weight | Cognitive Domain(s)               | Measurement Source        |
| ---------------- | ------ | ---------------------------------- | ------------------------- |
| Skills           | 40%    | Crystallized Knowledge, Procedural Memory | Self-report + Assessment |
| Accommodations   | 30%    | Sensory Processing, Executive Function | Self-report (needs)      |
| Work Preferences | 20%    | Environmental Sensitivity, Social Cognition | Self-report              |
| Location         | 10%    | — (logistic, not cognitive)        | Self-report               |

## Cognitive Strengths Assessed in Games

The neurocognitive games (`/games`) measure the following domains:

| Game           | Primary Domain        | Secondary Domain       | Neurodivergent Strength Mapping |
| -------------- | --------------------- | ---------------------- | ------------------------------- |
| MemoryGrid     | Working Memory        | Visual-Spatial         | Pattern recognition (Autism)    |
| PatternMatrix  | Pattern Recognition   | Fluid Reasoning        | Systemizing (Autism)            |
| NumberSequence | Sequential Processing | Working Memory         | Mathematical reasoning (ADHD hyperfocus) |
| ColorMatch     | Inhibitory Control    | Processing Speed       | Selective attention             |
| ReactionTime   | Processing Speed      | Alertness              | Baseline speed metric           |
| PathFinder     | Spatial Navigation    | Planning               | Visual thinking (Dyslexia)      |
| SimonSays      | Auditory Memory       | Sequence Memory        | Procedural memory               |
| ShapeSorter    | Classification        | Cognitive Flexibility  | Categorization (Autism)         |
| WordBuilder    | Language Processing   | Lexical Access         | Verbal fluency                  |
| Operacion      | Arithmetic Processing | Working Memory         | Number sense                    |

## Quiz Domains (NeurodivergentQuiz)

The self-assessment quiz maps responses to these cognitive profiles:

| Quiz Category          | Cognitive Domain      | Clinical Alignment              |
| ---------------------- | --------------------- | ------------------------------- |
| Focus & Attention      | Sustained Attention   | DSM-5 ADHD criteria (314.0x)    |
| Social Interaction     | Social Cognition      | DSM-5 ASD criteria (299.00)     |
| Sensory Sensitivity    | Sensory Processing    | Sensory Processing Disorder     |
| Organization           | Executive Function    | Executive Function Disorder     |
| Learning Style         | Information Processing | Specific Learning Disorders     |
| Communication          | Pragmatic Language    | Social Communication Disorder   |
| Emotional Regulation   | Affect Regulation     | Cross-diagnostic                |

## Score → Profile Mapping

Assessment scores are combined into a **neuro-vector** (multidimensional profile):

```
neuroVector = {
  attention:          normalizedScore(focusGames + quizAttention),
  workingMemory:      normalizedScore(memoryGames),
  processingSpeed:    normalizedScore(speedGames),
  patternRecognition: normalizedScore(patternGames),
  executiveFunction:  normalizedScore(planningGames + quizOrganization),
  socialCognition:    normalizedScore(quizSocial),
  sensoryProcessing:  normalizedScore(quizSensory),
}
```

## Matching Algorithm Transparency

The current algorithm (`keyword-v1`) uses **keyword matching** with weighted scoring.
Future versions will incorporate the neuro-vector for deeper compatibility analysis:

- **v1 (current):** Keyword-based skills matching + accommodation text matching
- **v2 (planned):** Neuro-vector similarity scoring + accommodation structured matching
- **v3 (planned):** LLM-enhanced explanation generation + bias-audited scoring

## Bias Safeguards

Per EU AI Act Art. 10 (Data and data governance):

1. **No diagnostic labels in scoring:** Diagnoses are never used as matching factors
2. **Strengths-based framing:** Cognitive differences scored as capabilities, not deficits
3. **Accommodation-positive:** Having accommodation needs never reduces match scores
4. **Demographic blindness:** Age, gender, ethnicity are excluded from the algorithm
5. **Regular bias audits:** `BIAS_CHECK_EXECUTED` events in audit log

## References

- DSM-5 (APA, 2013) — Diagnostic criteria for neurodevelopmental disorders
- ICD-11 (WHO, 2019) — 6A0x Neurodevelopmental disorders
- NICE NG87 (2018) — Autism spectrum disorder in under 19s
- O*NET (US DoL) — Occupational cognitive requirements taxonomy
- ESCO (EU) — European Skills, Competences, and Occupations classification
