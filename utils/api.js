import * as secureStorage from "./secureStorage";

// Postman baseUrl = https://api.itshomely.com  →  paths are /api/auth/...
export const BASE_URL = "https://api.itshomely.com/api";

async function request(path, { method = "GET", body, token } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",

    "ngrok-skip-browser-warning": "true",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  console.log(`[API] ${method} ${url}`);
  console.log("[API] body:", body ?? null);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.log("[API] network error:", err?.message || err);
    throw new Error(
      "Could not reach the server. Check your connection / BASE_URL.",
    );
  }

  const data = await res.json().catch(() => ({}));

  console.log(`[API] response ${res.status}:`, data);

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        data.message ||
          "Too many requests. Wait a few minutes, then try again.",
      );
    }
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export const saveToken = (token) => secureStorage.setItem("authToken", token);
export const getToken = () => secureStorage.getItem("authToken");
export const deleteToken = () => secureStorage.deleteItem("authToken");

export const authApi = {
  // phone string (legacy) OR full profile object { phone, fullName, ... }
  signup: (phoneOrData) => {
    const body =
      typeof phoneOrData === "string" ? { phone: phoneOrData } : phoneOrData;
    return request("/auth/signup", { method: "POST", body });
  },

  completeProfile: (token, profileData) =>
    request("/auth/profile", { method: "PUT", token, body: profileData }),

  setPin: (token, pin) =>
    request("/auth/set-pin", { method: "PUT", token, body: { pin } }),

  login: (phone, pin) =>
    request("/auth/login", { method: "POST", body: { phone, pin } }),

  enableBiometric: (token, enabled) =>
    request("/auth/enable-biometric", {
      method: "PUT",
      token,
      body: { enabled },
    }),

  getMe: (token) => request("/auth/me", { token }),

  // Postman 12 — Register FCM token (customer)
  registerFcmToken: (token, body) =>
    request("/auth/fcm-token", { method: "PUT", token, body }),
};

export const homeApi = {
  getHome: (lat, lng, token) =>
    request(`/home?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`, {
      token,
    }),
};

export const catalogApi = {
  getCategories: (lat, lng) =>
    request(
      `/catalog/categories?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
    ),

  getCategory: (slug, lat, lng, audience) => {
    const parts = [
      `lat=${encodeURIComponent(lat)}`,
      `lng=${encodeURIComponent(lng)}`,
    ];
    if (audience) parts.push(`audience=${encodeURIComponent(audience)}`);
    return request(`/catalog/categories/${encodeURIComponent(slug)}?${parts.join("&")}`);
  },
};

export const addressApi = {
  list: (token) => request("/addresses", { token }),

  create: (token, body) =>
    request("/addresses", { method: "POST", token, body }),

  update: (token, addressId, body) =>
    request(`/addresses/${encodeURIComponent(addressId)}`, {
      method: "PATCH",
      token,
      body,
    }),
};

export const bookingApi = {
  // Postman 07 Salon / 06 Cleaning — Review screen totals
  quote: (token, body) =>
    request("/bookings/quote", { method: "POST", token, body }),

  // Postman Confirm & Book
  create: (token, body) =>
    request("/bookings", { method: "POST", token, body }),

  // Postman 08 — My Bookings
  list: (token, scope) => {
    const qs = scope ? `?scope=${encodeURIComponent(scope)}` : "";
    return request(`/bookings${qs}`, { token });
  },

  getById: (token, bookingId) =>
    request(`/bookings/${encodeURIComponent(bookingId)}`, { token }),

  cancel: (token, bookingId, reason = "Changed plans") =>
    request(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      method: "POST",
      token,
      body: { reason },
    }),
};

export const serviceApi = {
  getById: (id) => request(`/services/${id}`),

  getByCategory: (category) => request(`/services/category/${category}`),
  getPopular: (category) =>
    request(
      `/services/popular${category && category !== "All" ? `?category=${category}` : ""}`,
    ),
  getCategories: () => request("/services/categories"),

  search: (term, filters = {}) => {
    const parts = [];

    if (term && term.trim()) {
      parts.push(`query=${encodeURIComponent(term.trim())}`);
    }
    if (filters.category && filters.category !== "All") {
      parts.push(`category=${encodeURIComponent(filters.category)}`);
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (min !== undefined) parts.push(`minPrice=${encodeURIComponent(min)}`);
      if (max !== undefined) parts.push(`maxPrice=${encodeURIComponent(max)}`);
    }
    if (filters.rating && filters.rating !== "All") {
      parts.push(`rating=${encodeURIComponent(filters.rating)}`);
    }

    const qs = parts.join("&");
    return request(`/services/search?${qs}`).then((data) => {
      console.log("Search URL:", `${BASE_URL}/services/search?${qs}`);
      console.log("Search result count:", data.providers?.length);
      return data;
    });
  },
};
