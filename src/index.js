import { LightingController } from "./src/controller/index.js"
import { OscServer } from "./src/osc/index.js"
import { DmxController } from "./src/dmx/index.js"


const osc = new OscServer("0.0.0.0", "3333")
const dmx = new DmxController()
const lightingController = new LightingController(dmx, osc)
lightingController.start()