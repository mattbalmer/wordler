import { describe, it } from 'mocha';
import { expect } from 'chai'
import { testSolver } from 'wordler-core/tests/helpers';
import { generatePossibilities, getFrequencyWeight, Solver } from '@solver/index';
import { MAX_GUESSES, PLACEMENT, Wordle } from 'wordler-core/wordle';
import { SAMPLE_100_WORDS } from 'wordler-core/data/sample-100';
import { OFFICIAL_WORDS } from 'wordler-core/data/official';

const FAILING_WORDS = [
  'mauls',
  // 'pouts',
  // 'bight',
  // 'banes',
  // 'milch',
  // 'minny',
  // 'arrow',
  // 'alpha',
  // 'spilt',
  // 'musts',
];

describe('Wordler', () => {
  it('runs against the test words', () => {
    const {
      duration,
      average,
      distribution
    } = testSolver(Solver);

    console.log('ms:', duration);
    console.log('average:', average);
    console.log(JSON.stringify(distribution, null, 2));

    expect(average).to.be.at.most(6);
  });

  describe('test words', () => {
    SAMPLE_100_WORDS.forEach(word => {
      it(`should work for word ${word}`, () => {
        const wordle = new Wordle(word, {
          maxGuesses: MAX_GUESSES,
          allowedGuesses: OFFICIAL_WORDS.slice(0),
        });

        for(let i = 0; i < MAX_GUESSES; i++) {
          const nextGuess = Solver.getNextGuess(wordle);
          wordle.guess(nextGuess);

          if (wordle.isSolved) {
            break;
          }
        }

        const numGuesses = wordle.evaluations.length + (wordle.isSolved ? 0 : 1);

        expect(numGuesses).to.be.at.most(6);
      });
    });
  });

  describe('failing words', () => {
    FAILING_WORDS.forEach(word => {
      it(`should work for word ${word}`, () => {
        const wordle = new Wordle(word, {
          maxGuesses: MAX_GUESSES,
          allowedGuesses: OFFICIAL_WORDS.slice(0),
        });

        for(let i = 0; i < MAX_GUESSES; i++) {
          const nextGuess = Solver.getNextGuess(wordle);
          console.log('guess', i + 1, nextGuess);
          wordle.guess(nextGuess);

          if (wordle.isSolved) {
            break;
          }
        }

        const numGuesses = wordle.evaluations.length + (wordle.isSolved ? 0 : 1);

        expect(numGuesses).to.be.at.most(6);
      });
    });
  });

  describe('generatePossibilities()', () => {
    it('works', () => {
      const wordle = new Wordle('crepe');
      wordle.guess('caker');

      expect(wordle.evaluations[0].results).to.deep.equal([
        PLACEMENT.CORRECT,
        PLACEMENT.ABSENT,
        PLACEMENT.ABSENT,
        PLACEMENT.PRESENT,
        PLACEMENT.PRESENT,
      ]);

      const { possibilities, requiredLetters, unknownLetters } = generatePossibilities(wordle.evaluations);

      expect(requiredLetters).to.deep.equal(['c', 'e', 'r']);
      expect(possibilities).to.deep.equal([
        'c',
        'bcdefghijlmnopqrstuvwxyz',
        'bcdefghijlmnopqrstuvwxyz',
        'bcdfghijlmnopqrstuvwxyz',
        'bcdefghijlmnopqstuvwxyz',
      ]);
      expect(unknownLetters).to.deep.equal('bdfghijlmnopqstuvwxyz');
    });
  });

  describe('getFrequencyWeight()', () => {
    it('returns valid frequency weights', () => {
      const weight = getFrequencyWeight('abaca', 0); // 6 pos
      const expected = 1 - (0.01 * 6);
      expect(weight).to.deep.equal(expected);
    });

    it('returns max for unknown', () => {
      const weight = getFrequencyWeight('aahed', 0); // -1 (unknown)
      const expected = 1 - (0.01 * 10);
      expect(weight).to.deep.equal(expected);
    });
  });
});