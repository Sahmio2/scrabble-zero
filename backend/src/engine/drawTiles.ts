export function drawTiles(tileBag: string[], count: number) {
  const tiles = [];

  for (let i = 0; i < count; i++) {
    if (tileBag.length === 0) break;
    const tile = tileBag.pop();
    if (tile) {
      tiles.push(tile);
    }
  }

  return tiles;
}
