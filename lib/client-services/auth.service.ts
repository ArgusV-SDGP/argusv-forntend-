const ACCESS_TOKEN_KEY = "argusv_access_token";
const REFRESH_TOKEN_KEY = "argusv_refresh_token";
const ACCESS_TOKEN_COOKIE = "argusv_access_token";
const REFRESH_TOKEN_COOKIE = "argusv_refresh_token";
const FORWARDED_USER_COOKIE = "argusv_forwarded_user";
const FORWARDED_ROLE_COOKIE = "argusv_forwarded_role";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.BASE_URL ??
  "http://127.0.0.1:8000";

export type AuthUser = {
  username: string;
  role: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
};

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

declare global {
  interface Window {
    ArgusAuth?: {
      login: (username: string, password: string) => Promise<AuthUser>;
      register: (username: string, password: string) => Promise<AuthUser>;
      fetchMe: () => Promise<AuthUser>;
      authFetch: (path: string, init?: RequestOptions) => Promise<Response>;
      logout: () => void;
      getAccessToken: () => string | null;
    };
  }
}

function getApiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function saveTokens(tokens: LoginResponse) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(tokens.access_token)}; path=/; samesite=lax`;

  if (tokens.refresh_token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(tokens.refresh_token)}; path=/; samesite=lax`;
  }
}

function clearTokens() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

function saveUserContext(user: AuthUser) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${FORWARDED_USER_COOKIE}=${encodeURIComponent(user.username)}; path=/; samesite=lax`;
  document.cookie = `${FORWARDED_ROLE_COOKIE}=${encodeURIComponent(user.role)}; path=/; samesite=lax`;
}

function clearUserContext() {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${FORWARDED_USER_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  document.cookie = `${FORWARDED_ROLE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

async function parseError(response: Response) {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  } catch {
    // Ignore invalid JSON and fall back to status text.
  }

  return response.statusText || "Request failed";
}

async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!init.skipAuth) {
    const token = getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(getApiUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await parseError(response);

    if (response.status === 401) {
      clearTokens();
      clearUserContext();
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function login(username: string, password: string) {
  const tokens = await request<LoginResponse>("/auth/token", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });

  saveTokens(tokens);

  const user = await fetchMe();
  saveUserContext(user);

  return user;
}

export async function register(username: string, password: string) {
  return request<AuthUser>("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchMe() {
  const user = await request<AuthUser>("/auth/me", {
    method: "GET",
  });

  saveUserContext(user);

  return user;
}

export async function authFetch(path: string, init: RequestOptions = {}) {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(getApiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearTokens();
    clearUserContext();
  }

  return response;
}

export function logout() {
  clearTokens();
  clearUserContext();
}

export function initArgusAuth() {
  if (!isBrowser()) {
    return;
  }

  window.ArgusAuth = {
    login,
    register,
    fetchMe,
    authFetch,
    logout,
    getAccessToken,
  };
}

export { API_BASE_URL, getAccessToken };
