import type { SignInResponse, UserType } from "@/models/Auth";
import { fetchWithAuth } from "./auth";
import { API_BASE_URL } from "./constants";

export async function getUser(userId: number): Promise<{ data: UserType }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`);
    if (!response) {
      throw new Error("No response received from fetchWithAuth");
    }
    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function fetchAllUsers(
  limit?: number,
  offset?: number,
  search?: string
): Promise<{ data: UserType[] }> {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());
  if (search) params.append("search", search);
  const queryString = params.toString();

  try {
    // &offset=${page}
    const response = await fetchWithAuth(
      `${API_BASE_URL}/users/${queryString ? `?${queryString}` : ""}`
    );
    if (!response) {
      throw new Error("No response received from fetchWithAuth");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

export async function fetchUsersCount(): Promise<{ data: number }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/users-count`);

    if (!response || !response.ok) {
      throw new Error(
        `Error fetching users count: ${
          response ? response.statusText : "No response"
        }`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users count:", error);
    throw error;
  }
}

export async function updateUser(
  userId: number,
  userData: Partial<UserType>
): Promise<SignInResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response || !response.ok) {
      throw new Error(
        `Error updating user: ${response ? response.statusText : "No response"}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
