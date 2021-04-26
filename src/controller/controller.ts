import { DmxController } from "../dmx"
import { AnimationArgs } from "../dmx/animations"
import { Color } from "../dmx/utils";
import { OscStringMessage, OscNumericMessage, OscServer, OscArrayMessage } from "../osc";
import { barsUntilCuePoint } from "./utils"

interface Animation {
  animationName: string;
  args: Omit<AnimationArgs, "fixtures">;
  type: AnimationType;
}

enum AnimationType {
  Loop = "loop",
  Accent = "accent"
}

enum ColorFadeTime {
  CuePoint = 1000,
  Immediate = 0,
  Bars4 = 4,
  Bars8 = 8,
  Bars16 = 16,
  Bars32 = 32,
  Bars64 = 64
}

const DEFAULT_COLOR: Color = {
  r: 0,
  g: 0,
  b: 255,
  w: 0
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
  private changeColorQueued = false;
  private bpm: number = 135;
  private bar: number;
  private color: Color = DEFAULT_COLOR
  private nextColor: Color | null = null
  private colorFadeTime: ColorFadeTime = ColorFadeTime.Bars4
  private nextCueTime: number
  private currentTime: number

  constructor(dmxController: DmxController, oscServer: OscServer) {
    this.dmxController = dmxController
    this.oscServer = oscServer
    this.currentAnimation = {
      animationName: "pixelChase",
      args: { bpm: this.bpm, color: this.color},
      type: AnimationType.Loop
    }
    this.currentlyRunningAnimation = null
    this.masterBrightness = 0
    this.bpm = 135
    this.bar = 0
  }

  start() {
    this.oscServer.start()
    this.addOscHandlers()
    this.dmxController.start()
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

  maybeChangeColor = () => {
    if (this.nextColor) {
      let bars: number
      switch (this.colorFadeTime) {
        case ColorFadeTime.CuePoint:
          bars = barsUntilCuePoint({
            cueTime: this.nextCueTime,
            currentTime: this.currentTime,
            bpm: this.bpm
          })
          break
        default:
          bars = this.colorFadeTime
      }
      this.dmxController.runAnimation({
        animationName: "fadeColor",
        args: { bpm: this.bpm, bars, color: this.nextColor }
      })
      this.color = this.nextColor
      this.nextColor = null
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
      this.maybeChangeColor()
    }

    if(this.bar === 4) {
      this.bar = 1
    } else {
      this.bar++
    }
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

  handleChangeColor = (msg: any) => {
    if (msg.data.length !== 5) {
      return
    }
    const [ r, g, b, w, fadeTime ] = msg.data
    const color: Color = { r, g, b, w }
    this.nextColor = color
    this.colorFadeTime = fadeTime
    console.log("color changing...")
    // if (this.currentAnimation) {
    //   this.currentAnimation = {...this.currentAnimation, args: { ...this.currentAnimation.args, color }}
    // }
    // if (this.nextAnimation) {
    //   this.nextAnimation = { ...this.nextAnimation, args: { ...this.nextAnimation.args, color } }
    // }
  }

  addOscHandlers() {
    // this.oscServer.addMessageHandler("/dmx-controlla/start", this.handleStart)
    this.oscServer.addMessageHandler("/dmx-controlla/downbeat", this.handleDownbeat)
    this.oscServer.addMessageHandler("/dmx-controlla/bpm", this.handleUpdateBpm)
    this.oscServer.addMessageHandler("/dmx-controlla/animation/loop", this.handleSelectLoopedAnimation)
    this.oscServer.addMessageHandler("/dmx-controlla/animation/accent", this.handleSelectAccentAnimation)
    this.oscServer.addMessageHandler("/dmx-controlla/color", this.handleChangeColor)
  }
}