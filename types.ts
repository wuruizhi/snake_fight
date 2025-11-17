
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface Snake {
  id: number;
  name: string;
  body: Position[];
  direction: Direction;
  nextDirection: Direction;
  color: string;
  isAi: boolean;
  score: number;
  isAlive: boolean;
}

export type GameMode = 'SINGLE_PLAYER' | 'TWO_PLAYER';
export type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER' | 'LEADERBOARD';

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}
