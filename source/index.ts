import { ALPHABET, Wordler, BaseRecommendation } from 'wordler-core';
import { Evaluation, PLACEMENT, WORD_LENGTH, Wordle } from 'wordler-core/wordle';
import { FREQUENCY_BY_WORD } from '../data/frequency-by-word';

export type Recommendation = BaseRecommendation<{
  infoScore: number;
}>

export const getFrequencyWeight = (word: string, round: number): number => {
  const frequency = FREQUENCY_BY_WORD[word];
  const MIN = 0;
  const MAX = 10;
  const WEIGHT = [
    0.01,
    0.02,
    0.03,
    0.04,
    0.06,
    0.08,
  ];

  const firstDigitPos = frequency > 0
    ? Math.max(
        MIN,
        Math.min(
          -Math.floor(Math.log10(frequency)),
          MAX
        )
      )
    : MAX;

  return 1 - (firstDigitPos * WEIGHT[round]);
}

export const countLetters = (words: string[]): Record<string, number> => {
  const letterCount = {};

  words.forEach(word => {
    const letters = word.split('');
    letters.forEach(letter => {
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
} => {
  const possibilities: string[] = Array.from({ length: WORD_LENGTH }, () =>
    ALPHABET
  );

  const requiredLetters = new Set<string>();

  evaluations.forEach(({ guess, results }) => {
    results.forEach((result, i) => {
      if (result === PLACEMENT.CORRECT) {
        possibilities[i] = guess[i];
        requiredLetters.add(guess[i]);
      } else if (result === PLACEMENT.PRESENT) {
        possibilities[i] = possibilities[i].replace(guess[i], '');
        requiredLetters.add(guess[i]);
      } else {
        possibilities.forEach((possibility, iP) => {
          possibilities[iP] = possibilities[iP].replace(guess[i], '');
        });
      }
    });
  });

  return {
    possibilities,
    requiredLetters: Array.from(requiredLetters),
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

export const filterWords = (words: readonly string[], evaluations: Evaluation[]): [string, number][] => {
  const { possibilities, requiredLetters } = generatePossibilities(evaluations);

  const validWords = words.filter((word) => {
    return isWordPossible(word, possibilities, requiredLetters);
  });

  // console.log('vaid words', words);

  return sortWordsForInfo(validWords, evaluations);
}

export const sortWordsForInfo = (words: string[], evaluations: Evaluation[]): [string, number][] => {
  const letterCounts = countLetters(words);

  const guesses = evaluations.map(({ guess }) => guess);

  const mapped: [string, number][] = words.map(word => {
    if (guesses.includes(word)) {
      return [word, 0];
    }
    const letters = word.split('');
    const used = {};
    const rawScore = letters.reduce((sum, letter, i) => {
      const isUsed = used[letter];
      const score = (!isUsed ? letterCounts[letter] : 0);
      if (!isUsed) {
        used[letter] = true;
      }
      return sum + score;
    }, 0);
    const weightedScore = rawScore * getFrequencyWeight(word, evaluations.length);
    return [word, weightedScore];
  });

  return mapped.sort((a, b) =>
    b[1] - a[1]
  );
}

export const Solver: Wordler<Recommendation> = {
  getNextGuess(wordle: Wordle): string {
    const answers = filterWords(
      wordle.allowedGuesses,
      wordle.evaluations
    );

    // console.log('answers', answers);

    return answers?.[0]?.[0] || '-----';
  },

  getTopRecommendations(wordle: Wordle): Recommendation[] {
    const answers = filterWords(
      wordle.allowedGuesses,
      wordle.evaluations
    );

    return answers.slice(0, 20).map(([word, weight]) => ({
      word,
      infoScore: weight,
    }));
  }
}