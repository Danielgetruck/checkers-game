import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import { socket } from './socket';
import './App.css';

function App() {
  const [gameId, setGameId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [board, setBoard] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, ended
  const [inputGameId, setInputGameId] = useState(''); // הוספת משתנה נפרד לקלט

  useEffect(() => {
    // התחברות לשרת
    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
      setPlayerId(socket.id);
    });

    // הוספת האזנה לאירוע שגיאה
    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      alert('שגיאה: ' + message);
    });

    // אירוע קבלת מזהה משחק
    socket.on('game-created', ({ gameId }) => {
      console.log('Game created with ID:', gameId);
      setGameId(gameId);
      setGameState('waiting');
    });

    // אירוע הצטרפות שחקן שני
    socket.on('player-joined', ({ gameId, players }) => {
      console.log('Player joined game:', gameId, 'Players:', players);
      setOpponentId(players.find(id => id !== socket.id));
      setGameState('playing');
      setIsPlayerTurn(players[0] === socket.id);
    });

    // אירוע קבלת עדכון לוח
    socket.on('board-updated', ({ board, currentTurn }) => {
      console.log('Board updated, current turn:', currentTurn);
      setBoard(board);
      setIsPlayerTurn(currentTurn === socket.id);
    });

    // אירוע סיום משחק
    socket.on('game-ended', ({ winner }) => {
      console.log('Game ended, winner:', winner);
      setGameState('ended');
      setIsPlayerTurn(false);
    });

    // בדיקה אם כבר יש משחק פעיל בעת טעינת הקומפוננטה
    if (gameId) {
      console.log('Reconnecting to existing game:', gameId);
      socket.emit('join-game', { gameId });
    }

    return () => {
      socket.off('connect');
      socket.off('error');
      socket.off('game-created');
      socket.off('player-joined');
      socket.off('board-updated');
      socket.off('game-ended');
    };
  }, [gameId]); // הוספת gameId כתלות ב-useEffect

  const createGame = () => {
    console.log('Sending create-game event');
    socket.emit('create-game');
  };

  const joinGame = () => {
    console.log(`Attempting to join game: ${inputGameId}`);
    // שמירת קוד המשחק במצב (state)
    setGameId(inputGameId);
    // שליחת בקשת הצטרפות
    socket.emit('join-game', { gameId: inputGameId });
  };

  const makeMove = (fromPos, toPos) => {
    if (isPlayerTurn && gameState === 'playing') {
      console.log('Making move:', fromPos, 'to', toPos);
      socket.emit('make-move', { 
        gameId, 
        playerId, 
        fromPos, 
        toPos 
      });
    }
  };

  return (
    <div className="app">
      <h1>משחק דמקה מקוון</h1>
      
      {gameState === 'waiting' && !gameId && (
        <div className="menu">
          <button onClick={createGame}>צור משחק חדש</button>
          <div>
            <input 
              type="text" 
              placeholder="הכנס קוד משחק" 
              value={inputGameId}
              onChange={(e) => setInputGameId(e.target.value)} 
            />
            <button onClick={joinGame}>הצטרף למשחק</button>
          </div>
        </div>
      )}

      {gameState === 'waiting' && gameId && (
        <div className="waiting">
          <p>מחכה לשחקן שני להצטרף</p>
          <p>קוד המשחק: <strong>{gameId}</strong></p>
          <p>שתף את הקוד עם חבר כדי שיוכל להצטרף</p>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game">
          <div className="game-info">
            <p>{isPlayerTurn ? 'התור שלך' : 'תור היריב'}</p>
            <p>קוד המשחק: {gameId}</p>
          </div>
          {board && (
            <Board 
              board={board} 
              playerId={playerId} 
              isPlayerTurn={isPlayerTurn}
              onMove={makeMove} 
            />
          )}
        </div>
      )}

      {gameState === 'ended' && (
        <div className="game-ended">
          <p>המשחק הסתיים!</p>
          <button onClick={() => {
            setGameId('');
            setGameState('waiting');
            createGame();
          }}>משחק חדש</button>
        </div>
      )}
      
      <div className="debug-info" style={{ fontSize: '12px', margin: '20px', color: '#666' }}>
        <p>מזהה שחקן: {playerId}</p>
        <p>מזהה יריב: {opponentId || 'אין'}</p>
        <p>מצב משחק: {gameState}</p>
      </div>
    </div>
  );
}

export default App;