/**
 * Skills Normalization Taxonomy — Issue #61
 *
 * Structured taxonomy of skills used across the platform.
 * Maps free-text skill inputs to canonical skill identifiers.
 *
 * Categories follow O*NET / ESCO classification adapted for
 * neurodivergent-inclusive employment contexts.
 *
 * Usage:
 *   import { normalizeSkill, normalizeSkills, SKILL_CATEGORIES } from './skills.taxonomy'
 *   const normalized = normalizeSkills(['JS', 'react.js', 'Python3'])
 *   // → ['javascript', 'react', 'python']
 */

// ─── Skill Categories ────────────────────────────────────────────────────────

export interface SkillDefinition {
  id: string
  label: string
  category: string
  aliases: string[]
}

export const SKILL_CATEGORIES = [
  'programming_languages',
  'frontend',
  'backend',
  'data_science',
  'devops',
  'design',
  'soft_skills',
  'project_management',
  'qa_testing',
  'accessibility',
  'communication',
  'analytical',
] as const

export type SkillCategory = typeof SKILL_CATEGORIES[number]

// ─── Canonical Skills ────────────────────────────────────────────────────────

export const SKILLS_TAXONOMY: SkillDefinition[] = [
  // Programming Languages
  { id: 'javascript', label: 'JavaScript', category: 'programming_languages', aliases: ['js', 'ecmascript', 'es6', 'es2015', 'node.js', 'nodejs'] },
  { id: 'typescript', label: 'TypeScript', category: 'programming_languages', aliases: ['ts'] },
  { id: 'python', label: 'Python', category: 'programming_languages', aliases: ['python3', 'py', 'python2'] },
  { id: 'java', label: 'Java', category: 'programming_languages', aliases: ['java8', 'java11', 'java17', 'jdk'] },
  { id: 'csharp', label: 'C#', category: 'programming_languages', aliases: ['c#', 'c-sharp', 'dotnet', '.net'] },
  { id: 'cpp', label: 'C++', category: 'programming_languages', aliases: ['c++', 'cplusplus'] },
  { id: 'go', label: 'Go', category: 'programming_languages', aliases: ['golang'] },
  { id: 'rust', label: 'Rust', category: 'programming_languages', aliases: ['rustlang'] },
  { id: 'php', label: 'PHP', category: 'programming_languages', aliases: ['php7', 'php8'] },
  { id: 'ruby', label: 'Ruby', category: 'programming_languages', aliases: ['rb'] },
  { id: 'swift', label: 'Swift', category: 'programming_languages', aliases: ['swiftui'] },
  { id: 'kotlin', label: 'Kotlin', category: 'programming_languages', aliases: ['kt'] },
  { id: 'sql', label: 'SQL', category: 'programming_languages', aliases: ['mysql', 'postgresql', 'postgres', 'sqlite', 'tsql', 'plsql'] },
  { id: 'r', label: 'R', category: 'programming_languages', aliases: ['rlang', 'r-lang'] },

  // Frontend
  { id: 'react', label: 'React', category: 'frontend', aliases: ['react.js', 'reactjs', 'react 18'] },
  { id: 'angular', label: 'Angular', category: 'frontend', aliases: ['angular.js', 'angularjs', 'angular2'] },
  { id: 'vue', label: 'Vue.js', category: 'frontend', aliases: ['vue', 'vuejs', 'vue.js', 'vue3'] },
  { id: 'nextjs', label: 'Next.js', category: 'frontend', aliases: ['next', 'next.js', 'nextjs'] },
  { id: 'html', label: 'HTML', category: 'frontend', aliases: ['html5', 'html/css'] },
  { id: 'css', label: 'CSS', category: 'frontend', aliases: ['css3', 'scss', 'sass', 'less', 'tailwind', 'tailwindcss'] },
  { id: 'svelte', label: 'Svelte', category: 'frontend', aliases: ['sveltejs', 'sveltekit'] },

  // Backend
  { id: 'express', label: 'Express.js', category: 'backend', aliases: ['express', 'expressjs'] },
  { id: 'fastapi', label: 'FastAPI', category: 'backend', aliases: ['fast-api'] },
  { id: 'django', label: 'Django', category: 'backend', aliases: ['django-rest', 'drf'] },
  { id: 'spring', label: 'Spring', category: 'backend', aliases: ['spring-boot', 'springboot'] },
  { id: 'rails', label: 'Ruby on Rails', category: 'backend', aliases: ['rails', 'ror'] },
  { id: 'graphql', label: 'GraphQL', category: 'backend', aliases: ['gql'] },
  { id: 'rest_api', label: 'REST API', category: 'backend', aliases: ['rest', 'restful', 'api design', 'api development'] },

  // Data Science & AI/ML
  { id: 'machine_learning', label: 'Machine Learning', category: 'data_science', aliases: ['ml', 'deep learning', 'dl', 'ai', 'artificial intelligence'] },
  { id: 'data_analysis', label: 'Data Analysis', category: 'data_science', aliases: ['data analytics', 'analytics', 'business analytics'] },
  { id: 'tensorflow', label: 'TensorFlow', category: 'data_science', aliases: ['tf'] },
  { id: 'pytorch', label: 'PyTorch', category: 'data_science', aliases: ['torch'] },
  { id: 'pandas', label: 'Pandas', category: 'data_science', aliases: ['numpy', 'scipy'] },

  // DevOps
  { id: 'docker', label: 'Docker', category: 'devops', aliases: ['containers', 'containerization'] },
  { id: 'kubernetes', label: 'Kubernetes', category: 'devops', aliases: ['k8s'] },
  { id: 'aws', label: 'AWS', category: 'devops', aliases: ['amazon web services', 'ec2', 's3', 'lambda'] },
  { id: 'azure', label: 'Azure', category: 'devops', aliases: ['microsoft azure'] },
  { id: 'gcp', label: 'Google Cloud', category: 'devops', aliases: ['google cloud platform', 'gcp'] },
  { id: 'cicd', label: 'CI/CD', category: 'devops', aliases: ['continuous integration', 'continuous deployment', 'github actions', 'jenkins', 'gitlab ci'] },
  { id: 'linux', label: 'Linux', category: 'devops', aliases: ['unix', 'bash', 'shell scripting'] },
  { id: 'git', label: 'Git', category: 'devops', aliases: ['github', 'gitlab', 'version control'] },

  // Design
  { id: 'ui_design', label: 'UI Design', category: 'design', aliases: ['user interface design', 'ui'] },
  { id: 'ux_design', label: 'UX Design', category: 'design', aliases: ['user experience', 'ux', 'ux research'] },
  { id: 'figma', label: 'Figma', category: 'design', aliases: ['figma design'] },
  { id: 'adobe_suite', label: 'Adobe Suite', category: 'design', aliases: ['photoshop', 'illustrator', 'indesign', 'adobe xd'] },

  // Soft Skills (neurodiversity-positive framing)
  { id: 'problem_solving', label: 'Problem Solving', category: 'soft_skills', aliases: ['critical thinking', 'analytical thinking', 'logical thinking'] },
  { id: 'attention_to_detail', label: 'Attention to Detail', category: 'soft_skills', aliases: ['detail oriented', 'detail-oriented', 'precision'] },
  { id: 'pattern_recognition', label: 'Pattern Recognition', category: 'soft_skills', aliases: ['pattern analysis', 'systematic thinking'] },
  { id: 'creative_thinking', label: 'Creative Thinking', category: 'soft_skills', aliases: ['creativity', 'innovation', 'creative problem solving', 'out-of-the-box thinking'] },
  { id: 'hyperfocus', label: 'Hyperfocus', category: 'soft_skills', aliases: ['deep focus', 'sustained concentration', 'flow state'] },
  { id: 'systems_thinking', label: 'Systems Thinking', category: 'soft_skills', aliases: ['holistic thinking', 'big picture thinking'] },
  { id: 'visual_thinking', label: 'Visual Thinking', category: 'soft_skills', aliases: ['visual-spatial', 'spatial reasoning'] },
  { id: 'teamwork', label: 'Teamwork', category: 'soft_skills', aliases: ['collaboration', 'team player', 'cooperative'] },
  { id: 'communication', label: 'Communication', category: 'soft_skills', aliases: ['written communication', 'verbal communication', 'presentation skills'] },
  { id: 'adaptability', label: 'Adaptability', category: 'soft_skills', aliases: ['flexibility', 'resilience', 'growth mindset'] },

  // Project Management
  { id: 'agile', label: 'Agile', category: 'project_management', aliases: ['scrum', 'kanban', 'lean', 'sprint planning'] },
  { id: 'project_management', label: 'Project Management', category: 'project_management', aliases: ['pm', 'project lead', 'jira', 'trello'] },
  { id: 'product_management', label: 'Product Management', category: 'project_management', aliases: ['product owner', 'product strategy'] },

  // QA / Testing
  { id: 'testing', label: 'Software Testing', category: 'qa_testing', aliases: ['qa', 'quality assurance', 'test automation', 'unit testing', 'e2e testing'] },
  { id: 'selenium', label: 'Selenium', category: 'qa_testing', aliases: ['webdriver'] },
  { id: 'playwright', label: 'Playwright', category: 'qa_testing', aliases: ['cypress', 'puppeteer'] },

  // Accessibility
  { id: 'wcag', label: 'WCAG Compliance', category: 'accessibility', aliases: ['accessibility', 'a11y', 'web accessibility', 'aria'] },
  { id: 'assistive_tech', label: 'Assistive Technology', category: 'accessibility', aliases: ['screen readers', 'nvda', 'jaws', 'voiceover'] },
]

