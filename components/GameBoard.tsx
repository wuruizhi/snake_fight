
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Snake, Position, Direction } from '../types';
import { useInterval } from '../hooks/useInterval';
import {
  GRID_SIZE, TICK_RATE_MS, AI_COUNT, INITIAL_SNAKE_LENGTH,
  PLAYER_1_COLOR, PLAYER_2_COLOR, AI_COLORS, FOOD_COLOR,
  DIRECTIONS, OPPOSITE_DIRECTIONS, CONTROLS_P1,
  FOOD_VALUE, SNAKE_REMAINS_VALUE
} from '../constants';

interface GameBoardProps {
  gameMode: GameMode;
  onGameOver: (score: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameMode, onGameOver }) => {
  const [snakes, setSnakes] = useState<Snake[]>([]);
  const [food, setFood] = useState<Position[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const createInitialSnakes = useCallback(() => {
    const newSnakes: Snake[] = [];

    // Player 1
    newSnakes.push(createSnake(0, 'Player 1', { x: 5, y: 15 }, PLAYER_1_COLOR, false));

    // Player 2
    if (gameMode === 'TWO_PLAYER') {
      newSnakes.push(createSnake(1, 'Player 2', { x: 25, y: 15 }, PLAYER_2_COLOR, false));
    }
    
    // AI Snakes
    for (let i = 0; i < AI_COUNT; i++) {
        const startPos = getRandomPosition(newSnakes.flatMap(s => s.body));
        newSnakes.push(createSnake(newSnakes.length, `AI ${i+1}`, startPos, AI_COLORS[i % AI_COLORS.length], true));
    }

    return newSnakes;
  }, [gameMode]);

  useEffect(() => {
    setSnakes(createInitialSnakes());
    setFood([getRandomPosition([])]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Escape') {
      setIsPaused(p => !p);
      return;
    }

    setSnakes(prevSnakes =>
      prevSnakes.map(snake => {
        if (snake.isAi) return snake;

        let newDirection: Direction | undefined;
        if (snake.id === 0 && CONTROLS_P1[e.code]) {
          newDirection = CONTROLS_P1[e.code];
        } 
        // P2 controls are hardcoded here for simplicity as they are less common (numpad)
        else if (snake.id === 1 && gameMode === 'TWO_PLAYER') {
            if (e.code === 'Numpad8') newDirection = 'UP';
            if (e.code === 'Numpad5') newDirection = 'DOWN';
            if (e.code === 'Numpad4') newDirection = 'LEFT';
            if (e.code === 'Numpad6') newDirection = 'RIGHT';
        }

        if (newDirection && snake.direction !== OPPOSITE_DIRECTIONS[newDirection]) {
            return { ...snake, nextDirection: newDirection };
        }
        return snake;
      })
    );
  }, [gameMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameLoop = () => {
    if (isPaused) return;

    let updatedSnakes = [...snakes];
    let newFood = [...food];
    const allSnakeBodies = updatedSnakes.flatMap(s => s.body);
    
    // 1. Update AI directions
    updatedSnakes = updatedSnakes.map(snake => {
        if (snake.isAi && snake.isAlive) {
            return { ...snake, nextDirection: getAiNextDirection(snake, updatedSnakes, newFood) };
        }
        return snake;
    });

    // 2. Move snakes
    updatedSnakes = updatedSnakes.map(snake => {
        if (!snake.isAlive) return snake;
        
        const newDirection = snake.nextDirection;
        const head = snake.body[0];
        const move = DIRECTIONS[newDirection];
        const newHead = { x: head.x + move.x, y: head.y + move.y };
        const newBody = [newHead, ...snake.body];
        
        // 3. Check for eating
        const foodIndex = newFood.findIndex(f => f.x === newHead.x && f.y === newHead.y);
        let ateFood = false;
        if (foodIndex !== -1) {
            ateFood = true;
            newFood.splice(foodIndex, 1);
            if (newFood.length === 0) { // Always have at least one food
                 newFood.push(getRandomPosition([...allSnakeBodies, ...newFood]));
            }
        }
        
        if (!ateFood) {
          newBody.pop();
        }

        return { ...snake, body: newBody, direction: newDirection, score: snake.score + (ateFood ? FOOD_VALUE : 1) };
    });

    // 4. Check for collisions and handle deaths
    const snakesToCheck = [...updatedSnakes];
    let player1Died = false;
    for (const snake of snakesToCheck) {
        if (!snake.isAlive) continue;

        const head = snake.body[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            snake.isAlive = false;
        }

        // Self collision
        for (let i = 1; i < snake.body.length; i++) {
            if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
                snake.isAlive = false;
                break;
            }
        }
        if (!snake.isAlive) continue;

        // Other snake collision
        for (const otherSnake of snakesToCheck) {
            if (snake.id === otherSnake.id) continue;
            for(const segment of otherSnake.body) {
                if (head.x === segment.x && head.y === segment.y) {
                    snake.isAlive = false;
                    // The snake that was hit also gets a bonus
                    if(otherSnake.isAlive) otherSnake.score += SNAKE_REMAINS_VALUE;
                    break;
                }
            }
            if(!snake.isAlive) break;
        }

        if(!snake.isAlive) {
            // Turn dead snake into food
            snake.body.forEach(segment => newFood.push(segment));
            if (!snake.isAi) player1Died = true;
        }
    }
    
    if (player1Died) {
        const player1 = updatedSnakes.find(s => s.id === 0);
        onGameOver(player1?.score || 0);
        return;
    }

    setSnakes(updatedSnakes.filter(s => s.isAlive));
    setFood(newFood);
  };
  
  useInterval(gameLoop, TICK_RATE_MS);

  const getPlayerScores = () => {
    const p1 = snakes.find(s => s.id === 0);
    const p2 = snakes.find(s => s.id === 1);
    return {p1Score: p1?.score ?? 0, p2Score: p2?.score ?? 0};
  }

  const { p1Score, p2Score } = getPlayerScores();

  return (
    <div className="flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 text-xl">
             <div className="font-bold">P1 Score: <span className="text-cyan-400">{p1Score}</span></div>
             {gameMode === 'TWO_PLAYER' && <div className="font-bold">P2 Score: <span className="text-fuchsia-500">{p2Score}</span></div>}
        </div>
      <div
        className="relative bg-gray-800 border-4 border-cyan-400 shadow-[0_0_20px_0_#06b6d4] grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          width: 'min(80vw, 80vh)',
          height: 'min(80vw, 80vh)',
        }}
      >
        {isPaused && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                <h2 className="text-5xl font-bold text-yellow-400 animate-pulse">PAUSED</h2>
            </div>
        )}
        {snakes.map(snake =>
          snake.body.map((segment, i) => (
            <div
              key={`${snake.id}-${i}`}
              className={`w-full h-full ${snake.color} ${i === 0 ? 'rounded-sm' : ''}`}
              style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }}
            />
          ))
        )}
        {food.map((f, i) => (
          <div
            key={`food-${i}`}
            className={`${FOOD_COLOR} w-full h-full rounded-full animate-pulse`}
            style={{ gridColumnStart: f.x + 1, gridRowStart: f.y + 1 }}
          />
        ))}
      </div>
       <div className="mt-4 text-gray-400 text-center">
          <p>Controls (P1): WASD or Arrow Keys | P2: Numpad 8,4,5,6</p>
          <p>Pause: Space or Escape</p>
        </div>
    </div>
  );
};


