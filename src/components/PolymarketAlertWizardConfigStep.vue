<template>
  <div class="grid gap-4">
    <div class="grid gap-2">
      <Label>Alert Type</Label>
      <Select v-model="legsCountStringModel">
        <SelectTrigger>
          <SelectValue placeholder="Select alert type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="1">Single market</SelectItem>
            <SelectItem value="2">Sum of 2 markets (dyad)</SelectItem>
            <SelectItem value="3">Sum of 3 markets (triad)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <div v-if="isSum" class="grid gap-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="grid gap-2">
          <Label>Hold</Label>
          <Input
            v-model.number="thresholdModel"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.95"
          />
        </div>
        <div class="grid gap-2">
          <Label>Operator</Label>
          <Select v-model="operatorModel">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="lt">&lt;</SelectItem>
                <SelectItem value="lte">&le;</SelectItem>
                <SelectItem value="gt">&gt;</SelectItem>
                <SelectItem value="gte">&ge;</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label>Direction</Label>
          <Select v-model="directionModel">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="grid gap-2">
        <Label>Target Price</Label>
        <Input
          v-model.number="targetPriceModel"
          type="number"
          min="0"
          max="1"
          step="0.01"
          placeholder="0.95"
        />
      </div>

      <div class="grid gap-2">
        <Label>Operator</Label>
        <Select v-model="singleOperatorModel">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="lt">&lt;</SelectItem>
              <SelectItem value="lte">&le;</SelectItem>
              <SelectItem value="gt">&gt;</SelectItem>
              <SelectItem value="gte">&ge;</SelectItem>
              <SelectItem value="eq">=</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-2">
        <Label>Direction</Label>
        <Select v-model="directionModel">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="grid gap-3">
      <div class="flex items-center gap-2">
        <Checkbox id="notify_discord" v-model="notifyDiscordModel" />
        <Label for="notify_discord">Notify Discord</Label>
      </div>

      <div v-if="notifyDiscordModel" class="grid gap-2">
        <Label>Discord Webhook (optional)</Label>
        <Input
          v-model="discordWebhookModel"
          type="url"
          placeholder="https://discord.com/api/webhooks/..."
        />
      </div>

      <div class="flex items-center gap-2">
        <Checkbox id="repeat" v-model="repeatModel" />
        <Label for="repeat">Repeat</Label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AlertOperator = "lt" | "lte" | "gt" | "gte" | "eq";
type AlertDirection = "buy" | "sell";

const props = defineProps<{
  isSum: boolean;
  legsCountString: string;
  threshold: number;
  operator: AlertOperator;
  direction: AlertDirection;
  targetPrice: number;
  singleOperator: AlertOperator;
  notifyDiscord: boolean;
  discordWebhook: string;
  repeat: boolean;
}>();

const emit = defineEmits<{
  (e: "update:legsCountString", value: string): void;
  (e: "update:threshold", value: number): void;
  (e: "update:operator", value: AlertOperator): void;
  (e: "update:direction", value: AlertDirection): void;
  (e: "update:targetPrice", value: number): void;
  (e: "update:singleOperator", value: AlertOperator): void;
  (e: "update:notifyDiscord", value: boolean): void;
  (e: "update:discordWebhook", value: string): void;
  (e: "update:repeat", value: boolean): void;
}>();

const legsCountStringModel = computed({
  get: () => props.legsCountString,
  set: (value: string) => emit("update:legsCountString", value),
});

const thresholdModel = computed({
  get: () => props.threshold,
  set: (value: number) => emit("update:threshold", value),
});

const operatorModel = computed({
  get: () => props.operator,
  set: (value: AlertOperator) => emit("update:operator", value),
});

const directionModel = computed({
  get: () => props.direction,
  set: (value: AlertDirection) => emit("update:direction", value),
});

const targetPriceModel = computed({
  get: () => props.targetPrice,
  set: (value: number) => emit("update:targetPrice", value),
});

const singleOperatorModel = computed({
  get: () => props.singleOperator,
  set: (value: AlertOperator) => emit("update:singleOperator", value),
});

const notifyDiscordModel = computed({
  get: () => props.notifyDiscord,
  set: (value: boolean) => emit("update:notifyDiscord", value),
});

const discordWebhookModel = computed({
  get: () => props.discordWebhook,
  set: (value: string) => emit("update:discordWebhook", value),
});

const repeatModel = computed({
  get: () => props.repeat,
  set: (value: boolean) => emit("update:repeat", value),
});
</script>
