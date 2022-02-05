import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { sleep } from './utils';
import { GameState, SolverRequest, SolverResponse } from './types';
import {
  confirmGuess,
  enterWordIntoGame,
  listenToCurrentRow,
  parseGameState
} from './wordle-board';
import { Recommendation } from './customizable/solver';
import { RecommendationList } from './customizable/RecommendationList';

const Wordler = () => {
  const [gameState, setGameState] = React.useState<GameState>(parseGameState());
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isWaiting, setIsWaiting] = React.useState<boolean>(false);
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string>(null);

  const handleResponse = (response: SolverResponse) => {
    setIsLoading(false);

    if (response.status === 'success') {
      setRecommendations(response.recommendations as Recommendation[]);
    } else if (response.status === 'error') {
      setErrorMessage(response.message);
    } else {
      setErrorMessage(`An unknown error occurred`);
    }
  };

  const handleRequest = (request: SolverRequest) => {
    setErrorMessage(null);
    setIsLoading(true);

    chrome.runtime.sendMessage(request, handleResponse);
  };

  const attachRowHandler = (usingGameState) => {
    // console.log('attach row', usingGameState.rowIndex);
    listenToCurrentRow(usingGameState, () => {
      setIsWaiting(false);

      const newGameState = parseGameState();
      // console.log('row was evaluated', JSON.stringify(newGameState, null, 2));
      setGameState(newGameState);

      // console.log('should attach?', [
      //   newGameState.rowIndex < 7,
      //   newGameState.gameStatus === 'IN_PROGRESS'
      // ]);

      if (newGameState.rowIndex < 7 && newGameState.gameStatus === 'IN_PROGRESS') {
        attachRowHandler(newGameState);
      }

      handleRequest({
        event: 'guess',
        gameState: newGameState,
      });
    });
  };

  React.useEffect(
    () => {
      if (gameState.rowIndex < 7 && gameState.gameStatus === 'IN_PROGRESS') {
        attachRowHandler(gameState);
      }

      handleRequest({
        event: 'init',
        gameState,
      });
    },
    []
  );

  const handleRecommendationClick = async (recommendation: Recommendation) => {
    await enterWordIntoGame(recommendation.word, gameState);
    await sleep(150);
    await confirmGuess();
    setIsWaiting(true);
  };

  return (
    <div>
      {errorMessage ?
        <>
          <p>{errorMessage}</p>
        </>
      :
        <>
          <p style={{
            color: '#ccc',
            borderBottom: '1px solid #999',
            marginBottom: 8,
            paddingBottom: 2
          }}>Top recommendations</p>
          {isWaiting ? <p>Waiting...</p> :
          isLoading ? <p>Loading...</p> :
            <div>
              {recommendations.length > 0 ?
                <>
                  <RecommendationList
                    recommendations={recommendations}
                    onClick={handleRecommendationClick}
                  />
                </>
                :
                <>
                  <p>No recommendations found</p>
                </>
              }
            </div>
          }
        </>
      }
    </div>
  )
}

export const mount = (element: HTMLElement) => {
  ReactDOM.render(
    (
      <Wordler />
    ),
    element
  );
}