// Helper Functions

function createSnake(id: number, name: string, startPos: Position, color: string, isAi: boolean): Snake {
  const body: Position[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    body.push({ x: startPos.x - i, y: startPos.y });
  }
  return { id, name, body, direction: 'RIGHT', nextDirection: 'RIGHT', color, isAi, score: 0, isAlive: true };
}

function getRandomPosition(exclude: Position[]): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (exclude.some(p => p.x === pos.x && p.y === pos.y));
  return pos;
}


function getAiNextDirection(ai: Snake, allSnakes: Snake[], food: Position[]): Direction {
    const head = ai.body[0];
    const possibleMoves: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(dir => dir !== OPPOSITE_DIRECTIONS[ai.direction]) as Direction[];

    const safeMoves = possibleMoves.filter(dir => {
        const move = DIRECTIONS[dir];
        const nextPos = { x: head.x + move.x, y: head.y + move.y };

        // Wall check
        if (nextPos.x < 0 || nextPos.x >= GRID_SIZE || nextPos.y < 0 || nextPos.y >= GRID_SIZE) return false;

        // Other snakes check
        for (const snake of allSnakes) {
            for (const segment of snake.body) {
                if (nextPos.x === segment.x && nextPos.y === segment.y) return false;
            }
        }
        return true;
    });

    if (safeMoves.length === 0) return ai.direction; // Nowhere to go, good luck

    // Find nearest food
    let nearestFood: Position | null = null;
    let minDistance = Infinity;

    food.forEach(f => {
        const distance = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);
        if (distance < minDistance) {
            minDistance = distance;
            nearestFood = f;
        }
    });

    if (nearestFood) {
        const sortedByFood = safeMoves.sort((a, b) => {
            const moveA = DIRECTIONS[a];
            const posA = { x: head.x + moveA.x, y: head.y + moveA.y };
            const distA = Math.abs(posA.x - nearestFood!.x) + Math.abs(posA.y - nearestFood!.y);

            const moveB = DIRECTIONS[b];
            const posB = { x: head.x + moveB.x, y: head.y + moveB.y };
            const distB = Math.abs(posB.x - nearestFood!.x) + Math.abs(posB.y - nearestFood!.y);
            
            return distA - distB;
        });
        return sortedByFood[0];
    }

    // No food or path, move randomly but prefer straight
    if(safeMoves.includes(ai.direction) && Math.random() < 0.8) {
        return ai.direction;
    }

    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
}

export default GameBoard;
