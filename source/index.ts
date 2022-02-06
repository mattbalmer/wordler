import { ALPHABET, Wordler, BaseRecommendation } from 'wordler-core';
import { Evaluation, PLACEMENT, WORD_LENGTH, Wordle } from 'wordler-core/wordle';
import { FREQUENCY_BY_WORD } from '../data/frequency-by-word';

const DEBUG_WORDS = [
  // 'mauls',
];

export type Recommendation = BaseRecommendation<{
  infoScore: number;
}>

export const getFirstDigitPos = (frequency: number): number => {
  const MIN = 0;
  const MAX = 10;
  return frequency > 0
    ? Math.max(
      MIN,
      Math.min(
        -Math.floor(Math.log10(frequency)),
        MAX
      )
    )
    : MAX;
}

export const getFrequencyWeight = (word: string, round: number): number => {
  const frequency = FREQUENCY_BY_WORD[word];
  const WEIGHT = [
    0.001,
    0.005,
    0.01,
    0.02,
    0.03,
    0.06,
  ];

  const firstDigitPos = getFirstDigitPos(frequency);

  return 1 - (firstDigitPos * WEIGHT[round]);
}

export const countLetters = (words: string[], validLetters?: string): Record<string, number> => {
  const letterCount = ALPHABET.split('').reduce((map, letter) => {
    map[letter] = 0;
    return map;
  }, {});

  words.forEach(word => {
    const letters = word.split('');
    letters.forEach(letter => {
      if (validLetters && !validLetters.includes(letter)) {
        return;
      }
      if (letterCount[letter]) {
        letterCount[letter] += 1;
      } else {
        letterCount[letter] = 1;
      }
    });
  });

  return letterCount;
}

export const generatePossibilities = (evaluations: Evaluation[]): {
  possibilities: string[],
  requiredLetters: string[],
  unknownLetters: string,
} => {
  const possibilities: string[] = Array.from({ length: WORD_LENGTH }, () =>
    ALPHABET
  );

  let unknownLetters = `${ALPHABET}`;

  const requiredLetters = new Set<string>();

  evaluations.forEach(({ guess, results }) => {
    results.forEach((result, i) => {
      const letter = guess[i];
      unknownLetters = unknownLetters.replace(letter, '');
      if (result === PLACEMENT.CORRECT) {
        possibilities[i] = letter;
        requiredLetters.add(letter);
      } else if (result === PLACEMENT.PRESENT) {
        possibilities[i] = possibilities[i].replace(letter, '');
        requiredLetters.add(letter);
      } else {
        if (!requiredLetters.has(letter)) {
          possibilities.forEach((possibility, iP) => {
            possibilities[iP] = possibilities[iP].replace(letter, '');
          });
        }
      }
    });
  });

  return {
    possibilities,
    requiredLetters: Array.from(requiredLetters),
    unknownLetters,
  };
}

export const isWordPossible = (word: string, possibleLetters: string[], requiredLetters: string[]): boolean => {
  const areLettersPossible = word.split('').every((letter, i) => {
    const validLettersAtIndex = possibleLetters[i];
    return validLettersAtIndex.includes(letter);
  });

  const containsRequiredLetters = requiredLetters.every(letter => word.includes(letter));

  return areLettersPossible && containsRequiredLetters;
}

export const filterWords = (words: readonly string[], evaluations: Evaluation[], maxMagnitude?: number): string[] => {
  const { possibilities, requiredLetters } = generatePossibilities(evaluations);

  const validWords = words.filter((word) => {
    const isPossible = isWordPossible(word, possibilities, requiredLetters);
    const isWithinMaxMagnitude = maxMagnitude !== undefined
      ? getFirstDigitPos(FREQUENCY_BY_WORD[word]) <= maxMagnitude
      : true;
    return isPossible && isWithinMaxMagnitude;
  });

  return validWords;
}

