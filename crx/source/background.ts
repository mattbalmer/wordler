import { Wordle } from 'wordler-core/wordle';
import { OFFICIAL_WORDS } from 'wordler-core/data/official';
import { GameState, SolverResponse } from './types';
import { solver } from './customizable/solver';

let wordle: Wordle;

const getWordleFromGameState = (gameState: GameState): Wordle => {
  const wordle = new Wordle(gameState.solution, {
    allowedGuesses: OFFICIAL_WORDS,
  });
  gameState.boardState.slice(0, gameState.rowIndex).filter(_ => !!_).forEach(guess => {
    wordle.guess(guess);
  });

  const doEvaluationsMatch = wordle.evaluations.every((evaluation, iE) => {
    const gameStateEvaluation = gameState.evaluations[iE];
    const doPlacementsMatch = evaluation.results.every((placement, iP) => {
      return placement.toLowerCase() === gameStateEvaluation[iP];
    });
    return doPlacementsMatch;
  });

  if (!doEvaluationsMatch) {
    console.log('official', gameState.evaluations);
    console.log('reconstructed', wordle.evaluations);
    throw new Error(`GameState evaluations do not match reconstructed evaluations by Wordler engine`);
  }

  return wordle;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse_) {
  const sendResponse = (response: SolverResponse) => {
    sendResponse_(response);
  };

  const {
    event,
    gameState
  }: {
    event: string,
    gameState: GameState
  } = request;

  const handleGuess = ({
    gameState
  }: {
    gameState: GameState,
  }) => {
    try {
      wordle = getWordleFromGameState(gameState);
    } catch (err) {
      if (err.message === `GameState evaluations do not match reconstructed evaluations by Wordler engine`) {
        sendResponse({
          status: 'error',
          message: `GameState evaluations do not match reconstructed evaluations by Wordler engine`,
          wordle,
        });
      }
    }

    const recommendations = solver.getTopRecommendations(wordle);

    sendResponse({
      status: 'success',
      recommendations,
      wordle,
    });
  };

  if (event === 'init') {
    handleGuess({ gameState });
  }

  if (event === 'guess') {
    handleGuess({ gameState });
  }

  return true;
});