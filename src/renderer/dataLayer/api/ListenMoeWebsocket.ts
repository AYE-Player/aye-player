// https://github.com/LISTEN-moe/desktop-app/blob/master/src/assets/worker/websocket.worker.js
class ListenMoeWebsocket {
  public heartbeatInterval: NodeJS.Timer | undefined;

  public ws: WebSocket | undefined;

  connect() {
    this.ws = new WebSocket('wss://listen.moe/beta_gateway');
  }

  disconnect() {
    this.ws?.close();
  }

  sendHeartbeat(heartbeat: number) {
    this.heartbeatInterval = setInterval(() => {
      this.ws?.send(JSON.stringify({ op: 9 }));
    }, heartbeat);
  }
}

export default new ListenMoeWebsocket();
