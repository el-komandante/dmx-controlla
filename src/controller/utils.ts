import { bpmToMs } from "../dmx/utils"

interface BarsUntilCuePointInput {
  cueTime: number;
  currentTime: number;
  bpm: number;
}

export const barsUntilCuePoint = ({ cueTime, currentTime, bpm }: BarsUntilCuePointInput) => {
  const durationMs = cueTime - currentTime
  const msPerBar = bpmToMs(bpm) * 4
  return Math.round(durationMs / msPerBar)
}