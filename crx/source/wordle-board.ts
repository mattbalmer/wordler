import { GameState } from './types';
import { sleep } from './utils';

export const parseGameState = (): GameState => {
  return JSON.parse(localStorage.getItem('gameState') || '{}');
}

export const clearRow = async (row: Element) => {
  const keyboard = document.querySelector('game-app').shadowRoot.querySelector('game-keyboard').shadowRoot.querySelector('#keyboard');
  const backspaceKey: HTMLButtonElement = keyboard.querySelector(`button[data-key="←"]`) as HTMLButtonElement;

  const tiles = Array.prototype.slice.call(
    row.shadowRoot.querySelectorAll('game-tile[letter]'),
    0
  );

  // console.log('tiles', tiles);

  for(let i = 0; i < tiles.length; i++) {
    // console.log('tile', tiles[i]);
    backspaceKey.click();
    await sleep(100);
  }
}

export const enterWordIntoGame = async (word: string, gameState: GameState) => {
  const keyboard = document.querySelector('game-app').shadowRoot.querySelector('game-keyboard').shadowRoot.querySelector('#keyboard');
  const tileBoard = document.querySelector('game-app').shadowRoot.querySelector('#board');

  const row = tileBoard.querySelectorAll('game-row')[gameState.rowIndex];

  console.log('row', row);

  await clearRow(row);

  for(let i = 0; i < word.length; i++) {
    const letter = word[i];
    const key: HTMLButtonElement = keyboard.querySelector(`button[data-key="${letter.toLowerCase()}"]`) as HTMLButtonElement;
    key.click();
    await sleep(150);
  }
}

export const confirmGuess = async () => {
  const keyboard = document.querySelector('game-app').shadowRoot.querySelector('game-keyboard').shadowRoot.querySelector('#keyboard');
  const enterKey: HTMLButtonElement = keyboard.querySelector(`button[data-key='↵']`) as HTMLButtonElement;
  enterKey.click();
}

export const listenToCurrentRow = (gameState: GameState, onEvaluate: () => void) => {
  const tileBoard = document.querySelector('game-app').shadowRoot.querySelector('#board');
  const row = tileBoard.querySelectorAll('game-row')[gameState.rowIndex];
  const lastTile = row.shadowRoot.querySelector('game-tile:last-child');

  // console.log('listen to row', row, lastTile);

  const observerOptions = {
    childList: true,
    attributes: true,
    subtree: true
  }

  const observer = new MutationObserver((mutationList, observer) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'reveal') {
        const targetElement: HTMLElement = mutation.target as HTMLElement;
        const isRevealed = targetElement?.hasAttribute?.('reveal');
        if (isRevealed) {
          observer.disconnect();
          onEvaluate();
        }
      }
    });
  });

  observer.observe(lastTile, observerOptions);
}
