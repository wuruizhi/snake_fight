
import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import { GameState, GameMode, ScoreEntry } from './types';
import { MAX_LEADERBOARD_ENTRIES } from './constants';

const NeonButton: React.FC<{ onClick: () => void; children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => (
    <button
        onClick={onClick}
        className={`px-8 py-4 text-2xl font-bold text-cyan-300 uppercase bg-gray-800 border-2 border-cyan-400 rounded-lg shadow-[0_0_10px_0_#06b6d4,inset_0_0_10px_0_#06b6d4] hover:bg-cyan-400 hover:text-gray-900 hover:shadow-[0_0_20px_0_#06b6d4] transition-all duration-300 ${className}`}
    >
        {children}
    </button>
);

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('MENU');
    const [gameMode, setGameMode] = useState<GameMode>('SINGLE_PLAYER');
    const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
    const [lastScore, setLastScore] = useState<number | null>(null);

    useEffect(() => {
        try {
            const savedScores = localStorage.getItem('snakeSurvivalScores');
            if (savedScores) {
                setLeaderboard(JSON.parse(savedScores));
            }
        } catch (error) {
            console.error("Failed to load scores from localStorage", error);
        }
    }, []);

    const startGame = (mode: GameMode) => {
        setGameMode(mode);
        setGameState('PLAYING');
    };
    
    const handleGameOver = useCallback((score: number) => {
        setLastScore(score);
        setGameState('GAME_OVER');
    }, []);
    
    const addToLeaderboard = (name: string) => {
        const newEntry: ScoreEntry = { name, score: lastScore!, date: new Date().toISOString() };
        const updatedLeaderboard = [...leaderboard, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_LEADERBOARD_ENTRIES);
        setLeaderboard(updatedLeaderboard);
        try {
            localStorage.setItem('snakeSurvivalScores', JSON.stringify(updatedLeaderboard));
        } catch (error) {
            console.error("Failed to save scores to localStorage", error);
        }
        setGameState('LEADERBOARD');
    };

    const renderContent = () => {
        switch (gameState) {
            case 'PLAYING':
                return <GameBoard gameMode={gameMode} onGameOver={handleGameOver} />;
            case 'GAME_OVER':
                return <GameOverScreen score={lastScore!} onRestart={() => startGame(gameMode)} onMenu={() => setGameState('MENU')} onSubmit={addToLeaderboard} />;
            case 'LEADERBOARD':
                return <LeaderboardScreen scores={leaderboard} onMenu={() => setGameState('MENU')} />;
            case 'MENU':
            default:
                return <MenuScreen onStartGame={startGame} onShowLeaderboard={() => setGameState('LEADERBOARD')} />;
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4 font-mono">
            {renderContent()}
        </div>
    );
};

const MenuScreen: React.FC<{ onStartGame: (mode: GameMode) => void; onShowLeaderboard: () => void; }> = ({ onStartGame, onShowLeaderboard }) => (
    <div className="flex flex-col items-center text-center space-y-8 animate-fadeIn">
        <h1 className="text-7xl md:text-8xl font-black uppercase text-cyan-400" style={{ textShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4' }}>
            Snake Survival
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl">Outmaneuver AI opponents. Eat their remains to grow. Survive as long as you can.</p>
        <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <NeonButton onClick={() => onStartGame('SINGLE_PLAYER')}>Single Player</NeonButton>
            <NeonButton onClick={() => onStartGame('TWO_PLAYER')}>Two Player</NeonButton>
        </div>
        <button onClick={onShowLeaderboard} className="text-xl text-fuchsia-400 hover:text-fuchsia-300 hover:underline transition-all">Leaderboard</button>
    </div>
);

const GameOverScreen: React.FC<{ score: number; onRestart: () => void; onMenu: () => void; onSubmit: (name: string) => void; }> = ({ score, onRestart, onMenu, onSubmit }) => {
    const [name, setName] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            onSubmit(name.trim());
        }
    };
    
    return (
        <div className="flex flex-col items-center text-center space-y-6 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-red-500 shadow-lg shadow-red-500/20 animate-fadeIn">
            <h2 className="text-6xl font-bold text-red-500">Game Over</h2>
            <p className="text-3xl text-gray-200">Final Score: <span className="text-cyan-400 font-bold">{score}</span></p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 10))}
                    placeholder="ENTER YOUR NAME"
                    maxLength={10}
                    className="w-full max-w-xs text-center bg-gray-900 text-cyan-300 border-2 border-cyan-400 rounded-md p-2 text-xl focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />
                <NeonButton type="submit" className="w-full max-w-xs !py-2 !text-xl">Submit to Leaderboard</NeonButton>
            </form>
            <div className="flex gap-4 pt-4">
                <button onClick={onRestart} className="text-lg px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Play Again</button>
                <button onClick={onMenu} className="text-lg px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Main Menu</button>
            </div>
        </div>
    );
};

const LeaderboardScreen: React.FC<{ scores: ScoreEntry[]; onMenu: () => void; }> = ({ scores, onMenu }) => (
    <div className="w-full max-w-2xl flex flex-col items-center space-y-6 animate-fadeIn">
        <h2 className="text-5xl font-bold text-fuchsia-400" style={{ textShadow: '0 0 10px #e879f9' }}>Leaderboard</h2>
        <div className="w-full bg-gray-800/50 backdrop-blur-sm border border-fuchsia-500 rounded-lg p-4 shadow-lg shadow-fuchsia-500/20">
            <div className="grid grid-cols-3 gap-4 text-lg font-bold text-center border-b-2 border-fuchsia-500 pb-2 mb-2">
                <div>Rank</div>
                <div>Name</div>
                <div>Score</div>
            </div>
            {scores.length > 0 ? (
                <div className="space-y-2">
                    {scores.map((entry, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 text-center text-xl p-2 rounded-md even:bg-gray-700/50">
                            <div className="font-bold text-cyan-400">#{index + 1}</div>
                            <div>{entry.name}</div>
                            <div className="font-bold text-yellow-400">{entry.score}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 p-4">No scores yet. Be the first!</p>
            )}
        </div>
        <NeonButton onClick={onMenu} className="!border-fuchsia-500 !text-fuchsia-400 !shadow-[0_0_10px_0_#d946ef,inset_0_0_10px_0_#d946ef] hover:!bg-fuchsia-500 hover:!shadow-[0_0_20px_0_#d946ef]">Main Menu</NeonButton>
    </div>
);


export default App;
