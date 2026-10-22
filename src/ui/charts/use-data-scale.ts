"use client"

import * as React from "react"

import { defaultScale, readDataScale, type DataScale } from "./scale"

const same = (a: DataScale, b: DataScale) => a.count === b.count && a.thresholds.join() === b.thresholds.join();

/** L'échelle de la marque en vigueur ; `override` la remplace (tests, graphique figé). */
export function useDataScale(override?: DataScale): DataScale {
  const [scale, setScale] = React.useState<DataScale>(defaultScale);
  React.useLayoutEffect(() => {
    if (override) return;
    const next = readDataScale();
    setScale((prev) => (same(prev, next) ? prev : next));
  });
  return override ?? scale;
}
