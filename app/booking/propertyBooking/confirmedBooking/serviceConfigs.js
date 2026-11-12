import { images } from "../../../../assets/images/image";

export const BOOKING_TYPES = {
  HOUSE_CLEANING: "houseCleaning",
  HAIR_DRYER: "hairDryer",
};

export const FLOW_STEPS = {
  MATCHING: "matching",
  ASSIGNED: "assigned",
  ON_THE_WAY: "onTheWay",
};

export const FLOW_ORDER = [
  FLOW_STEPS.MATCHING,
  FLOW_STEPS.ASSIGNED,
  FLOW_STEPS.ON_THE_WAY,
];

export const SERVICE_CONFIGS = {
  [BOOKING_TYPES.HOUSE_CLEANING]: {
    type: BOOKING_TYPES.HOUSE_CLEANING,
    role: "Cleaner",
    serviceIcon: images.brushIcon,
    // brushicon.png already includes green circle + white glyph
    iconHasBg: true,
    chatLabel: "Chat with your cleaner",
  },
  [BOOKING_TYPES.HAIR_DRYER]: {
    type: BOOKING_TYPES.HAIR_DRYER,
    role: "Stylist",
    serviceIcon: images.scissors,
    iconHasBg: false,
    chatLabel: "Chat with your stylist",
  },
};

export function getServiceConfig(bookingType) {
  return (
    SERVICE_CONFIGS[bookingType] || SERVICE_CONFIGS[BOOKING_TYPES.HOUSE_CLEANING]
  );
}

/** Build status-card copy from live booking + flow step (no fake names/times). */
export function buildStepContent({
  flowStep,
  role = "Professional",
  providerName,
  statusMessage,
  headline,
  tracking,
}) {
  const firstName = providerName
    ? String(providerName).split(" ")[0]
    : null;
  const roleLower = String(role).toLowerCase();

  if (flowStep === FLOW_STEPS.ON_THE_WAY) {
    const etaMin = tracking?.etaMinutesMin ?? tracking?.minutesAway;
    const etaMax = tracking?.etaMinutesMax;
    let eta = null;
    if (etaMin != null && etaMin !== "") {
      const low = Math.round(Number(etaMin));
      if (!Number.isNaN(low)) {
        const high =
          etaMax != null && etaMax !== "" ? Math.round(Number(etaMax)) : null;
        eta =
          high != null && !Number.isNaN(high) && high !== low
            ? `${low} — ${high} mins`
            : `${low} mins`;
      }
    }

    const arrivalStart = tracking?.estimatedArrivalStart;
    const arrivalEnd = tracking?.estimatedArrivalEnd;
    const note =
      arrivalStart || arrivalEnd
        ? `Est. Arrival ${[arrivalStart, arrivalEnd].filter(Boolean).join(" – ")}`
        : headline
          ? String(headline)
          : null;

    return {
      badge: null,
      eta,
      title: `${role} On The Way`,
      subtitle:
        statusMessage ||
        (firstName
          ? `${firstName} is heading to your home.`
          : `Your ${roleLower} is on the way.`),
      note,
      progress: 0.9,
      showSparkles: false,
      bottom: "profile",
    };
  }

  if (flowStep === FLOW_STEPS.ASSIGNED) {
    return {
      badge: "Confirmed & Dispatched",
      eta: null,
      title: `${role} Assigned`,
      subtitle:
        statusMessage ||
        (firstName
          ? `${firstName} is confirmed for your booking.`
          : `Your ${roleLower} has been assigned.`),
      note: null,
      progress: 0.75,
      showSparkles: true,
      bottom: "profile",
    };
  }

  return {
    badge: `Assigning ${role}`,
    eta: null,
    title: "Matching...",
    subtitle:
      statusMessage || `We're finding your ${roleLower}`,
    note: headline ? String(headline) : null,
    progress: 0.55,
    showSparkles: true,
    bottom: "details",
  };
}
