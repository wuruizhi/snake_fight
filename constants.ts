
import { Direction, Position } from './types';

export const GRID_SIZE = 30;
export const TICK_RATE_MS = 100;
export const AI_COUNT = 5;
export const INITIAL_SNAKE_LENGTH = 5;
export const FOOD_VALUE = 10;
export const SNAKE_REMAINS_VALUE = 50;
export const MAX_LEADERBOARD_ENTRIES = 10;

export const PLAYER_1_COLOR = 'bg-cyan-400';
export const PLAYER_2_COLOR = 'bg-fuchsia-500';
export const AI_COLORS = [
  'bg-red-500',
  'bg-yellow-400',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-400',
  'bg-indigo-500',
];
export const FOOD_COLOR = 'bg-green-500';

export const DIRECTIONS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export const CONTROLS_P1: Record<string, Direction> = {
  KeyW: 'UP',
  ArrowUp: 'UP',
  KeyS: 'DOWN',
  ArrowDown: 'DOWN',
  KeyA: 'LEFT',
  ArrowLeft: 'LEFT',
  KeyD: 'RIGHT',
  ArrowRight: 'RIGHT',
};

export const CONTROLS_P2: Record<string, Direction> = {
  Numpad8: 'UP',
  Numpad5: 'DOWN',
  Numpad4: 'LEFT',
  Numpad6: 'RIGHT',
};
