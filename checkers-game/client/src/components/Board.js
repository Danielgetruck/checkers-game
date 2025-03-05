import React, { useState } from 'react';
import './Board.css';

const Board = ({ board, playerId, isPlayerTurn, onMove }) => {
  const [selectedPiece, setSelectedPiece] = useState(null);

  const handleClick = (row, col) => {
    console.log("Cell clicked:", row, col, "Is my turn:", isPlayerTurn);
    
    if (!isPlayerTurn) {
      console.log("Not your turn!");
      return;
    }

    const piece = board[row][col];
    
    // אם אין כלי נבחר וזה הכלי של השחקן, בחר אותו
    if (!selectedPiece && piece && piece.owner === playerId) {
      console.log("Selecting piece at:", row, col);
      setSelectedPiece({ row, col });
    } 
    // אם יש כלי נבחר והמיקום החדש ריק או של היריב, נסה לבצע מהלך
    else if (selectedPiece && (!piece || piece.owner !== playerId)) {
      console.log("Attempting move from", selectedPiece, "to", row, col);
      onMove(
        { row: selectedPiece.row, col: selectedPiece.col },
        { row, col }
      );
      setSelectedPiece(null);
    } 
    // אם נבחר כלי אחר של השחקן, החלף את הבחירה
    else if (piece && piece.owner === playerId) {
      console.log("Changing selection to:", row, col);
      setSelectedPiece({ row, col });
    } 
    // בכל מקרה אחר, בטל את הבחירה
    else {
      console.log("Clearing selection");
      setSelectedPiece(null);
    }
  };

  // בדיקה מי השחקן הראשון במשחק
  const findFirstPlayer = () => {
    // חיפוש כלי בשורות התחתונות (של השחקן הראשון)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] && board[row][col].owner) {
          return board[row][col].owner;
        }
      }
    }
    return null;
  };

  const firstPlayer = findFirstPlayer();

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => {
            const isBlackCell = (rowIndex + colIndex) % 2 === 1;
            const isSelected = selectedPiece && 
                              selectedPiece.row === rowIndex && 
                              selectedPiece.col === colIndex;
            
            return (
              <div 
                key={colIndex} 
                className={`cell ${isBlackCell ? 'black' : 'white'} ${isSelected ? 'selected' : ''}`}
                onClick={() => isBlackCell && handleClick(rowIndex, colIndex)}
              >
                {cell && isBlackCell && (
                  <div 
                    className={`piece ${cell.owner === firstPlayer ? 'player1' : 'player2'} ${cell.isKing ? 'king' : ''}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;