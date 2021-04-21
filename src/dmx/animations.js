import DMX from "dmx";
import { bpmToMs, pixelsFromFixtures, pixelsFromFixture } from "./utils.js"


export const fourByFourStrobe = ({ fixtures, bpm, color }) => {
  const animation = new DMX.Animation({ loop: 4 })
  const pixels = pixelsFromFixtures(fixtures)
  const beatLength = bpmToMs(bpm)
  const onTime = beatLength / 8
  const offTime = beatLength - (onTime * 2)
  const onValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Red] = color.r
    acc[pixel.Green] = color.g
    acc[pixel.Blue] = color.b
    acc[pixel.White] = color.w
    acc[pixel.Dimmer] = 255
    return acc
  }, {})
  const offValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Red] = color.r
    acc[pixel.Green] = color.g
    acc[pixel.Blue] = color.b

    acc[pixel.Dimmer] = 0
    return acc
  }, {})
  animation.add(onValues, onTime)
  .add(offValues, onTime)
  .delay(offTime)
  return animation
}

export const pixelChase = ({ fixtures, pixelLength, bpm, color }) => {
  const animation = new DMX.Animation({ loop: 4 })
  const pixels = pixelsFromFixtures(fixtures)
  const beatLength = bpmToMs(bpm)
  const barLength = beatLength * 4
  let start = 0
  let end = start + pixelLength
  pixels.forEach(() => {
    const dmxValues = pixels.reduce((acc, pixel, idx) => {
      acc[pixel.Red] = color.r
      acc[pixel.Green] = color.g
      acc[pixel.Blue] = color.b
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

export const changeColor = ({ fixtures, color, duration }) => {
  const animation = new DMX.Animation()
  const pixels = pixelsFromFixtures(fixtures);
  const dmxValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Red] = color.r
    acc[pixel.Green] = color.g
    acc[pixel.Blue] = color.b
    acc[pixel.White] = color.w
    return acc
  }, {})
  animation.add(dmxValues, duration)
  return animation
}

export const expand = ({ fixtures, color, duration, pxPerStep, bpm }) => {
  // Only supporting even numbers of pixels for now
  const animation = new DMX.Animation()
  const stepLength = bpmToMs(bpm)

  const dmxValuesForFixture = (fixture, start, stop) => {
    let dmxVals = {}
    const pixels = pixelsFromFixture(fixture)
    const on = pixels.slice(start, stop)
    const off = [...pixels.slice(0, start), ...pixels.slice(stop, pixels.length)]
    on.forEach(pixel => {
      dmxVals[pixel.Dimmer] = 255
    })
    off.forEach(pixel => {
      dmxVals[pixel.Dimmer] = 0
    })
    return dmxVals
  }

  let start = (16 / 2)
  let stop = (16 / 2) + 1

  for (let i = 0; i < 4; i++) {
    const dmxValuesForStep = {}
    Object.values(fixtures).forEach((fixture) => {
      Object.assign(dmxValuesForStep, dmxValuesForFixture(fixture, start, stop))
    })
    animation.add(dmxValuesForStep, stepLength / 4)
    animation.delay(stepLength - (stepLength / 4))
    // animation.add(dmxValuesForStep, stepLength)
    start -= pxPerStep / 2
    stop += pxPerStep / 2
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

export const fadeColor = ({ fixtures, color, bpm }) => {
  const animation = new DMX.Animation()
  const pixels = pixelsFromFixtures(fixtures)
  const msPerBeat = bpmToMs(bpm)
  const dmxValues = pixels.reduce((acc, pixel) => {
    acc[pixel.Red] = color.r
    acc[pixel.Green] = color.g
    acc[pixel.Blue] = color.b
    acc[pixel.White] = color.w
  }, {})
  animation.add(dmxValues, msPerBeat * 4)
}

export default {
  expand,
  fourByFourStrobe,
  pixelChase,
  changeColor,
  on,
  off,
  dim
}