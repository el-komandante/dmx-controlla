import DMX from "dmx";
import { Ax1Fixture, Ax1FixtureSet } from "./devices.js";
import { bpmToMs, pixelsFromFixtures, pixelsFromFixture, Color, setPixelColor } from "./utils.js"

export interface FourByFourStrobeArgs {
  fixtures: Ax1FixtureSet;
  bpm: number;
  color: Color;
}

export interface PixelChaseArgs {
  fixtures: Ax1FixtureSet;
  pixelLength?: number;
  bpm: number;
  color: Color;
}

export interface ChangeColorArgs {
  fixtures: Ax1FixtureSet;
  color: Color;
  duration: number;
}

export interface ExpandArgs {
  fixtures: Ax1FixtureSet;
  bpm: number;
  pxPerStep?: number;
  color: Color;
}

export interface SlideArgs {
  fixtures: Ax1FixtureSet;
  bpm: number;
  color: Color;
}

export interface BlackoutArgs {
  fixtures: Ax1FixtureSet;
}

export type AnimationArgs = FourByFourStrobeArgs
// | PixelChaseArgs
// | ChangeColorArgs
// | ExpandArgs


export const fourByFourStrobe = ({ fixtures, bpm, color }: FourByFourStrobeArgs) => {
  const animation = new DMX.Animation({ loop: 4 })
  const pixels = pixelsFromFixtures(fixtures)
  const beatLength = bpmToMs(bpm)
  const onTime = beatLength / 8
  const offTime = beatLength - (onTime * 2)
  const onValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Dimmer] = 255
    return acc
  }, {})
  const offValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Dimmer] = 0
    return acc
  }, {})
  animation.add(onValues, onTime)
  .add(offValues, onTime)
  .delay(offTime)
  return animation
}

export const pixelChase = ({ fixtures, pixelLength = 4, bpm, color }: PixelChaseArgs) => {
  const animation = new DMX.Animation({ loop: 4 })
  const pixels = pixelsFromFixtures(fixtures)
  const beatLength = bpmToMs(bpm)
  const barLength = beatLength * 4
  let start = 0
  let end = start + pixelLength
  pixels.forEach(() => {
    const dmxValues = pixels.reduce((acc, pixel, idx) => {
      if (end > pixels.length - 1) {
        end = 0
      }
      if (start > pixels.length - 1) {
        start = 0
      }

      if (start > end) {
        if (idx >= start || idx < end) {
          acc[pixel.Dimmer] = 255
        } else {
          acc[pixel.Dimmer] = 0
        }
      } else {
        if (idx >= start && idx < end) {
          acc[pixel.Dimmer] = 255
        } else {
          acc[pixel.Dimmer] = 0
        }
      }

      return acc
    }, {})
    animation.add(dmxValues, barLength / 32)
    start++
    end++
  })
  return animation
}

export const expand = ({ fixtures, pxPerStep = 4, bpm, color }: ExpandArgs) => {
  // Only supporting even numbers of pixels for now
  const animation = new DMX.Animation()
  const stepLength = bpmToMs(bpm)
  const allOff = Object.values(fixtures).reduce((acc, fixture) => {
    fixture.pixels.forEach((pixel) => {
      acc[pixel.Dimmer] = 0
    })
    return acc
  }, {})

  animation.add(allOff, stepLength / 4)
  animation.delay(stepLength - (stepLength / 4))

  const dmxValuesForFixture = (fixture: Ax1Fixture, start: number, stop: number) => {
    let dmxVals = {}
    const pixels = pixelsFromFixture(fixture)
    const on = pixels.slice(start, stop)
    const off = start === 0 && stop === 15 ? [] : [...pixels.slice(0, start), ...pixels.slice(stop, pixels.length)]

    on.forEach(pixel => {
      
      dmxVals[pixel.Dimmer] = 255
    })
    off.forEach(pixel => {
      dmxVals[pixel.Dimmer] = 0
    })

    return dmxVals
  }

  let start = 6
  let stop = 10

  for (let i = 0; i < 3; i++) {

    const dmxValuesForStep = {}
    Object.values(fixtures).forEach((fixture) => {
      Object.assign(dmxValuesForStep, dmxValuesForFixture(fixture, start, stop))
    })
    animation.add(dmxValuesForStep, stepLength / 4)
    animation.delay(stepLength - (stepLength / 4))
    start -= 3
    stop += 3
  }
  return animation
}

export const on = ({ fixtures, duration }) => {
  const animation = new DMX.Animation()
  const pixels = pixelsFromFixtures(fixtures)
  const dmxValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Dimmer] = 255
    return acc
  }, {})
  animation.add(dmxValues, duration)
  return animation
}

export const off = ({ fixtures, duration }) => {
  const animation = new DMX.Animation()
  const pixels = pixelsFromFixtures(fixtures)
  const dmxValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Dimmer] = 0
    return acc
  }, {})
  animation.add(dmxValues, duration)
  return animation
}

export const dim = ({ fixtures, duration, brightness }) => {
  const animation = new DMX.Animation()
  const pixels = pixelsFromFixtures(fixtures)
  const dmxValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Dimmer] = brightness
    return acc
  }, {})
  animation.add(dmxValues, duration)
  return animation
}

export const blackout = ({ fixtures }): BlackoutArgs => {
  const animation = new DMX.Animation()
  const pixels = pixelsFromFixtures(fixtures)
  const dmxValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Dimmer] = 0
    return acc
  })
  animation.add(dmxValues, 1)
  return animation
}

export const fadeColor = ({ fixtures, color, bpm, bars }) => {
  const animation = new DMX.Animation()
  const pixels = pixelsFromFixtures(fixtures)
  const msPerBeat = bpmToMs(bpm)
  const duration = msPerBeat * bars * 4

  const dmxValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Red] = color.r
    acc[pixel.Green] = color.g
    acc[pixel.Blue] = color.b
    acc[pixel.White] = color.w
    return acc
  }, {})

  animation.add(dmxValues, duration === 0 ? 1 : duration)

  return animation
}

export const slide = ({ fixtures, color, bpm }: SlideArgs) => {
  const animation = new DMX.Animation()
  const msPerBeat = bpmToMs(bpm)
  const fixturesArray = Object.values(fixtures)

  // Animate pixels in
  for (let i = 0; i < fixturesArray[0].pixelLength; i++) {
    const dmxVals = fixturesArray.reduce((acc, fixture) => {
      fixture.pixels.forEach((pixel, idx) => {
        if (idx <= i) { // Animate in pixels from the bottom
          acc[pixel.Dimmer] = 255
        } else {
          acc[pixel.Dimmer] = 0
        }
      })
      return acc
    }, {})
    animation.add(dmxVals, msPerBeat / 8)
  }

  // Animate pixels out
  for (let i = 0; i < fixturesArray[0].pixelLength; i++) {
    const dmxVals = fixturesArray.reduce((acc, fixture) => {
      fixture.pixels.forEach((pixel, idx) => {
        if (idx <= i) { // Animate pixels out from the bottom
          acc[pixel.Dimmer] = 0
        }
      })
      return acc
    }, {})
    animation.add(dmxVals, msPerBeat / 8)
  }
  return animation
}

const animations = {
  dim,
  expand,
  fadeColor,
  fourByFourStrobe,
  pixelChase,
  off,
  on,
  slide
}

export const animationIdsToNames = Object.keys(animations).reduce((acc, key, idx) => {
  acc[idx + 1] = key
  return acc
}, {})

export default animations