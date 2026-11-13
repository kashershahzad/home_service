import { getToken } from "./api";

/**
 * Clear auth screens from history and land on home.
 * Avoid CommonActions.reset — Expo Router root stack route names
 * don't match file routes and throw "action reset ... name home".
 */
export function goHomeAfterAuth(router) {
  try {
    if (typeof router?.canDismiss === "function" && router.canDismiss()) {
      router.dismissAll();
    }
  } catch (_) {
    // ignore
  }

  // After POP_TO_TOP, replace the remaining screen with home
  // so back cannot return to letYouIn / signIn / PIN.
  try {
    router?.replace("/home");
  } catch (_) {
    // ignore
  }
}

/** Guest → login gate. Returns true if already authenticated. */
export async function requireLogin(router, redirectTo = "/letYouIn") {
  const token = await getToken();
  if (token) return true;
  router.push(redirectTo);
  return false;
}

/** If already logged in, bounce away from auth screens. */
export async function redirectIfAuthenticated(router) {
  const token = await getToken();
  if (!token) return false;
  goHomeAfterAuth(router);
  return true;
}
