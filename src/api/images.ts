import { fetchWithAuth } from "@/api/auth.ts";
import { API_BASE_URL } from "@/api/constants.ts";

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response: Response = await fetchWithAuth(
      `${API_BASE_URL}/images/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response instanceof Response && !response.ok) {
      throw new Error("Upload failed");
    }
    const data = await response.json();
    return data.data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
