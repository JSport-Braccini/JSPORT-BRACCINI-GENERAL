
export enum UserRole {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  REFEREE = 'REFEREE',
  SPECTATOR = 'SPECTATOR'
}

export type Position = 'OP' | 'OH' | 'MB' | 'S' | 'L';

export interface PlayerStats {
  attacks: number;
  blocks: number;
  aces: number;
  errors: number;
  totalPoints: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  imageUrl: string;
  stats: PlayerStats;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  delegate: string;
  players: Player[];
  captainId: string;
}

export interface MatchSet {
  teamAScore: number;
  teamBScore: number;
  winner?: 'A' | 'B';
}

export type OverlayType = 
  | 'NONE' 
  | 'MINIBUG' 
  | 'TICKER_BOTTOM'
  | 'STATS_MATCH' 
  | 'HAWK_EYE_SCAN'
  | 'HAWK_EYE_RESULT'
  | 'SET_POINT'
  | 'MATCH_POINT'
  | 'ROTATION_VIEW';

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  currentSet: number;
  sets: MatchSet[];
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  date: string;
  time: string;
  rotationA: string[]; 
  rotationB: string[];
  timeoutsA: number;
  timeoutsB: number;
  subsA: number;
  subsB: number;
  activeOverlay: OverlayType;
  lastPointType?: 'ATTACK' | 'BLOCK' | 'SERVE' | 'ERROR';
  lastPointTeam?: 'A' | 'B';
  lastPointPlayerId?: string;
  hawkEyeResult?: 'IN' | 'OUT';
  maxSets: number; 
  pointsPerSet: number; 
  decidingSetPoints: number; 
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  logoUrl: string;
  groups: Group[];
  sponsors: Sponsor[];
  startDate?: string;
  location?: string;
  syncId?: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  teamId?: string;
}
