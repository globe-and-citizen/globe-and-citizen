<template>
    <div class="flex flex-col md:flex-row min-h-[90vh]">
        <!-- Left side with gradient background and heading -->
        <div
            class="md:flex-1/2 bg-cover bg-center min-h-[150px] md:min-h-[846px]"
            :style="{
        backgroundImage: `linear-gradient(to bottom, rgba(14, 12, 12, 1), rgba(14, 12, 12, 0)), url(${bgImg})`,
      }"
        >
            <div
                class="text-white text-2xl sm:text-3xl md:text-5xl uppercase font-lato max-w-full md:max-w-[573px] font-extrabold p-6 sm:p-8 md:pt-24 md:pl-9 flex items-center md:items-start justify-center md:justify-start h-full md:h-auto"
            >
        <span class="text-center md:text-left leading-tight">
          {{
            layer8Enabled
              ? "Your identity is protected by Layer 8 encryption"
              : "Sign in to your local account"
          }}
        </span>
            </div>
        </div>

        <!-- Right side form -->
        <div
            class="flex flex-1 md:flex-1/2 justify-center md:items-center p-4 md:p-0"
        >
            <div class="max-w-[482px] w-full px-4">
                <div class="mb-6">
                    <h4
                        class="font-lato text-xl sm:text-2xl font-bold text-secondary-black mb-2"
                    >
                        Don't just read the news—be part of it.
                    </h4>
                    <p
                        v-if="layer8Enabled"
                        class="font-lato font-normal text-sm sm:text-base text-black-100"
                    >
                        Share your opinion, decide who's telling the truth, write articles,
                        and more — all without revealing your identity, thanks to
                        <strong>Layer8</strong>
                        encryption protecting your data.
                    </p>
                    <p
                        v-else
                        class="font-lato font-normal text-sm sm:text-base text-black-100"
                    >
                        Use your local username and password to continue.
                    </p>
                </div>

                <button
                    v-if="layer8Enabled"
                    type="button"
                    class="w-full bg-black flex items-center justify-center gap-2 text-white py-3 rounded font-bold mt-4 text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    :disabled="isLayer8LoginUrlPending || isLayer8CallbackPending"
                    @click="getLoginUrlMutation()"
                >
                    <component :is="Layer8Icon"/>
                    <span v-if="isLayer8LoginUrlPending || isLayer8CallbackPending">Signing in...</span>
                    <span v-else>Sign in with Layer8</span>
                </button>

                <form v-else class="space-y-4" @submit.prevent="submitCredentials">
                    <div class="grid gap-2">
                        <label for="local-username" class="text-sm font-medium">
                            Username
                        </label>
                        <input
                            id="local-username"
                            v-model="username"
                            type="text"
                            autocomplete="username"
                            required
                            placeholder="Username"
                            class="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>

                    <div class="grid gap-2">
                        <label for="local-password" class="text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="local-password"
                            v-model="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            placeholder="Password"
                            class="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="isCredentialsPending || !username.trim() || !password"
                        class="w-full bg-black text-white py-3 rounded font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    >
                        {{ isCredentialsPending ? "Signing in..." : "Sign in" }}
                    </button>

                    <p class="text-sm text-center text-gray-600">
                        Need a local account?
                        <RouterLink
                            to="/sign-up"
                            class="text-black font-medium underline hover:no-underline"
                        >
                            Create one
                        </RouterLink>
                    </p>
                </form>

                <p v-if="errorMessage" class="text-red-600 text-sm mt-2">
                    {{ errorMessage }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {useMutation, useQueryClient} from "@tanstack/vue-query";
import bgImg from "../assets/images/sign-in-img.png";
import Layer8Icon from "../assets/icons/layer8.svg";
import {getLayer8LoginUrl, layer8Callback} from "@/api/layer8.ts";
import {signIn} from "@/api/auth.ts";

const errorMessage = ref("");
const queryClient = useQueryClient();
const state = ref("");
const username = ref("");
const password = ref("");
const layer8Enabled = import.meta.env.VITE_LAYER8_ENABLED === "true";

const isProd = import.meta.env.PROD;
const layer8BaseUrl = isProd
    ? import.meta.env.VITE_LAYER8_BASE_URL_PROD
    : import.meta.env.VITE_LAYER8_BASE_URL_DEV;

const {
    mutate: getLoginUrlMutation,
    isPending: isLayer8LoginUrlPending,
} = useMutation({
    mutationFn: async () => {
        errorMessage.value = "";
        const res = await getLayer8LoginUrl(true);
        return res as { data: { auth_url: string } };
    },
    onSuccess: (response) => {
        const auth_url = response.data?.auth_url;
        if (!auth_url) {
            console.error("Auth URL is missing in the response.");
            return;
        }

        try {
            const parsed = new URL(auth_url);
            const params = parsed.searchParams;
            state.value = params.get("state") ?? "";
        } catch (err) {
            console.warn("Failed to parse auth_url:", err);
        }

        openExternalLink(auth_url);
    },
    onError: (error) => {
        console.error("Failed to get login URL:", error);
        errorMessage.value = error instanceof Error
            ? error.message
            : "Could not start Layer8 sign-in.";
    },
});

const {
    mutate: layer8CallbackMutation,
    isPending: isLayer8CallbackPending,
} = useMutation({
    mutationFn: async (code: string) => {
        errorMessage.value = "";
        await layer8Callback(true, code, state.value);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ["user"]});
    },
    onError: (error) => {
        console.error("Failed:", error);
        errorMessage.value = error instanceof Error
            ? error.message
            : "Layer8 sign-in failed.";
    },
});

const {
    mutate: credentialsMutation,
    isPending: isCredentialsPending,
} = useMutation({
    mutationFn: async () => {
        errorMessage.value = "";
        return signIn({
            username: username.value.trim(),
            password: password.value,
        });
    },
    onError: (error) => {
        console.error("Local sign-in failed:", error);
        errorMessage.value = error instanceof Error
            ? error.message
            : "Sign-in failed.";
    },
});

function submitCredentials() {
    if (isCredentialsPending.value || !username.value.trim() || !password.value) {
        return;
    }
    credentialsMutation();
}

const openExternalLink = (url: string) => {
    const windowFeatures =
        "width=800,height=800,resizable=yes,scrollbars=yes,status=yes";

    const popupWindow = window.open(url, "_blank", windowFeatures);

    const listener = (event: MessageEvent) => {
        if (event.origin !== layer8BaseUrl) return;

        if (event.data?.redirect_uri) {
            window.removeEventListener("message", listener);

            layer8CallbackMutation(event.data.code);

            if (popupWindow && !popupWindow.closed) {
                popupWindow.close();
            }
        }
    };

    window.addEventListener("message", listener);
};
</script>
