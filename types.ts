
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
  captainVideoUrl?: string;
}

export interface MatchSet {
  teamAScore: number;
  teamBScore: number;
  winner?: 'A' | 'B';
}

export type OverlayType = 
  | 'NONE' 
  | 'MINIBUG' 
  | 'MARCADOR_FULL' 
  | 'STATS_MATCH' 
  | 'STATS_PLAYER' 
  | 'HAWK_EYE_IN' 
  | 'HAWK_EYE_OUT'
  | 'CAPTAIN_INTRO'
  | 'WIN_PROBABILITY'
  | 'PLAYER_COMPARE'
  | 'STARTING_LINEUP'
  | 'TIME_OUT'
  | 'SET_POINT'
  | 'MATCH_POINT';

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
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  teamId?: string;
}
