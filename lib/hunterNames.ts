// Purely cosmetic bayou-flavored hunter epithet, deterministic per roll
// number so a reconnecting overlay client renders the same name.
const EPITHETS = [
  "Marrow Jack",
  "The Ithaca Man",
  "The Bayou Man",
  "Crowbait",
  "Salt Widow",
  "The Levee Preacher",
  "Hollow Tooth",
  "The Drowned Prospector",
  "Lantern Jaw",
  "The Cane Cutter",
  "Blackwater Sal",
  "The Bell Ringer",
  "Rot Gut",
  "The Trapper's Ghost",
  "Nine Lives",
  "The Swamp Deacon"
];

export function hunterNameForRoll(rollNumber: number): string {
  return EPITHETS[rollNumber % EPITHETS.length];
}