export const getWordsWithNewInfo = (words: readonly string[], evaluations: Evaluation[], minNewLetters: number, maxMagnitude?: number): string[] => {
  const { possibilities, requiredLetters, unknownLetters } = generatePossibilities(evaluations);

  const validWords = words.filter((word) => {
    const numNewLetters = word.split('').filter(letter => unknownLetters.includes(letter)).length;
    const hasEnoughNewInfo = numNewLetters >= minNewLetters;
    const isWithinMaxMagnitude = maxMagnitude !== undefined
      ? getFirstDigitPos(FREQUENCY_BY_WORD[word]) <= maxMagnitude
      : true;
    return hasEnoughNewInfo && isWithinMaxMagnitude;
  });

  return validWords;
};

export const sortWordsForInfo = (words: string[], letterCounts: Record<string, number>, evaluations: Evaluation[]): [string, number][] => {
  const guesses = evaluations.map(({ guess }) => guess);

  const mapped: [string, number][] = words.map(word => {
    if (guesses.includes(word)) {
      return [word, 0];
    }
    const letters = word.split('');
    const used = {};
    const infoScore = letters.reduce((sum, letter, i) => {
      const isUsed = used[letter];
      const score = (!isUsed ? letterCounts[letter] : 0);
      if (!isUsed) {
        used[letter] = true;
      }

      if (DEBUG_WORDS.includes(word)) {
        console.log(`${word} : score`, letter, score, used);
      }

      return sum + score;
    }, 0);

    if (DEBUG_WORDS.includes(word)) {
      console.log(`${word} : infoScore`, infoScore);
    }

    const weightedScore = infoScore * getFrequencyWeight(word, evaluations.length);
    return [word, weightedScore];
  });

  return mapped.sort((a, b) =>
    b[1] - a[1]
  );
}

export const getRecommendations = (wordle: Wordle): Recommendation[] => {
  const remainingGuesses = wordle.maxGuesses - wordle.evaluations.length;

  const guessedWords = wordle.evaluations.map(e => e.guess);
  const allowedGuesses = wordle.allowedGuesses.filter(word => !guessedWords.includes(word));

  const maxMagnitude = 8; // - [0,0,1,1,2,3][wordle.evaluations.length];

  const possibleWords = filterWords(
    allowedGuesses,
    wordle.evaluations,
    maxMagnitude
  );

  // console.log('possibleWords', possibleWords);
  // console.log('possibilities', generatePossibilities(wordle.evaluations));
  // console.log('remainingGuesses',  [wordle.maxGuesses, wordle.evaluations.length], remainingGuesses);

  const { unknownLetters } = generatePossibilities(wordle.evaluations);
  const letterCounts = countLetters(possibleWords, unknownLetters);

  const totalAvailablePoints = Object.values(letterCounts).reduce((sum, v) => sum + v, 0);

  // console.log('letterCounts', letterCounts, unknownLetters);

  if (possibleWords.length <= Math.min(2, remainingGuesses) || totalAvailablePoints < 6) {
    const sortedRecommendations = possibleWords.map(word => ({
      word,
      infoScore: FREQUENCY_BY_WORD[word]
    })).sort((a, b) =>
      b.infoScore - a.infoScore
    );
    // console.log('answer', sortedRecommendations);
    return sortedRecommendations;
  } else {
    const allValidGuesses = getWordsWithNewInfo(
      allowedGuesses,
      wordle.evaluations,
      3,
      maxMagnitude
    );

    const sortedGuesses = sortWordsForInfo(
      allValidGuesses,
      letterCounts,
      wordle.evaluations
    );

    // console.log('sorted', sortedGuesses);

    return sortedGuesses.map(([word, infoScore]) => ({
      word,
      infoScore,
    }));
  }
}

export const Solver: Wordler<Recommendation> = {
  getNextGuess(wordle: Wordle): string {
    const recommendations = getRecommendations(wordle);
    if (recommendations.length < 1) {
      throw `no recommendations for word ${wordle.answer} : "${wordle.evaluations.map(e => e.guess).join(', ')}"`
    }
    return recommendations[0].word;
  },

  getTopRecommendations(wordle: Wordle): Recommendation[] {
    const recommendations = getRecommendations(wordle);
    return recommendations.slice(0, 20);
  }
}