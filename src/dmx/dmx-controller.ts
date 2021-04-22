import DMX from "dmx";
import { Ax1FixtureSet, fixtures } from "./devices.js"
import animations from "./animations.js"

export class DmxController {
  private dmx: DMX;
  private universe;
  private fixtures: Ax1FixtureSet

  constructor() {
    this.fixtures = fixtures
  }

  start() {
    this.dmx = new DMX()
    this.universe = this.dmx.addUniverse("Universe1", "enttec-usb-dmx-pro", "/dev/tty.usbserial-6A010489")
    this.reset()
  }

  reset() {
    this.universe.updateAll(0)
  }

  runAnimation({ animationName, args }, onFinish?: () => void) {
    const animation = animations[animationName]({
      fixtures: this.fixtures,
      ...args
    })
    console.log(`Name: ${animationName}`, args)
    animation.run(this.universe)
    return animation
  }
}

