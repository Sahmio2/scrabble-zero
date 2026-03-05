export function validateMove(board: any[][], tilesPlaced: any[]) {

  if (!tilesPlaced.length) {
    return false;
  }

  for (const tile of tilesPlaced) {
    if (board[tile.y]?.[tile.x] !== null && board[tile.y]?.[tile.x] !== undefined) {
      return false; // Cell already occupied according to the server's basic knowledge
    }
  }

  return true;
}
