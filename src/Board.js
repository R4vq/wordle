import Tile from "./Tile";
export default function Board({ board, statuses,invalidRow }) {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className={`row`} key={rowIndex}>
          {row.map((letter, colIndex) => (
            <Tile
              className={invalidRow === rowIndex ? 'invalid' : ''}
              key={colIndex}
              letter={letter}
              status={statuses[rowIndex]?.[colIndex] || ""}
            />
          ))}
        </div>
      ))}
    </div>
  );
}