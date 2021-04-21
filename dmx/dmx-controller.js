import DMX from "dmx";
import { fixtures } from "./devices.js"
import animations from "./animations.js"

export class DmxController {
  constructor() {
    this.animations = animations
    this.fixtures = fixtures
    this.bpm = 128
  }

  start() {
    this.dmx = new DMX()
    this.universe = this.dmx.addUniverse("Universe1", "enttec-usb-dmx-pro", "/dev/tty.usbserial-6A010489")
    this.reset()
  }

  reset() {
    this.universe.updateAll(0)
  }

  changeColor(r, g, b, w, duration) {

  }

  runLoop(iterations) {
    if (iterations) {

    }
  }

  setBpm(bpm) {
    this.bpm = bpm
  }

  runAnimation({ animationName, args }, onFinish) {
    this.reset()
    const animation = this.animations[animationName]({
      fixtures: this.fixtures,
      ...args
    })
    console.log(`Name: ${animationName}`, args)
    animation.run(this.universe, onFinish)
    return animation
  }
}

