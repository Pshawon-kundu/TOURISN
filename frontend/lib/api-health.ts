/**
 * API Health Check
 * Tests connectivity between frontend and backend
 */

import { API_BASE_URL } from "./api";

export async function testBackendConnection(): Promise<{
  status: "success" | "error";
  message: string;
  baseURL?: string;
  error?: any;
}> {
  try {
    console.log(`Testing backend connection to: ${API_BASE_URL}`);

    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✓ Backend connection successful:", data);

    return {
      status: "success",
      message: "Backend is reachable",
      baseURL: API_BASE_URL,
    };
  } catch (error: any) {
    console.error("✗ Backend connection failed:", error.message);

    return {
      status: "error",
      message: `Failed to connect to backend: ${error.message}`,
      baseURL: API_BASE_URL,
      error: error,
    };
  }
}

/**
 * Log API client configuration
 */
export function logAPIConfig() {
  console.log("API Configuration:", {
    baseURL: API_BASE_URL,
    timestamp: new Date().toISOString(),
  });
}
