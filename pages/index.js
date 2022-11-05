import React, {useEffect, useRef, useState} from 'react';

import {shuffleArray, sortStats} from '../utils';

const lemmasBaseUrl = 'https://elo.eki.ee/etLex/api/v1.0/projects/etLex/lemmas?pos=S';

const ScoreRow = ({word, score}) => (
  <tr>
    {[word, score].map((item, idx) => <td key={item} className="table-cell">{item}</td>)}
  </tr>
);

const generateRandomNumber = max => Math.floor(Math.random() * max);

const Home = () => {
  const [words, setWords] = useState([]);
  const [firstWord, setFirstWord] = useState(null);
  const [secondWord, setSecondWord] = useState(null);

  const [gameEnded, setGameEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  const [gameCombinations, setGameCombinations] = useState([]);

  const playTimes = useRef(0);
  const idxTracker = useRef(0);

  const getAllWords = () => {
    setIsLoading(true);

    fetch(lemmasBaseUrl)
      .then(res => res.json())
      .then(data => {
        if (data?.items) {
          setWords(data.items?.map(item => item?.lemma));

          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error(`Error: ${err}`);

        setIsLoading(false);
      });
  };

  const generateTwoRandomNumbers = () => ({
    firstNumber: generateRandomNumber(words?.length),
    secondNumber: generateRandomNumber(words?.length)
  });

  const generateGameCombinations = stats => {
    const statsKeys = Object.keys(stats);
    const mapStatsAsPairs = statsKeys.flatMap(
      (v, i) => statsKeys.slice(i + 1).map((w) => [v, w])
    );

    return shuffleArray(mapStatsAsPairs);
  };

  const refreshWords = ({basis, firstNumber, secondNumber}) => {
    setFirstWord(basis[firstNumber]);
    setSecondWord(basis[secondNumber]);
  };

  const handleWordClick = e => {
    const word = e.target.innerText;

    setStats({
      ...stats,
      [word]: stats[word] ? parseInt(stats[word]) + 1 : 1
    });

    playTimes.current += 1;

    if (playTimes.current <= 10) {
      const {firstNumber, secondNumber} = generateTwoRandomNumbers();

      refreshWords({basis: words, firstNumber, secondNumber});
    } else {
      const currIdx = idxTracker.current;
      const currentGameCombinations = generateGameCombinations(stats);
      const pickedCombinations =
        gameCombinations.length >= 1 ? gameCombinations : currentGameCombinations;

      if (gameCombinations.length === 0) {
        setGameCombinations(currentGameCombinations);
      }

      if (currIdx === gameCombinations.length - 1) {
        setGameEnded(true);
      }

      setFirstWord(pickedCombinations[currIdx][0]);
      setSecondWord(pickedCombinations[currIdx][1]);

      idxTracker.current += 1;
    }
  };

  useEffect(() => {
    if (words.length >= 1) {
      refreshWords({
        basis: words,
        firstNumber: generateRandomNumber(words.length),
        secondNumber: generateRandomNumber(words.length)
      });
    }
  }, [words]);

  useEffect(() => getAllWords(), []);

  return (
    <div className="container">
      <div className="text-3xl text-center font-bold mb-8">Ilusaim eestikeelne sõna 🇪🇪</div>
      {isLoading && (
        <div className="text-xl font-bold mb-8">Laadin…</div>
      )}
      {(!isLoading && !gameEnded) && (<>
        <p>Kumb eestikeelne sõna on sinu arvates ilusam?</p>
        <div className="mt-8 flex gap-8 w-full">
          <div className="half-width-center">
            <button className="btn-primary" onClick={handleWordClick}>
              {firstWord}
            </button>
          </div>
          <div className="half-width-center">
            <button className="btn-primary" onClick={handleWordClick}>
              {secondWord}
            </button>
          </div>
        </div>
      </>
      )}
      {gameEnded && (
        <table className="table-auto w-1/2">
          <thead>
            <tr>
              <th className="table-header-cell">Sõna</th>
              <th className="table-header-cell">Skoor</th>
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
