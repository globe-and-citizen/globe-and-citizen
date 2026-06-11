import {fetchWithAuth, interceptorFetch, setSignedInUser} from "./auth";
import {API_BASE_URL} from "./constants";
import type {SignInResponse} from "@/models/Auth";

export async function getLayer8LoginUrl(isLogin: boolean): Promise<unknown> {
    try {
        const response = isLogin
            ? await interceptorFetch(`${API_BASE_URL}/layer8-login-url`)
            : await fetchWithAuth(`${API_BASE_URL}/layer8-auth-url`);

        if (!response) {
            throw new Error(`Error fetching layer8 url: ${response}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching layer8 login url:", error);
        throw error;
    }
}

export async function layer8Callback(code: string, isLogin: boolean): Promise<unknown> {
    try {
        const options = {
            method: "POST",
            body: JSON.stringify({code}),
        }

        const response = isLogin
            ? await interceptorFetch(`${API_BASE_URL}/login-callback`, options)
            : await fetchWithAuth(`${API_BASE_URL}/authorization-callback`, options)

        if (!response) {
            throw new Error(`Error fetching layer8 callback url: ${response}`);
        }

        const responseData: SignInResponse | { data: string } = await response.json();
        return await setSignedInUser(responseData)
    } catch (error) {
        console.error("Failed to login with Layer8:", error);
        throw error;
    }
}
