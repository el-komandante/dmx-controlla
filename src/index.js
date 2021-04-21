import { LightingController } from "./src/controller"
import { OscServer } from "./src/osc"
import { DmxController } from "./src/dmx"


const osc = new OscServer("0.0.0.0", "3333")
const dmx = new DmxController()
const lightingController = new LightingController(dmx, osc)
lightingController.start()