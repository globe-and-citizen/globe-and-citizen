// usePolymarketWss.ts
import { ref, onMounted, onUnmounted, toValue, type ComputedRef } from "vue";
import {
  WebSocketManager,
  type ChannelType,
} from "@/utils/trading/webSocketsUtil";

export function usePolymarketWs(
  channelType: ChannelType,
  assetIds: string[],
  auth?: ComputedRef<
    | {
        apiKey: string;
        secret: string;
        passphrase: string;
      }
    | undefined
  >,
) {
  const url = "wss://ws-subscriptions-clob.polymarket.com";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderBookData = ref<Record<string, any>>({});
  let manager: WebSocketManager | null = null;

  const upsertAssetMessage = (
    assetId: string,
    patch: Record<string, unknown>,
  ) => {
    orderBookData.value[assetId] = {
      ...orderBookData.value[assetId],
      ...patch,
      asset_id: assetId,
      _receivedAt: Date.now(),
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMarketMessage = (data: any) => {
    if (!data || typeof data !== "object") return;

    if (data.asset_id) {
      upsertAssetMessage(String(data.asset_id), data);
      return;
    }

    if (
      data.event_type === "price_change" &&
      Array.isArray(data.price_changes)
    ) {
      for (const change of data.price_changes) {
        if (!change?.asset_id) continue;

        upsertAssetMessage(String(change.asset_id), {
          ...change,
          event_type: data.event_type,
          market: data.market,
          timestamp: data.timestamp,
        });
      }
    }
  };

  const handleVisibilityChange = () => {
    // If tab becomes visible and manager exists but isn't connected
    if (!document.hidden && manager && !manager.isConnected) {
      console.log("Tab became visible, reconnecting...");
      manager.reconnect();
    }
  };

  onMounted(() => {
    manager = new WebSocketManager(
      url,
      channelType,
      assetIds,
      toValue(auth),
      (data) => {
        if (channelType === "market") {
          handleMarketMessage(data);
          return;
        }

        if (
          data &&
          typeof data === "object" &&
          "asset_id" in data &&
          typeof (data as { asset_id?: unknown }).asset_id === "string"
        ) {
          const typedData = data as { asset_id: string } & Record<
            string,
            unknown
          >;
          orderBookData.value[typedData.asset_id] = typedData;
        }
      },
    );

    manager.connect();
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    manager?.disconnect();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  return {
    orderBookData,
    subscribeToMore: (ids: string[]) => manager?.subscribe(ids),
    unsbscribeFrom: (ids: string[]) => manager?.unsubscribe(ids),
  };
}
