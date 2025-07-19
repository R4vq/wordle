import "./App.css";

const KEY_ROWS_PL = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  ["Ą", "Ć", "Ę", "Ł", "Ń", "Ó", "Ś", "Ź", "Ż"],
];

const KEY_ROWS_EN = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"]
];

export default function Keyboard({ onKeyPress, usedLetters, lang }) {
  const keyRows = lang === "pl" ? KEY_ROWS_PL : KEY_ROWS_EN;

  return (
    <div className="keyboard">
      {keyRows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const status = usedLetters[key.toLowerCase()];
            return (
              <button
                key={key}
                className={`key ${status || ""}`}
                onClick={() => onKeyPress(key)}
              >
                {key === "Backspace" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
