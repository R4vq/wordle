import Tile from "./Tile";
export default function Board({ board, statuses }) {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((letter, colIndex) => (
            <Tile
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