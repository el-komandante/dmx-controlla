import { Server } from "node-osc"

export interface OscMessage {
  address: string;
  data: OscData
}

export type OscData = boolean | number | string

export interface OscTextMessage extends OscMessage {
  data: string;
}

export interface OscNumericMessage extends OscMessage {
  data: number;
}

export type OscHandlerFunc = (msg: OscMessage) => void;

export class OscServer {
  public addr: string;
  public port: string;
  public server: Server;
  public handlers: { [key: string]: [OscHandlerFunc] }

  constructor(addr: string, port) {
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
    console.log(msg)
    const [ address, data ] = msg
    const handlers = this.handlers[address]
    if (handlers) {
      handlers.forEach(handler => { handler({ address, data }) })
    }
  }

  addMessageHandler = (address: string, handlerFunc: OscHandlerFunc) => {
    if (!this.handlers[address]) {
      this.handlers[address] = [handlerFunc]
    } else {
      this.handlers[address].push(handlerFunc)
    }
  }
}