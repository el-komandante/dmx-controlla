import { Ax1Fixture, Ax1FixtureSet, Ax1Pixel } from "./devices"

export const bpmToMs = (bpm: number) => {
  return 60_000 / bpm
}

export const pixelsFromFixtures = (fixtures: Ax1FixtureSet): Ax1Pixel[] => {
  return Object.values(fixtures).reduce((acc: Ax1Pixel[], fixture: Ax1Fixture) => acc.concat(fixture.pixels), [])
}

export const pixelsFromFixture = (fixture: Ax1Fixture) => {
  return fixture.pixels
}

export const setPixelColor = (pixel: Ax1Pixel, color: Color) => {
  return {
    [pixel.Red]: color.r,
    [pixel.Green]: color.g,
    [pixel.Blue]: color.b,
    [pixel.White]: color.w
  }
}

export interface Color {
  r: number;
  g: number;
  b: number;
  w: number;
}