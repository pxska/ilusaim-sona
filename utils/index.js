export const shuffleArray = array => {
  let currentIdx = array.length;
  let randomIdx;

  while (currentIdx !== 0) {
    randomIdx = Math.floor(Math.random() * currentIdx);
    currentIdx--;

    [array[currentIdx], array[randomIdx]] = [array[randomIdx], array[currentIdx]];
  }

  return array;
};

export const sortStats = stats => {
  const sortedStats = Object.entries(stats).sort(([, a], [, b]) => b - a);

  return sortedStats.map(([k, v]) => ({word: k, score: v}));
};
