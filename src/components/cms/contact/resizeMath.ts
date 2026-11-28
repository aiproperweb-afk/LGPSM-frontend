// The arithmetic behind mouse resizing, kept free of the DOM so it can be tested.
export const HANDLES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
export type Handle = (typeof HANDLES)[number];

export type ResizeInput = {
  handle: Handle;
  start: { width: number; height: number };
  delta: { x: number; y: number };
  lockAspect: boolean;
  min: { width: number; height: number };
  max: { width: number; height: number };
  /** Grid step in pixels; 0 turns grid snapping off. */
  grid: number;
  /** Widths and heights at which the element lines up with a neighbour or its parent. */
  snapWidths?: number[];
  snapHeights?: number[];
  snapDistance?: number;
};

export type ResizeResult = { width: number; height: number; horizontal: boolean; vertical: boolean; snappedWidth: number | null; snappedHeight: number | null };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

function snap(value: number, grid: number, targets: number[], distance: number): { value: number; target: number | null } {
  let best: number | null = null;
  for (const target of targets) {
    if (Math.abs(target - value) <= distance && (best === null || Math.abs(target - value) < Math.abs(best - value))) best = target;
  }
  if (best !== null) return { value: best, target: best };
  return { value: grid > 0 ? Math.round(value / grid) * grid : value, target: null };
}

export function computeResize(input: ResizeInput): ResizeResult {
  const { handle, start, delta, lockAspect, min, max, grid } = input;
  const distance = input.snapDistance ?? 6;
  const horizontal = handle.includes("e") || handle.includes("w");
  const vertical = handle.includes("n") || handle.includes("s");
  let width = start.width + (handle.includes("e") ? delta.x : handle.includes("w") ? -delta.x : 0);
  let height = start.height + (handle.includes("s") ? delta.y : handle.includes("n") ? -delta.y : 0);
  const ratio = start.height > 0 ? start.width / start.height : 1;
  // With the ratio locked one side leads: the one being dragged, or on a corner the one that moved proportionally more.
  const widthLeads = horizontal && (!vertical || Math.abs(width - start.width) / Math.max(start.width, 1) >= Math.abs(height - start.height) / Math.max(start.height, 1));

  let snappedWidth: number | null = null;
  let snappedHeight: number | null = null;
  if (horizontal && (!lockAspect || widthLeads)) {
    const result = snap(width, grid, input.snapWidths ?? [], distance);
    width = result.value;
    snappedWidth = result.target;
  }
  if (vertical && (!lockAspect || !widthLeads)) {
    const result = snap(height, grid, input.snapHeights ?? [], distance);
    height = result.value;
    snappedHeight = result.target;
  }

  if (lockAspect) {
    if (widthLeads) {
      width = clamp(width, Math.max(min.width, min.height * ratio), Math.min(max.width, max.height * ratio));
      height = width / ratio;
    } else {
      height = clamp(height, Math.max(min.height, min.width / ratio), Math.min(max.height, max.width / ratio));
      width = height * ratio;
    }
  } else {
    width = horizontal ? clamp(width, min.width, max.width) : start.width;
    height = vertical ? clamp(height, min.height, max.height) : start.height;
  }

  return {
    width: Math.round(width), height: Math.round(height),
    horizontal: horizontal || lockAspect, vertical: vertical || lockAspect,
    snappedWidth: snappedWidth !== null && Math.round(width) === Math.round(snappedWidth) ? snappedWidth : null,
    snappedHeight: snappedHeight !== null && Math.round(height) === Math.round(snappedHeight) ? snappedHeight : null,
  };
}

/** Moves `delta` pixels from a grid column's neighbour to the column and returns the new fr ratios. */
export function resizeTracks(tracks: number[], index: number, neighbour: number, delta: number, minimum = 80): string | null {
  if (tracks[index] === undefined || tracks[neighbour] === undefined || index === neighbour) return null;
  const pair = tracks[index] + tracks[neighbour];
  const floor = Math.min(minimum, pair / 2);
  const own = clamp(tracks[index] + delta, floor, pair - floor);
  const next = [...tracks];
  next[index] = own;
  next[neighbour] = pair - own;
  const total = next.reduce((sum, value) => sum + value, 0);
  return next.map(value => Number(((value / total) * next.length).toFixed(3))).join(" ");
}

export function formatLength(pixels: number, parentPixels: number, unit: "%" | "px"): string {
  if (unit === "%" && parentPixels > 0) return `${Number(Math.min(100, (pixels / parentPixels) * 100).toFixed(2))}%`;
  return `${Math.round(pixels)}px`;
}