// ─── Normalization Index ─────────────────────────────────────────────────────

const _index = new Map<string, string>()

function buildIndex(): void {
  if (_index.size > 0) return
  for (const skill of SKILLS_TAXONOMY) {
    _index.set(skill.id, skill.id)
    _index.set(skill.label.toLowerCase(), skill.id)
    for (const alias of skill.aliases) {
      _index.set(alias.toLowerCase(), skill.id)
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Normalize a single skill string to its canonical ID.
 * Returns the original (lowercased, trimmed) if no match found.
 */
export function normalizeSkill(raw: string): string {
  buildIndex()
  const key = raw.toLowerCase().trim()
  return _index.get(key) ?? key
}

/**
 * Normalize an array of skill strings, deduplicating results.
 */
export function normalizeSkills(rawSkills: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of rawSkills) {
    const normalized = normalizeSkill(raw)
    if (!seen.has(normalized)) {
      seen.add(normalized)
      result.push(normalized)
    }
  }
  return result
}

/**
 * Get the display label for a canonical skill ID.
 */
export function getSkillLabel(skillId: string): string {
  const skill = SKILLS_TAXONOMY.find(s => s.id === skillId)
  return skill?.label ?? skillId
}

/**
 * Get skills by category.
 */
export function getSkillsByCategory(category: SkillCategory): SkillDefinition[] {
  return SKILLS_TAXONOMY.filter(s => s.category === category)
}

/**
 * Search skills by partial match (for autocomplete).
 */
export function searchSkills(query: string, limit = 10): SkillDefinition[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return SKILLS_TAXONOMY
    .filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.aliases.some(a => a.includes(q))
    )
    .slice(0, limit)
}
