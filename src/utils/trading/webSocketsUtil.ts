// types.ts
export type ChannelType = "market" | "user";

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private heartbeatInterval: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private readonly maxReconnectDelayMs = 15000;
  private readonly subscribedAssets = new Set<string>();
  private url: string;
  private channelType: ChannelType;
  private data: string[];
  private auth?: Record<string, string>;
  private onMessage?: (data: unknown) => void;

  constructor(
    url: string,
    channelType: ChannelType,
    data: string[],
    auth?: Record<string, string>,
    onMessage?: (data: unknown) => void,
  ) {
    this.url = url;
    this.channelType = channelType;
    this.data = data;
    this.auth = auth;
    this.onMessage = onMessage;
    this.data.forEach((assetId) => this.subscribedAssets.add(assetId));
  }

  private get marketAssets() {
    return [...this.subscribedAssets];
  }

  private getInitialPayload(): Record<string, unknown> {
    return this.channelType === "market"
      ? { assets_ids: this.marketAssets, type: "market" }
      : { markets: this.data, type: "user", auth: this.auth };
  }

  private safeSend(message: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    } else {
      console.warn("WebSocket not connected. Message not sent:", message);
    }
  }

  connect() {
    // Prevent multiple connections
    if (
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    )
      return;

    const fullUrl = `${this.url}/ws/${this.channelType}`;
    this.ws = new WebSocket(fullUrl);

    console.log(
      `Connecting to WebSocket at ${fullUrl} with channelType=${this.channelType}`,
    );
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      const payload = this.getInitialPayload();
      this.ws?.send(JSON.stringify(payload));
      this.startHeartbeat();
    };

    // this.ws.onmessage = (event) => {
    //   if (this.onMessage) this.onMessage(JSON.parse(event.data));
    // };
    this.ws.onmessage = (event) => {
      // 1. Handle plain string control messages first
      if (event.data === "PONG" || event.data === "ping") {
        // If the server sends 'ping', we send 'PONG'
        if (event.data === "ping") {
          this.safeSend("PONG");
        }
        return; // Exit early; don't parse these
      }

      // 2. Now it's safe to parse JSON
      try {
        const parsedData = JSON.parse(event.data);
        if (!this.onMessage) return;

        if (Array.isArray(parsedData)) {
          parsedData.forEach((item) => this.onMessage?.(item));
          return;
        }

        this.onMessage(parsedData);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", event.data, e);
      }
    };

    this.ws.onerror = (error) => {
      console.warn("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.ws = null;

      if (!this.shouldReconnect) return;

      const delay = Math.min(
        1000 * Math.pow(2, this.reconnectAttempts),
        this.maxReconnectDelayMs,
      );
      this.reconnectAttempts += 1;
      this.reconnectTimer = window.setTimeout(() => {
        this.connect();
      }, delay);
    };
  }

  public reconnect() {
    console.log("Reconnecting WebSocket...");
    this.shouldReconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    this.ws?.close();
    this.connect();
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      // if (this.ws?.readyState === WebSocket.OPEN) {
      //   this.ws.send("PING");
      // }
      this.safeSend("PING");
    }, 10000); // 10s matching your Python code
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }

  public get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  subscribe(assetsIds: string[]) {
    if (!assetsIds.length) return;

    assetsIds.forEach((assetId) => this.subscribedAssets.add(assetId));
    this.safeSend({
      assets_ids: assetsIds,
      operation: "subscribe",
      custom_feature_enabled: true,
    });
  }

  unsubscribe(assetsIds: string[]) {
    if (!assetsIds.length) return;

    assetsIds.forEach((assetId) => this.subscribedAssets.delete(assetId));
    this.safeSend({ assets_ids: assetsIds, operation: "unsubscribe" });
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.stopHeartbeat();
  }
}
