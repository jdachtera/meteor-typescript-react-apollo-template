import { useMemo } from "react";

export const useDistance = (positionA, positionB) => {
  return useMemo(() => {
    return getDistance(positionA, positionB);
  }, [positionA.x, positionA.y, positionB.x, positionB.y]);
};

export const getDistance = (posA, posB) => {
  var a = posA.x - posB.x;
  var b = posA.y - posB.y;

  return Math.sqrt(a * a + b * b);
};
