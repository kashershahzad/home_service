import * as LocalAuthentication from "expo-local-authentication";
import * as secureStorage from "./secureStorage";

const PIN_KEY = "biometricPin";
const PHONE_KEY = "biometricPhone";

export async function getBiometricCapability() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return {
        available: false,
        enrolled: false,
        label: "Biometric",
        isFaceId: false,
      };
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types =
      await LocalAuthentication.supportedAuthenticationTypesAsync();
    const isFaceId = types.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    );

    return {
      available: true,
      enrolled,
      label: isFaceId ? "Face ID" : "Fingerprint",
      isFaceId,
    };
  } catch {
    return {
      available: false,
      enrolled: false,
      label: "Biometric",
      isFaceId: false,
    };
  }
}

export async function authenticateWithBiometric(promptMessage) {
  const cap = await getBiometricCapability();
  if (!cap.available) {
    return { success: false, error: "not_available", label: cap.label };
  }
  if (!cap.enrolled) {
    return { success: false, error: "not_enrolled", label: cap.label };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage:
      promptMessage ||
      (cap.isFaceId ? "Confirm with Face ID" : "Confirm with fingerprint"),
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
    fallbackLabel: "Use Passcode",
  });

  return {
    success: !!result.success,
    error: result.error || null,
    warning: result.warning || null,
    label: cap.label,
  };
}

export function biometricErrorMessage(result) {
  const label = result?.label || "Biometric";
  switch (result?.error) {
    case "user_cancel":
    case "system_cancel":
    case "app_cancel":
      return null;
    case "not_available":
      return "This device does not support Face ID / fingerprint.";
    case "not_enrolled":
      return `Please set up ${label} in phone Settings first.`;
    case "lockout":
      return `${label} locked. Unlock with passcode, then try again.`;
    case "passcode_not_set":
      return "Set a device passcode first, then try again.";
    default:
      return `${label} could not verify. Please try again or use PIN.`;
  }
}

export async function saveBiometricCredentials(phone, pin) {
  if (phone) await secureStorage.setItem(PHONE_KEY, String(phone));
  if (pin) await secureStorage.setItem(PIN_KEY, String(pin));
}

export async function getBiometricCredentials() {
  const phone = await secureStorage.getItem(PHONE_KEY);
  const pin = await secureStorage.getItem(PIN_KEY);
  return { phone, pin };
}

export async function clearBiometricCredentials() {
  await secureStorage.deleteItem(PHONE_KEY);
  await secureStorage.deleteItem(PIN_KEY);
}

/** Keep PIN in secure store so biometric login can call /auth/login. */
export async function savePinForBiometric(pin) {
  if (pin) await secureStorage.setItem(PIN_KEY, String(pin));
}
