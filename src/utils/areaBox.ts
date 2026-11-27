// Boxes marked on a card design always sit in the middle of the card's width: dragging one sideways brings it back to the centre, so only
// its height on the card is chosen, and widening it grows it equally to both sides.

export interface Box { x: number; y: number; w: number; h: number }

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** The x that centres a box of width `w` on a canvas of width `canvasWidth` */
export const centredX = (w: number, canvasWidth: number): number => Math.round((canvasWidth - w) / 2);

/** A box dragged by (dy): it follows the pointer up and down and stays centred */
export function movedBox(start: Box, dy: number, canvas: { width: number; height: number }): { x: number; y: number } {
  return { x: centredX(start.w, canvas.width), y: Math.round(clamp(start.y + dy, 0, canvas.height - start.h)) };
}

/** A box resized by its corner: the sideways pull widens both sides at once */
export function resizedBox(start: Box, dx: number, dy: number, canvas: { width: number; height: number }, square: boolean): Box {
  if (square) {
    const side = Math.round(clamp(start.w + Math.max(dx * 2, dy), 60, Math.min(canvas.width, canvas.height - start.y)));
    return { x: centredX(side, canvas.width), y: start.y, w: side, h: side };
  }
  const w = Math.round(clamp(start.w + dx * 2, 20, canvas.width));
  return { x: centredX(w, canvas.width), y: start.y, w, h: Math.round(clamp(start.h + dy, 16, canvas.height - start.y)) };
}
