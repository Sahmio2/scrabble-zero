export function validateMove(board: (string | null)[][], tilesPlaced: { x: number; y: number; letter: string }[]) {
  if (!tilesPlaced.length) {
    return false;
  }

  // Check bounds and occupancy
  for (const tile of tilesPlaced) {
    if (tile.y < 0 || tile.y >= 15 || tile.x < 0 || tile.x >= 15) return false;
    if (board[tile.y]?.[tile.x] !== null && board[tile.y]?.[tile.x] !== undefined) {
      return false; // Cell already occupied
    }
  }

  const rows = tilesPlaced.map(t => t.y);
  const cols = tilesPlaced.map(t => t.x);
  const uniqueRows = [...new Set(rows)];
  const uniqueCols = [...new Set(cols)];

  // Straight line check
  if (uniqueRows.length > 1 && uniqueCols.length > 1) {
    return false; // Must be in a straight line
  }

  // Connectivity check
  const isHorizontal = uniqueRows.length === 1;
  if (isHorizontal) {
    const row = uniqueRows[0];
    const sortedCols = cols.sort((a, b) => a - b);
    for (let i = sortedCols[0]; i <= sortedCols[sortedCols.length - 1]; i++) {
      const hasTile = tilesPlaced.some(t => t.x === i) || (board[row][i] !== null);
      if (!hasTile) return false; // Gap found
    }
  } else {
    // Vertical
    const col = uniqueCols[0];
    const sortedRows = rows.sort((a, b) => a - b);
    for (let i = sortedRows[0]; i <= sortedRows[sortedRows.length - 1]; i++) {
      const hasTile = tilesPlaced.some(t => t.y === i) || (board[i][col] !== null);
      if (!hasTile) return false; // Gap found
    }
  }

  // First move center check or connection to existing check
  const isFirstMove = board.every(row => row.every(cell => cell === null));
  if (isFirstMove) {
    const coversCenter = tilesPlaced.some(t => t.x === 7 && t.y === 7);
    if (!coversCenter) return false;
  } else {
    let touchesExisting = false;
    for (const tile of tilesPlaced) {
      const neighbors = [
        [tile.y - 1, tile.x],
        [tile.y + 1, tile.x],
        [tile.y, tile.x - 1],
        [tile.y, tile.x + 1],
      ];
      for (const [r, c] of neighbors) {
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] !== null) {
          touchesExisting = true;
          break;
        }
      }
      if (touchesExisting) break;
    }
    if (!touchesExisting) return false;
  }

  return true;
}
