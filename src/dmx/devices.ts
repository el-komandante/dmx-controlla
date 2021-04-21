
export interface Ax1Pixel {
  Dimmer: number;
  Red: number;
  Green: number;
  Blue: number;
  White: number;
  Strobe: number;
}

export interface Ax1Fixture {
  [pixelName: string]: Ax1Pixel
}

export interface Ax1FixtureSet {
  [key: string]: Ax1Fixture
}
const generateAX1Pixel = (pixelNum: number, startAddress: number): Ax1Pixel => {
  const startAddressOffset = startAddress - 1
  const pixelNumOffset = (pixelNum - 1) * 6
  const offset = startAddressOffset + pixelNumOffset
  return {
    [`Dimmer`]: 1 + offset,
    [`Red`]: 2 + offset,
    [`Green`]: 3 + offset,
    [`Blue`]: 4 + offset,
    [`White`]: 5 + offset,
    [`Strobe`]: 6 + offset,
  }
}

const generateAX1 = (startAddress: number): Ax1Fixture => {
  let ax1 = {}
  for (let i = 1; i <= 16; i++) {
    ax1 = {...ax1, [`Pixel${i}`]: {...generateAX1Pixel(i, startAddress)}}
  }
  return ax1
}

export const fixtures: Ax1FixtureSet = {
  PixelBar1: generateAX1(1),
  PixelBar2: generateAX1(97)
}