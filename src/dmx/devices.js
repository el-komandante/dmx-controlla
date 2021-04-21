const generateAX1Pixel = (pixelNum, startAddress) => {
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

const generateAX1 = (startAddress) => {
  let ax1 = {}
  for (let i = 1; i <= 16; i++) {
    ax1 = {...ax1, [`Pixel${i}`]: {...generateAX1Pixel(i, startAddress)}}
  }
  return ax1
}

export const fixtures = {
  PixelBar1: generateAX1(1),
  PixelBar2: generateAX1(97)
}