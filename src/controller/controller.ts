import { DmxController } from "../dmx"
import { AnimationArgs, animationIdsToNames } from "../dmx/animations"
import { Color } from "../dmx/utils";
import { OscMessage, OscStringMessage, OscNumericMessage, OscServer } from "../osc";

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
  private accentAnimation: Animation | null = null;
  private currentlyRunningAnimation: any = null;
  private nextAnimation: Animation | null = null;
  private nextAnimationQueued = false;
  private masterBrightness: number;
  private bpm: number;
  private bar: number;
  private color: Color = {
    r: 255,
    g: 0,
    b: 0,
    w: 0
  }

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
  }

  maybeRunAccentAnimation = () => {
    if (this.nextAnimation && this.nextAnimation.type === AnimationType.Accent) {
        this.currentlyRunningAnimation.stop()
        this.currentlyRunningAnimation = this.dmxController.runAnimation(this.accentAnimation, () => {
          this.nextAnimationQueued = false
        })
        this.accentAnimation = null
        this.nextAnimationQueued = true
    } else {
      this.repeatCurrentAnimation()
    }
  }

  maybeRunNextAnimation = () => {
    if (this.nextAnimation && this.nextAnimation.type === AnimationType.Loop) {
      this.currentlyRunningAnimation?.stop()
      this.currentlyRunningAnimation = this.dmxController.runAnimation(this.nextAnimation)
      this.currentAnimation = this.nextAnimation
      this.nextAnimation = null
    } else {
      this.repeatCurrentAnimation()
    }
  }

  repeatCurrentAnimation = () => {
    this.currentlyRunningAnimation?.stop()
    this.currentlyRunningAnimation = this.dmxController.runAnimation(this.currentAnimation)
  }

  startAnimationLoop = () => {
    this.repeatCurrentAnimation()
  }

  handleDownbeat = (_msg) => {
    console.log(this.bar)
    if (this.bar === 3) {
      this.maybeRunAccentAnimation()
    } else if (this.bar < 3) {
      this.repeatCurrentAnimation()
    } else {
      this.maybeRunNextAnimation()
    }

    if(this.bar === 4) {
      this.bar = 1
    } else {
      this.bar++
    }
  }

  handleStart = () => {
  }

  handleSelectLoopedAnimation = (msg: OscStringMessage) => {
    this.nextAnimation = {
      animationName: msg.data,
      args: { bpm: this.bpm, color: this.color },
      type: AnimationType.Loop
    }
  }

  handleSelectAccentAnimation = (msg: OscStringMessage) => {
    this.accentAnimation = {
      animationName: msg.data,
      args: { bpm: this.bpm, color: this.color },
      type: AnimationType.Accent
    }
  }

  handleUpdateBpm = (msg: OscNumericMessage) => {
    this.bpm = msg.data
  }

  addOscHandlers() {
    // this.oscServer.addMessageHandler("/dmx-controlla/start", this.handleStart)
    this.oscServer.addMessageHandler("/dmx-controlla/downbeat", this.handleDownbeat)
    this.oscServer.addMessageHandler("/dmx-controlla/bpm", this.handleUpdateBpm)
    this.oscServer.addMessageHandler("/dmx-controlla/animation/loop", this.handleSelectLoopedAnimation)
    this.oscServer.addMessageHandler("/dmx-controlla/animation/accent", this.handleSelectAccentAnimation)


    this.oscServer.addMessageHandler("/dmx-controlla/color", msg => {
    })
  }
}