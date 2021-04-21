import { Client } from "node-osc"

const client = new Client("0.0.0.0", "3333")

client.send("/dmx-controlla/animation", 1, e => {
console.log("hello"); client.close();
})
