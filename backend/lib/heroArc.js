function getArcRadius(width) {
  if (width <= 768) return 120;
  if (width <= 1024) return 176;
  return 210;
}

function getDiscStep(count) {
  return count > 0 ? 360 / count : 90;
}

/** Khoảng cách slot card i so với vị trí giữa (0 = đang ở slot front) */
function slotOffset(index, active, total) {
  return ((index - active) % total + total) % total;
}

/** Bước xoay ngắn nhất từ active → target (âm = quay thuận) */
function getShortestStepDelta(from, to, total) {
  if (!total) return 0;
  const forward = ((to - from) % total + total) % total;
  const backward = forward - total;
  return Math.abs(backward) < forward ? backward : forward;
}

export {
  getArcRadius,
  getDiscStep,
  slotOffset,
  getShortestStepDelta,
};
