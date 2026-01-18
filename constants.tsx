
import { Team, Player, Match, UserRole } from './types';

const createMockPlayer = (id: string, name: string, num: number, pos: any): Player => ({
  id,
  name,
  number: num,
  position: pos,
  imageUrl: `https://picsum.photos/seed/${id}/200`,
  stats: { attacks: 0, blocks: 0, aces: 0, errors: 0, totalPoints: 0 }
});

export const MOCK_TEAM_A: Team = {
  id: 'team-a',
  name: 'Águilas del Norte',
  logoUrl: 'https://picsum.photos/seed/team-a/100',
  delegate: 'Carlos Mendoza',
  captainId: 'p1',
  players: [
    createMockPlayer('p1', 'Juan Pérez', 7, 'OH'),
    createMockPlayer('p2', 'Carlos Ruiz', 10, 'S'),
    createMockPlayer('p3', 'Luis Mora', 5, 'MB'),
    createMockPlayer('p4', 'Pedro S.', 12, 'OP'),
    createMockPlayer('p5', 'Miguel T.', 1, 'L'),
    createMockPlayer('p6', 'Diego V.', 8, 'MB'),
    createMockPlayer('p7', 'Alex G.', 9, 'OH'),
  ]
};

export const MOCK_TEAM_B: Team = {
  id: 'team-b',
  name: 'Tiburones del Sur',
  logoUrl: 'https://picsum.photos/seed/team-b/100',
  delegate: 'Elena Rivas',
  captainId: 'p10',
  players: [
    createMockPlayer('p10', 'Roberto B.', 5, 'OH'),
    createMockPlayer('p11', 'Fernando J.', 2, 'S'),
    createMockPlayer('p12', 'Sandro K.', 11, 'MB'),
    createMockPlayer('p13', 'Mario L.', 15, 'OP'),
    createMockPlayer('p14', 'Pablo Q.', 3, 'L'),
    createMockPlayer('p15', 'Enrique P.', 6, 'MB'),
    createMockPlayer('p16', 'Lucas M.', 4, 'OH'),
  ]
};

export const MOCK_MATCH: Match = {
  id: 'm1',
  teamA: MOCK_TEAM_A,
  teamB: MOCK_TEAM_B,
  currentSet: 1,
  sets: [{ teamAScore: 0, teamBScore: 0 }],
  status: 'LIVE',
  date: '2024-10-25',
  time: '18:00',
  rotationA: ['p1', 'p2', 'p3', 'p4', 'p6', 'p7'],
  rotationB: ['p10', 'p11', 'p12', 'p13', 'p15', 'p16'],
  timeoutsA: 2,
  timeoutsB: 2,
  subsA: 6,
  subsB: 6,
  activeOverlay: 'NONE',
  maxSets: 3,
  pointsPerSet: 25,
  decidingSetPoints: 15
};

export const ROLE_CONFIG = {
  [UserRole.ADMIN]: { label: 'Administrador', color: 'bg-red-600' },
  [UserRole.COACH]: { label: 'Entrenador', color: 'bg-blue-600' },
  [UserRole.REFEREE]: { label: 'Árbitro', color: 'bg-yellow-600' },
  [UserRole.SPECTATOR]: { label: 'Espectador', color: 'bg-green-600' },
};
