export interface Point {
  x: number;
  y: number;
}

export const CELL_SIZE = 38;
export const GRID_COLS = 24;
export const GRID_ROWS = 16;

// Fixed creep path in grid cell coordinates. Classic Green TD look: a long
// serpentine (boustrophedon) lane that winds back and forth across the map,
// with buildable grass rows between every lane.
export const PATH_WAYPOINTS_CELLS: Point[] = [
  { x: -1, y: 1 },
  { x: 22, y: 1 },
  { x: 22, y: 3 },
  { x: 1, y: 3 },
  { x: 1, y: 5 },
  { x: 22, y: 5 },
  { x: 22, y: 7 },
  { x: 1, y: 7 },
  { x: 1, y: 9 },
  { x: 22, y: 9 },
  { x: 22, y: 11 },
  { x: 1, y: 11 },
  { x: 1, y: 13 },
  { x: 22, y: 13 },
  { x: 24, y: 13 },
];

export function cellToWorld(cell: Point): Point {
  return {
    x: (cell.x + 0.5) * CELL_SIZE,
    y: (cell.y + 0.5) * CELL_SIZE,
  };
}

export const PATH_WAYPOINTS: Point[] = PATH_WAYPOINTS_CELLS.map(cellToWorld);

const pathCellSet = new Set(PATH_WAYPOINTS_CELLS.map((p) => `${p.x},${p.y}`));

function isOnSegment(cx: number, cy: number, a: Point, b: Point): boolean {
  if (a.x === b.x) {
    if (cx !== a.x) return false;
    const [lo, hi] = a.y < b.y ? [a.y, b.y] : [b.y, a.y];
    return cy >= lo && cy <= hi;
  }
  if (a.y === b.y) {
    if (cy !== a.y) return false;
    const [lo, hi] = a.x < b.x ? [a.x, b.x] : [b.x, a.x];
    return cx >= lo && cx <= hi;
  }
  return false;
}

export function isPathCell(cellX: number, cellY: number): boolean {
  if (pathCellSet.has(`${cellX},${cellY}`)) return true;
  for (let i = 0; i < PATH_WAYPOINTS_CELLS.length - 1; i++) {
    if (isOnSegment(cellX, cellY, PATH_WAYPOINTS_CELLS[i], PATH_WAYPOINTS_CELLS[i + 1])) {
      return true;
    }
  }
  return false;
}

export function isBuildable(cellX: number, cellY: number): boolean {
  if (cellX < 0 || cellY < 0 || cellX >= GRID_COLS || cellY >= GRID_ROWS) return false;
  return !isPathCell(cellX, cellY);
}
