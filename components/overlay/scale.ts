// A card that defines --u on its root scales every size that goes through u()
// (width, fonts, padding, borders) together with its height. Where --u is not
// defined the fallback is 1px, so the same components render at their design
// pixel size in the other layouts.
export const u = (n: number) => `calc(${n} * var(--u, 1px))`;
