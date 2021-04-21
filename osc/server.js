import { Server } from "node-osc"

export class OscServer {
  constructor(addr, port) {
    this.addr = addr
    this.port = port
    this.server = null
    this.handlers = {}
  }

  start() {
    this.server = new Server(this.port, this.addr, () => {
      console.log('OSC Server is listening');
    });
    this.server.on("message", this.handleMessage)
  }

  stop() {
    this.server.close()
  }

  handleMessage = (msg) => {
    const [ address, data ] = msg
    const handlers = this.handlers[address]
    if (handlers) {
      handlers.forEach(handler => { handler({ address, data }) })
    }
  }

  addMessageHandler = (address, handlerFunc) => {
    if (!this.handlers[address]) {
      this.handlers[address] = [handlerFunc]
    } else {
      this.handlers[address].push(handlerFunc)
    }
  }
}