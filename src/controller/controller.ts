import { DmxController } from "../dmx"
import { AnimationArgs } from "../dmx/animations"
import { OscMessage, OscServer } from "../osc";

interface Animation {
  animationName: string;
  args: Omit<AnimationArgs, "fixtures">;
  type: AnimationType;
}

enum AnimationType {
  Loop = "loop",
  Accent = "accent"
}

export class LightingController {
  private dmxController: DmxController = null;
  private oscServer: OscServer = null;
  private currentAnimation: Animation | null = null;
  private currentlyRunningAnimation: any = null;
  private nextAnimation: Animation | null = null;
  private nextAnimationQueued = false;
  private masterBrightness: number;
  private bpm: number;
  private bar: number;

  constructor(dmxController: DmxController, oscServer: OscServer) {
    this.dmxController = dmxController
    this.oscServer = oscServer
    this.currentAnimation = null
    this.currentlyRunningAnimation = null
    this.masterBrightness = 0
    this.bpm = 135
    this.bar = 1
  }

  start() {
    this.oscServer.start()
    this.addOscHandlers()
    this.dmxController.start()


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

  maybeRunAccentAnimation = () => {
    if (this.nextAnimation && this.nextAnimation.type === AnimationType.Accent) {
        this.currentlyRunningAnimation.stop()
        this.currentlyRunningAnimation = this.dmxController.runAnimation(this.nextAnimation, () => {
          this.nextAnimationQueued = false
        })
        this.nextAnimation = null
        this.nextAnimationQueued = true
    } else {
      this.repeatCurrentAnimation()
    }
  }

  repeatCurrentAnimation = () => {
    this.currentlyRunningAnimation?.stop()
    this.currentlyRunningAnimation = this.dmxController.runAnimation(this.currentAnimation)
  }

  startAnimationLoop = () => {
    this.handleDownbeat()
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

  handleStart = () => {
    console.log("start message received")
    this.startAnimationLoop()
  }

  handleSelectAnimation = (_msg: OscMessage) => {
    console.log(_msg)
    const color = {
      r: 0,
      g: 0,
      b: 255,
      w: 0
    }
    this.currentAnimation = {
      animationName: "fourByFourStrobe",
      args: { bpm: this.bpm, color },
      type: AnimationType.Loop
    }
  }

  handleUpdateBpm = (msg: OscMessage) => {
    this.bpm = msg.data
  }

  addOscHandlers() {
    this.oscServer.addMessageHandler("/dmx-controlla/start", this.handleStart)
    this.oscServer.addMessageHandler("/dmx-controlla/downbeat", this.handleDownbeat)
    this.oscServer.addMessageHandler("/dmx-controlla/bpm", this.handleUpdateBpm)
    this.oscServer.addMessageHandler("/dmx-controlla/animation", this.handleSelectAnimation)

    this.oscServer.addMessageHandler("/dmx-controlla/color", msg => {
      console.log(msg)
    })
  }
}