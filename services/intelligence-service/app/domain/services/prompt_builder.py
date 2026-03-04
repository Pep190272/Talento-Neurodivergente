"""Prompt builder — constructs LLM prompts for different report types.

All prompts receive only anonymized data. The system prompt enforces
that the LLM must not attempt to re-identify individuals.
"""

from __future__ import annotations

from ..entities.talent_report import ReportType
from .anonymizer import AnonymizedMatch, AnonymizedProfile

SYSTEM_PROMPT = """You are DiversIA's talent analysis AI. You analyze anonymized
neurocognitive profiles to provide actionable workplace insights.

CRITICAL RULES:
1. NEVER attempt to identify individuals — all data is anonymized
2. Focus on strengths and accommodations, not deficits
3. Use inclusive, strengths-based language
4. Provide specific, actionable recommendations
5. Reference clinical frameworks (DSM-5, NICE guidelines) when relevant
6. Keep reports concise and professional"""


class PromptBuilder:
    """Builds structured prompts for different report types."""

    def build(
        self,
        report_type: ReportType,
        profile: AnonymizedProfile | None = None,
        match: AnonymizedMatch | None = None,
    ) -> str:
        if report_type == ReportType.CANDIDATE_SUMMARY:
            return self._candidate_summary(profile)
        elif report_type == ReportType.MATCH_ANALYSIS:
            return self._match_analysis(match)
        elif report_type == ReportType.ACCOMMODATION_GUIDE:
            return self._accommodation_guide(profile)
        elif report_type == ReportType.TEAM_FIT:
            return self._team_fit(match)
        raise ValueError(f"Unknown report type: {report_type}")

    def _candidate_summary(self, profile: AnonymizedProfile | None) -> str:
        if profile is None:
            raise ValueError("Profile required for candidate summary")
        return f"""{SYSTEM_PROMPT}

Analyze this candidate's neurocognitive profile and provide:
1. Key cognitive strengths (top 5 dimensions)
2. Areas that may benefit from workplace accommodations
3. Ideal work environment characteristics
4. Communication style recommendations for managers

{profile.to_prompt_context()}"""

    def _match_analysis(self, match: AnonymizedMatch | None) -> str:
        if match is None:
            raise ValueError("Match context required for match analysis")
        return f"""{SYSTEM_PROMPT}

Analyze this candidate-job match and provide:
1. Alignment summary (where the profiles align well)
2. Gap analysis (where there are significant differences)
3. Specific accommodation recommendations to bridge gaps
4. Onboarding suggestions for this specific pairing
5. Predicted challenges and mitigation strategies

{match.to_prompt_context()}"""

    def _accommodation_guide(self, profile: AnonymizedProfile | None) -> str:
        if profile is None:
            raise ValueError("Profile required for accommodation guide")
        return f"""{SYSTEM_PROMPT}

Based on this neurocognitive profile, generate a workplace accommodation guide:
1. Environmental accommodations (lighting, noise, space)
2. Schedule accommodations (flexibility, break patterns)
3. Communication accommodations (formats, frequency, tools)
4. Technology aids (software, hardware recommendations)
5. Management best practices for this profile type

Reference NICE guidelines and evidence-based practices.

{profile.to_prompt_context()}"""

    def _team_fit(self, match: AnonymizedMatch | None) -> str:
        if match is None:
            raise ValueError("Match context required for team fit analysis")
        return f"""{SYSTEM_PROMPT}

Analyze how this candidate would fit within the team environment:
1. Team dynamic impact (communication, collaboration patterns)
2. Complementary strengths they bring
3. Potential friction points and how to mitigate them
4. Recommended team structure adjustments

{match.to_prompt_context()}"""
