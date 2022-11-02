import React, {useCallback, useEffect, useRef, useState} from 'react';

import {shuffleArray} from './utils';

import styles from '../styles/Home.module.css';

const lemmasBaseUrl = 'https://elo.eki.ee/etLex/api/v1.0/projects/etLex/lemmas?pos=S';

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

  const generateTwoRandomNumbers = useCallback(() => {
    const firstNumber = Math.floor(Math.random() * wordCount);
    const secondNumber = Math.floor(Math.random() * wordCount);

    return {firstNumber, secondNumber};
  }, [wordCount]);

  const refreshWords = ({firstNumber, secondNumber}) => {
    const urls = [
      `${lemmasBaseUrl}&offset=${firstNumber}&limit=1`,
      `${lemmasBaseUrl}&offset=${secondNumber}&limit=1`
    ];

    Promise.all(urls.map((url) => fetch(url).then((response) => response.json())))
      .then((data) => {
        setFirstWord(data[0].items[0].lemma);
        setSecondWord(data[1].items[0].lemma);

        setIsLoading(false);
      })
      .catch((err) => {
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
      refreshWords(generateTwoRandomNumbers());
    } else {
      if (gameCombinations.length >= 1) {
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
    }
  };

  useEffect(() => {
    getWordTotalCount();
  }, []);

  useEffect(() => {
    if (wordCount >= 1) {
      refreshWords(generateTwoRandomNumbers());
    }
  }, [wordCount, generateTwoRandomNumbers]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>Ilusaim eestikeelne sõna</div>
      <p>Kumb eestikeelne sõna on sinu arvates ilusam?</p>
      {!isLoading && (
        <div className={styles.wordscontainer}>
          <button className={styles.button} onClick={handleWordClick}>{firstWord}</button>
          <button className={styles.button} onClick={handleWordClick}>{secondWord}</button>
        </div>
      )}
      {gameEnded && (
        <div>{Object.entries(stats).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</div>
      )}
    </div>
  );
};

export default Home;
