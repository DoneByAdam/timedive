// Typed access to timedive-topics-seed.json — the single source of truth for
// the Topic Explorer. Adding a topic is just adding one JSON object there;
// nothing here needs to change.
import rawData from './timedive-topics-seed.json';

export type Sensitivity = 'light' | 'moderate' | 'mature';

export interface Era {
  id: string;
  label: string;
  range: string;
  order: number;
}

export interface Theme {
  id: string;
  label: string;
}

export interface GradeBand {
  id: string;
  label: string;
  grades: string;
  ages: string;
}

export interface Topic {
  id: string;
  title: string;
  hook: string;
  era: string;
  regions: string[];
  themes: string[];
  spotlight: boolean;
  spotlightReason: string | null;
  ageMin: number;
  ageMax: number;
  gradeBands: string[];
  sensitivity: Sensitivity;
}

interface TopicsSeed {
  schemaVersion: string;
  eras: Era[];
  themes: Theme[];
  gradeBands: GradeBand[];
  topics: Topic[];
}

const data = rawData as TopicsSeed;

export const ERAS: Era[] = [...data.eras].sort((a, b) => a.order - b.order);
export const THEMES: Theme[] = data.themes;
export const GRADE_BANDS: GradeBand[] = data.gradeBands;
export const TOPICS: Topic[] = data.topics;

const eraById = new Map(ERAS.map(e => [e.id, e]));
const themeById = new Map(THEMES.map(t => [t.id, t]));
const gradeBandById = new Map(GRADE_BANDS.map(g => [g.id, g]));

export const getEra = (id: string): Era | undefined => eraById.get(id);
export const getTheme = (id: string): Theme | undefined => themeById.get(id);
export const getGradeBand = (id: string): GradeBand | undefined => gradeBandById.get(id);

function parseAgeRange(ages: string): [number, number] {
  const [min, max] = ages.split('-').map(Number);
  return [min, max];
}

// Map an age to the grade band it falls into; clamps to the nearest band
// for ages outside the defined bands entirely (e.g. adults).
export function gradeBandIdForAge(age: number): string {
  for (const band of GRADE_BANDS) {
    const [min, max] = parseAgeRange(band.ages);
    if (age >= min && age <= max) return band.id;
  }
  const [firstMin] = parseAgeRange(GRADE_BANDS[0].ages);
  return age < firstMin ? GRADE_BANDS[0].id : GRADE_BANDS[GRADE_BANDS.length - 1].id;
}

export interface TopicFilters {
  eraId?: string;
  themeId?: string;
  region?: string;
  gradeBandId?: string;
  spotlightOnly?: boolean;
  /** When set, excludes topics outside the topic's [ageMin, ageMax]. */
  age?: number;
}

export function filterTopics(filters: TopicFilters = {}): Topic[] {
  return TOPICS.filter(t => {
    if (filters.eraId && t.era !== filters.eraId) return false;
    if (filters.themeId && !t.themes.includes(filters.themeId)) return false;
    if (filters.region && !t.regions.includes(filters.region) && !t.regions.includes('Global')) return false;
    if (filters.gradeBandId && !t.gradeBands.includes(filters.gradeBandId)) return false;
    if (filters.spotlightOnly && !t.spotlight) return false;
    if (filters.age != null && (filters.age < t.ageMin || filters.age > t.ageMax)) return false;
    return true;
  });
}

export function topicsByEra(filters: Omit<TopicFilters, 'eraId'> = {}): Array<{ era: Era; topics: Topic[] }> {
  return ERAS.map(era => ({ era, topics: filterTopics({ ...filters, eraId: era.id }) }));
}

export function allRegions(): string[] {
  const set = new Set<string>();
  for (const t of TOPICS) for (const r of t.regions) if (r !== 'Global') set.add(r);
  return [...set].sort();
}

// Sensitivity gating — a "moderate" topic gets a soft confirm below age 9;
// a "mature" one (Holocaust, transatlantic slave trade) gets one below 12.
// Never a hard block, per product intent — just a pause, not a wall.
export function needsSensitivityConfirmation(topic: Topic, age: number | undefined): boolean {
  if (age == null) return false;
  if (topic.sensitivity === 'mature') return age < 12;
  if (topic.sensitivity === 'moderate') return age < 9;
  return false;
}
