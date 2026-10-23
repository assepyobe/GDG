export type TerrainType = 'road' | 'trail' | 'track' | 'mixed';

export type PaceCategory = 'all' | 'chill' | 'steady' | 'tempo' | 'fast';

export type RouteDifficulty = 'easy' | 'moderate' | 'challenging' | 'elite';

export interface Attendee {
  uid: string;
  name: string;
  photoURL?: string;
  joinedAt?: string;
}

export interface RunItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  meetLocation: string;
  address: string;
  distanceKm: number;
  paceGroup: string; // e.g. "5:30 - 6:00 min/km"
  paceCategory?: 'chill' | 'steady' | 'tempo' | 'fast';
  terrain: TerrainType;
  elevationGainM: number;
  maxRunners?: number;
  organizerId: string;
  organizerName: string;
  organizerPhoto?: string;
  postRunSocial?: string;
  routeHighlights: string[];
  rsvpCount: number;
  rsvpUserIds: string[];
  attendees?: Attendee[];
  createdAt: string;
}

export interface RunComment {
  id: string;
  runId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

export interface SavedRoute {
  id: string;
  title: string;
  distanceKm: number;
  difficulty: RouteDifficulty;
  startLocation: string;
  address?: string;
  elevationGainM?: number;
  terrain: TerrainType;
  description?: string;
  landmarks?: string[];
  creatorId: string;
  creatorName: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  preferredPace?: string;
  favoriteDistance?: string;
  shoes?: string;
  createdAt?: string;
}

export interface RunFilters {
  search: string;
  distanceCategory: 'all' | 'short' | 'medium' | 'long' | 'ultra';
  paceCategory: 'all' | 'chill' | 'steady' | 'tempo' | 'fast';
  terrain: 'all' | TerrainType;
  timeframe: 'all' | 'today' | 'weekend' | 'upcoming';
}
