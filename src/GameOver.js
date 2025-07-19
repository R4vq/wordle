export default function GameOver({ correctWord, isGameWon, onClose, lang, onRestart }) {
  const messages = {
    pl: {
      won: "Gratulacje!",
      lost: "Nie udało się!",
      correctWord: "Poprawne słowo to:",
      playAgain: "Zagraj ponownie"
    },
    en: {
      won: "Congratulations!",
      lost: "Better luck next time!",
      correctWord: "The correct word was:",
      playAgain: "Play again"
    }
  };

  const text = messages[lang] || messages.pl;

  return (
    <div className="game-over">
      <div className="game-over-box">
        <h2>{isGameWon ? text.won : text.lost}</h2>
        <p>{text.correctWord} <strong>{correctWord.toUpperCase()}</strong></p>
        <button onClick={onClose} id="btnClose">X</button>
        {onRestart && (
          <button onClick={onRestart} id="btnPlayAgain">{text.playAgain}</button>
        )}
      </div>
    </div>
  );
}
