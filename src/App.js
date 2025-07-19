import './App.css';
import Board from './Board';
import GameOver from './GameOver';
import Keyboard from './Keyboard';
import { useState, useEffect } from 'react';

const initBoard = () => Array(6).fill().map(() => Array(5).fill(''));
const initStatuses = () => Array(6).fill().map(() => Array(5).fill(''));
const initBoardData = () => ({
  board: initBoard(),
  statuses: initStatuses(),
  usedLetters: {},
  currentRow: 0,
  currentCol: 0
});

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [gameMode, setGameMode] = useState('daily');
  const [language, setLanguage] = useState('pl');
  const [wordLists, setWordLists] = useState({ pl: [], en: [] });
  const [boards, setBoards] = useState({
    daily: { pl: initBoardData(), en: initBoardData() },
    free: { pl: initBoardData(), en: initBoardData() }
  });
  const [targetWords, setTargetWords] = useState({
    daily: { pl: '', en: '' },
    free: { pl: '', en: '' }
  });
  const [isWon, setIsWon] = useState({
    daily: { pl: false, en: false },
    free: { pl: false, en: false }
  });
  const [isGameOver, setIsGameOver] = useState({
    daily: { pl: false, en: false },
    free: { pl: false, en: false }
  });
 
  const [isFreeGameFinished, setIsFreeGameFinished] = useState({
    pl: false,
    en: false,
  });
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const loadWords = async (lang) => {
      const res = await fetch(`/five_letter_words_${lang}.txt`);
      const text = await res.text();
      const lines = text
        .split('\n')
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length === 5 && (lang === 'en' || /^[a-ząćęłńóśźż]+$/.test(w)));

      setWordLists(prev => ({ ...prev, [lang]: lines }));

      const selectedWord = selectWord(lines, lang, gameMode);
      setTargetWords(prev => ({
        ...prev,
        [gameMode]: {
          ...prev[gameMode],
          [lang]: selectedWord
        }
      }));
    };

    loadWords(language);
  }, [language, gameMode]);

  const selectWord = (lines, lang, mode) => {
    if (mode === 'daily') {
      const dateStr = new Date().toISOString().slice(0, 10);
      const hash = [...dateStr + lang].reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return lines[hash % lines.length];
    } else {
      return lines[Math.floor(Math.random() * lines.length)];
    }
  };

  const handleKeyPress = (key) => {
    const current = boards[gameMode][language];
    if (isWon[gameMode][language] || current.currentRow >= 6) return;

    const letterRegex = language === 'pl'
      ? /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]$/
      : /^[a-zA-Z]$/;

    const newBoard = [...current.board];
    let { currentRow, currentCol, statuses, usedLetters } = current;

    if (key === 'Backspace') {
      if (currentCol > 0) {
        newBoard[currentRow][currentCol - 1] = '';
        updateBoardState(currentRow, currentCol - 1, newBoard, statuses, usedLetters);
      }
    } else if (key === 'Enter') {
      if (currentCol === 5) {
        const word = newBoard[currentRow].join('').toLowerCase();
        if (wordLists[language].includes(word)) {
          wordCheck(word, currentRow, newBoard, statuses, usedLetters);
        }
      }
    } else if (letterRegex.test(key)) {
      if (currentCol < 5) {
        newBoard[currentRow][currentCol] = key.toUpperCase();
        updateBoardState(currentRow, currentCol + 1, newBoard, statuses, usedLetters);
      }
    }
  };

  const updateBoardState = (row, col, board, statuses, usedLetters) => {
    setBoards(prev => ({
      ...prev,
      [gameMode]: {
        ...prev[gameMode],
        [language]: {
          ...prev[gameMode][language],
          board,
          statuses,
          usedLetters,
          currentRow: row,
          currentCol: col
        }
      }
    }));
  };

  const wordCheck = (inputWord, currentRow, board, statuses, usedLetters) => {
    const correctWord = targetWords[gameMode][language].toLowerCase();
    const statusRow = ['', '', '', '', ''];
    const letterCounts = {};

    for (const letter of correctWord) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    for (let i = 0; i < 5; i++) {
      if (inputWord[i] === correctWord[i]) {
        statusRow[i] = 'correct';
        letterCounts[inputWord[i]] -= 1;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (statusRow[i] === '') {
        const letter = inputWord[i];
        if (correctWord.includes(letter) && letterCounts[letter] > 0) {
          statusRow[i] = 'present';
          letterCounts[letter] -= 1;
        } else {
          statusRow[i] = 'absent';
        }
      }
    }

    const newStatuses = [...statuses];
    newStatuses[currentRow] = statusRow;

    const newUsed = { ...usedLetters };
    for (let i = 0; i < 5; i++) {
      const letter = inputWord[i];
      if (statusRow[i] === 'correct') newUsed[letter] = 'correct';
      else if (statusRow[i] === 'present' && newUsed[letter] !== 'correct') newUsed[letter] = 'present';
      else if (!newUsed[letter]) newUsed[letter] = 'absent';
    }

    const won = inputWord === correctWord;
    setBoards(prev => ({
      ...prev,
      [gameMode]: {
        ...prev[gameMode],
        [language]: {
          board,
          statuses: newStatuses,
          usedLetters: newUsed,
          currentRow: currentRow + 1,
          currentCol: 0
        }
      }
    }));

    if (won) {
      setIsWon(prev => ({
        ...prev,
        [gameMode]: {
          ...prev[gameMode],
          [language]: true
        }
      }));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setIsGameOver(prev => ({
        ...prev,
        [gameMode]: {
          ...prev[gameMode],
          [language]: true
        }
      })), 1000);
    } else if (currentRow === 5) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setIsGameOver(prev => ({
        ...prev,
        [gameMode]: {
          ...prev[gameMode],
          [language]: true
        }
      })), 1000);
    }

    if (gameMode === 'free' && (won || currentRow === 5)) {
      setIsFreeGameFinished(prev => ({
        ...prev,
        [language]: true
      }));
    }
  };

  const handleRestart = () => {
    setBoards(prev => ({
      ...prev,
      free: {
        ...prev.free,
        [language]: initBoardData()
      }
    }));
    setIsWon(prev => ({
      ...prev,
      free: {
        ...prev.free,
        [language]: false
      }
    }));
    setIsGameOver(prev => ({
      ...prev,
      free: {
        ...prev.free,
        [language]: false
      }
    }));
    setIsFreeGameFinished(prev => ({
      ...prev,
      [language]: false
    }));

    const words = wordLists[language];
    const index = Math.floor(Math.random() * words.length);
    const newWord = words[index];

    setTargetWords(prev => ({
      ...prev,
      free: {
        ...prev.free,
        [language]: newWord
      }
    }));
  };

  const handleCloseGameOver = () => {
    setIsGameOver(prev => ({
      ...prev,
      [gameMode]: {
        ...prev[gameMode],
        [language]: false
      }
    }));
  };

  const handleKeyDown = (e) => {
    handleKeyPress(e.key);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const current = boards[gameMode][language];

  return (
    <div className={`App ${shake ? 'shake' : ''}`}>
      <div className="settings-container">
        <button
          id="settingsToggle"
          className="hamburger"
          onClick={() => setShowSettings(!showSettings)}
        >
          &#9776;
        </button>

        <div className={`settings ${showSettings ? '' : 'hidden'}`}>
          <div className="settingsText">{language === 'pl' ? 'Ustawienia' : 'Settings'}</div>
          <button
            id="flag"
            onClick={(e) => {
              setLanguage(language === 'pl' ? 'en' : 'pl');
              e.currentTarget.blur();
            }}
          >
            {language === 'en' ? (
              <img
                src="https://flagcdn.com/48x36/gb.png"
                srcSet="https://flagcdn.com/96x72/gb.png 2x, https://flagcdn.com/144x108/gb.png 3x"
                width="48"
                height="36"
                alt="United Kingdom"
              />
            ) : (
              <img
                src="https://flagcdn.com/48x36/pl.png"
                srcSet="https://flagcdn.com/96x72/pl.png 2x, https://flagcdn.com/144x108/pl.png 3x"
                width="48"
                height="36"
                alt="Poland"
              />
            )}
          </button>

          <button
          className='btnGameMode'
            onClick={() => setGameMode('daily')}
            disabled={gameMode === 'daily'}
          >
            {language === 'pl' ? 'Zagraj codzienną grę' : 'Play daily'}
          </button>

          <button
           className='btnGameMode'
            onClick={() => setGameMode('free')}
            disabled={gameMode === 'free'}
          >
            {language === 'pl' ? 'Graj swobodnie' : 'Play freely'}
          </button>
        </div>
      </div>
      
      <span className='gameModeText'>
          {language === 'pl'
            ? `Tryb gry: ${gameMode === 'daily' ? 'Codzienny' : 'Swobodny'}`
            : `Game mode: ${gameMode === 'daily' ? 'Daily' : 'Play freely'}`
          }
        </span>

      <Board board={current.board} statuses={current.statuses} />
      
      <Keyboard
        onKeyPress={handleKeyPress}
        usedLetters={current.usedLetters}
        lang={language}
      />
      {gameMode === 'free' && isFreeGameFinished[language] && (
        <button id="btnPlayAgain" onClick={handleRestart}>
          {language === 'pl' ? 'Zagraj ponownie' : 'Play Again'}
        </button>
      )}
      {isGameOver[gameMode][language] && (
        <GameOver
          correctWord={targetWords[gameMode][language]}
          isGameWon={isWon[gameMode][language]}
          onClose={handleCloseGameOver}
          lang={language}
          onRestart={gameMode === 'free' ? handleRestart : null}
        />
      )}

      
    </div>
  );
}

export default App;
