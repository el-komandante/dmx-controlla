import osc from "osc"

export interface OscMessage {
  address: string;
  args: OscData[]
}

export interface OscBundle {
  timetag: any;
  packets: OscMessage[]
}

export type OscData = boolean | number | string

export interface OscStringMessage extends OscMessage {
  data: string;
}

export interface OscNumericMessage extends OscMessage {
  data: number;
}

export interface OscArrayMessage extends OscMessage {
  data: any[]
}

export interface Message {
  address: string;
  data: OscData;
}

export type MessageHandlerFunc = (msg: Message) => void;

export class OscServer {
  public addr: string;
  public port: string;
  public server;
  public handlers: { [key: string]: [MessageHandlerFunc] }

  constructor(addr: string, port: string) {
    this.addr = addr
    this.port = port
    this.server = null
    this.handlers = {}
  }

  start() {
    this.server = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: this.port,
      remoteAddress: this.addr,
      remotePort: this.port,
    })

    this.server.open()

    this.server.on("ready", () => {
      console.log(`OSC Server is listening at ${this.addr} on port ${this.port}`)
    })

    this.server.on("error", (error) => {
      console.log(error)
    })

    this.server.on("message", this.handleOscMessage)
    this.server.on("bundle", this.handleOscBundle)

  }

  stop() {
    this.server.close()
  }

  handleOscMessage = (oscMsg: OscMessage) => {
    console.log(oscMsg)
    const { address, args: [data] } = oscMsg
    this.runMessageHandlers({ address, data })
  }

  handleOscBundle = ({ timetag: _, packets }: OscBundle) => {
    let data;
    const [ oscMsg ] = packets
    const { address, args } = oscMsg
    if (args.length > 1) {
      data = args
    } else {
      data = args[0]
    }
    this.runMessageHandlers({ address, data })
  }

  runMessageHandlers = ({ address, data }: Message) => {
    const handlers = this.handlers[address]
    if (handlers) {
      handlers.forEach(handler => { handler({ address, data }) })
    }
  }

  addMessageHandler = (address: string, handlerFunc: MessageHandlerFunc) => {
    if (!this.handlers[address]) {
      this.handlers[address] = [handlerFunc]
    } else {
      this.handlers[address].push(handlerFunc)
    }
  }
}