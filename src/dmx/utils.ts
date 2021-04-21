import { Ax1Fixture, Ax1Pixel } from "./devices"

export const bpmToMs = (bpm: number) => {
  return 60_000 / bpm
}

export const pixelsFromFixtures = (fixtures: { [key: string ]: Ax1Fixture}): [Ax1Pixel] => {
  // if (typeof fixtures !== "array") { // Handle a single fixture passed in
  //   return Object.values(fixtures)
  // }
  return Object.values(fixtures).reduce((acc, fixture) => acc.concat(Object.values(fixture)), [])
}

export const pixelsFromFixture = (fixture) => {
  return Object.values(fixture)
}