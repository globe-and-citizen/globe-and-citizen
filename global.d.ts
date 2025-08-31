import "vue";

declare module "@vue/runtime-dom" {
  interface HTMLAttributes {
    "data-slot"?: string;

    [key: `data-${string}`]: string | number | boolean | undefined;
  }
}
