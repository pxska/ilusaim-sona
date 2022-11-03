import React, {useEffect, useRef, useState} from 'react';

import {shuffleArray, sortStats} from '../utils';

const lemmasBaseUrl = 'https://elo.eki.ee/etLex/api/v1.0/projects/etLex/lemmas?pos=S';

const ScoreRow = ({word, score}) => (
  <tr>
    <td className="border px-4 py-2">{word}</td>
    <td className="border px-4 py-2">{score}</td>
  </tr>
);

const Home = () => {
  const [firstWord, setFirstWord] = useState(null);
  const [secondWord, setSecondWord] = useState(null);

  const [gameEnded, setGameEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [wordCount, setWordCount] = useState(null);

  const [gameCombinations, setGameCombinations] = useState([]);

  const playTimes = useRef(0);
  const idxTracker = useRef(0);

  const getWordTotalCount = () => {
    fetch(`${lemmasBaseUrl}&limit=1`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.total_count) {
          setWordCount(data.total_count);
        }
      })
      .catch((err) => {
        console.error(`Error: ${err}`);

        setWordCount(0);
      });
  };

  const generateTwoRandomNumbers = () => {
    const firstNumber = Math.floor(Math.random() * wordCount);
    const secondNumber = Math.floor(Math.random() * wordCount);

    return {firstNumber, secondNumber};
  };

  const refreshWords = ({firstNumber, secondNumber}) => {
    const urls = [
      `${lemmasBaseUrl}&offset=${firstNumber}&limit=1`,
      `${lemmasBaseUrl}&offset=${secondNumber}&limit=1`
    ];

    Promise.all(urls.map(url => fetch(url).then(res => res.json())))
      .then(data => {
        setFirstWord(data[0]?.items[0]?.lemma);
        setSecondWord(data[1]?.items[0]?.lemma);

        setIsLoading(false);
      })
      .catch(err => {
        console.error(`Error: ${err}`);
      });
  };

  const handleWordClick = e => {
    const word = e.target.innerText;

    setStats({
      ...stats,
      [word]: stats[word] ? parseInt(stats[word]) + 1 : 1
    });

    playTimes.current += 1;

    if (playTimes.current <= 10) {
      const randomNumbers = generateTwoRandomNumbers();

      refreshWords(randomNumbers);
    } else if (gameCombinations.length >= 1) {
      const currIdx = idxTracker.current;

      if (currIdx === gameCombinations.length - 1) {
        setGameEnded(true);
      }

      setFirstWord(gameCombinations[currIdx][0]);
      setSecondWord(gameCombinations[currIdx][1]);

      idxTracker.current += 1;
    } else {
      const statsMap = Object.keys(stats);

      const result = statsMap.flatMap(
        (v, i) => statsMap.slice(i + 1).map((w) => [v, w])
      );

      setGameCombinations(shuffleArray(result));

      setFirstWord(result[idxTracker.current][0]);
      setSecondWord(result[idxTracker.current][1]);

      idxTracker.current += 1;
    }
  };

  useEffect(() => {
    getWordTotalCount();
  }, []);

  useEffect(() => {
    if (wordCount >= 1) {
      const firstNumber = Math.floor(Math.random() * wordCount);
      const secondNumber = Math.floor(Math.random() * wordCount);

      refreshWords({firstNumber, secondNumber});
    }
  }, [wordCount]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center font-sans">
      <div className="text-3xl font-bold mb-8">Ilusaim eestikeelne sõna 🇪🇪</div>
      {(!isLoading && !gameEnded) && (<>
        <p>Kumb eestikeelne sõna on sinu arvates ilusam?</p>
        <div className="mt-8 flex gap-8">
          <button
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            onClick={handleWordClick}
          >
            {firstWord}
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            onClick={handleWordClick}
          >
            {secondWord}
          </button>
        </div>
      </>
      )}
      {gameEnded && (
        <table className="table-auto w-1/2">
          <thead>
            <tr>
              <th>Sõna</th>
              <th>Skoor</th>
            </tr>
          </thead>
          <tbody>
            {sortStats(stats).map(({word, score}) => (
              <ScoreRow key={word} score={score} word={word} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;
