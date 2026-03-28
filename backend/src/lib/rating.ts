/**
 * Elo rating calculation for Scrabble Zero.
 * K-factor is set to 32 for standard adjustments.
 */
export function calculateNewRatings(
  p1Rating: number,
  p2Rating: number,
  p1Score: number,
  p2Score: number
): { p1New: number; p2New: number; p1Change: number; p2Change: number } {
  const K = 32;

  // Expected scores
  const E1 = 1 / (1 + Math.pow(10, (p2Rating - p1Rating) / 400));
  const E2 = 1 / (1 + Math.pow(10, (p1Rating - p2Rating) / 400));

  // Actual score (1 for win, 0.5 for draw, 0 for loss)
  let S1 = 0.5;
  let S2 = 0.5;

  if (p1Score > p2Score) {
    S1 = 1;
    S2 = 0;
  } else if (p2Score > p1Score) {
    S1 = 0;
    S2 = 1;
  }

  const p1Change = Math.round(K * (S1 - E1));
  const p2Change = Math.round(K * (S2 - E2));

  return {
    p1New: p1Rating + p1Change,
    p2New: p2Rating + p2Change,
    p1Change,
    p2Change,
  };
}
