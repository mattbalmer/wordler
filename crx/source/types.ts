import { Wordle } from 'wordler-core/wordle';
import { Recommendation } from './customizable/solver';

export type GameState = {
  boardState: string[],
  evaluations: string[][],
  gameStatus: string,
  hardMode: boolean,
  lastPlayedTs: number,
  lastCompletedTs: number,
  restoringFromLocalStorage: unknown,
  rowIndex: number,
  solution: string,
}

export type SolverErrorResponse = {
  status: 'error',
  wordle: Wordle,
  message: string,
}

export type SolverSuccessResponse = {
  status: 'success',
  wordle: Wordle,
  recommendations: Recommendation[],
}

export type SolverResponse = SolverErrorResponse | SolverSuccessResponse;


export type SolverInitRequest = {
  event: 'init',
  gameState: GameState,
}

export type SolverGuessRequest = {
  event: 'guess',
  gameState: GameState,
}

export type SolverRequest = SolverInitRequest | SolverGuessRequest;
