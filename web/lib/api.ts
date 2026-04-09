/**
 * Centralized API utility to handle fetches with account context.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

if (!API_BASE_URL && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_API_URL is not defined. API calls may fail or point to the wrong origin.");
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const activeAccountId = typeof window !== "undefined" ? localStorage.getItem("activeAccountId") : null;
  
  const headers = new Headers(options.headers);
  if (activeAccountId) {
    headers.set("X-Account-Id", activeAccountId);
  }

  // Ensure base URL doesn't end with a slash and endpoint starts with one (if relative)
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  const url = endpoint.startsWith("http") ? endpoint : `${base}${path}`;

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
