import { LightingController } from "./controller"
import { OscServer } from "./osc"
import { DmxController } from "./dmx"


const osc = new OscServer("127.0.0.1", "3333")
const dmx = new DmxController()
const lightingController = new LightingController(dmx, osc)
lightingController.start()