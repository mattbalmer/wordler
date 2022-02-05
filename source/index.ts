import { Wordler, BaseRecommendation } from 'wordler-core';
import { Wordle } from 'wordler-core/wordle';

export type Recommendation = BaseRecommendation<{
  score: number,
}>

export const Solver: Wordler<Recommendation> = {
  // This function is used for the chrome extension
  getTopRecommendations(wordle: Wordle): Recommendation[] {
    const shuffled = wordle.allowedGuesses
      .slice(0)
      .sort(() => 0.5 - Math.random());

    const selected = shuffled.slice(0, 20);

    return selected.map((word) => ({
      word,
      score: Math.random(),
    }));
  },

  // This function is used in testSolver
  getNextGuess(wordle: Wordle): string {
    return this.getTopRecommendations(wordle)[0].word;
  },
}