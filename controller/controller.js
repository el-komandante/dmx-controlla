// {
//   animationName: string,
//   iterations: number,
//   args: animationArgs,
//   onFinish: function,
//   bars,
//   barsRemaining: number 1-4,
//   type: AnimationType,
//   color: rgb
// }

const AnimationType = {
  Loop: "loop",
  Accent: "accent"
}

export class LightingController {
  constructor(dmxController, oscServer) {
    this.dmxController = dmxController
    this.oscServer = oscServer
    this.animationQueue = []
    this.currentAnimation = null
    this.currentlyRunningAnimation = null
    this.prevAnimation = null
    this.color = [0, 0, 0, 0] // rgbw
    this.masterBrightness = 0
    this.bpm = 135
    this.animationsRunning = false
    this.accentAnimationNext = false
    this.bar = 1
  }

  start() {
    this.oscServer.start()
    this.addOscHandlers()
    this.dmxController.start()

    // this.currentAnimation = {
    //   animationName: "fourByFourStrobe",
    //   args: { bpm: this.bpm, iterations: 1 }
    // }
    const color = {
      r: 0,
      g: 0,
      b: 255,
      w: 0
    }

    this.currentAnimation = {
      animationName: "pixelChase",
      args: { pixelLength: 4, bpm: this.bpm, color },
      type: AnimationType.Loop
    }
    this.nextAnimation = {
      animationName: "fourByFourStrobe",
      args: { bpm: this.bpm, color },
      type: AnimationType.Accent
    }

    this.startAnimationLoop()
  }

  queueAnimation = (animation) => {
    this.animationQueue.unshift(animation)
  }

  maybeRunAccentAnimation = () => {
    if (this.nextAnimation && this.nextAnimation.type === AnimationType.Accent) {
        this.currentlyRunningAnimation.stop()
        this.currentlyRunningAnimation = this.dmxController.runAnimation(this.nextAnimation)
        this.dmxController.nextAnimation = null
        this.nextAnimationQueued = false
      this.nextAnimationQueued = true
    } else {
      this.repeatCurrentAnimation()
    }
  }

  repeatCurrentAnimation = () => {
    this.currentlyRunningAnimation?.stop()
    this.currentlyRunningAnimation = this.dmxController.runAnimation(this.currentAnimation)
  }

  handleDownbeat = msg => {
    console.log(msg, this.bar)
    if (this.bar === 3) {
      this.maybeRunAccentAnimation()
    } else {
      this.repeatCurrentAnimation()
    }

    if(this.bar === 4) {
      this.bar = 1
    } else {
      this.bar++
    }
  }

  startAnimationLoop = () => {
    const color = {
      r: 0,
      g: 0,
      b: 255,
      w: 0
    }

    // this.dmxController.runAnimation({
    //   animationName: "changeColor",
    //   iterations: 1,
    //   args: { color, duration: 1 },
    // })
    this.handleDownbeat()
  }

  handleStart = () => {
    console.log("start message received")
    this.startAnimationLoop()
  }

  addOscHandlers() {
    this.oscServer.addMessageHandler("/dmx-controlla/start", this.handleStart)
    this.oscServer.addMessageHandler("/dmx-controlla/downbeat", this.handleDownbeat)

    this.oscServer.addMessageHandler("/dmx-controlla/bpm", msg => {
      this.bpm = msg.data
    })

    this.oscServer.addMessageHandler("/dmx-controlla/animation", msg => {
      console.log(msg)
    })

    this.oscServer.addMessageHandler("/dmx-controlla/color", msg => {
      console.log(msg)
    })
  }
}