export function createEmptyBoard() {
  const board = [];

  for (let y = 0; y < 15; y++) {
    board.push(new Array(15).fill(null));
  }

  return board;
}
