/** Map API booking → Bookings tab card model. */
export function mapBookingToCard(booking = {}) {
  const id = String(booking.id || booking._id || booking.reference || "");
  const categoryName =
    booking.category?.name ||
    booking.categoryName ||
    booking.categorySlug ||
    "Service";
  const packageName =
    booking.packageSnapshot?.name ||
    booking.allocation?.planName ||
    null;
  const title = packageName || categoryName;

  const provider =
    booking.assignedProfessionals?.[0]?.fullName ||
    booking.professionals?.[0]?.fullName ||
    booking.assignees?.[0]?.fullName ||
    "Homely Pro";

  const schedule = booking.schedule || {};
  const dateRaw = schedule.date || booking.date || null;
  let dateISO = "";
  let dateLabel = "";
  if (dateRaw) {
    dateISO = String(dateRaw).slice(0, 10);
    const d = new Date(dateISO);
    dateLabel = Number.isNaN(d.getTime())
      ? dateISO
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  }

  const time =
    schedule.startTime ||
    schedule.slotLabel ||
    schedule.slot ||
    booking.estimatedArrival ||
    "";

  const statusRaw = String(
    booking.screen || booking.status || "upcoming",
  ).toLowerCase();
  let status = "Upcoming";
  if (
    statusRaw.includes("cancel") ||
    statusRaw === "cancelled" ||
    statusRaw === "canceled"
  ) {
    status = "Cancelled";
  } else if (
    statusRaw.includes("complete") ||
    statusRaw === "done" ||
    statusRaw === "completed"
  ) {
    status = "Completed";
  } else if (
    statusRaw.includes("confirm") ||
    statusRaw.includes("assign") ||
    statusRaw.includes("match") ||
    statusRaw.includes("track") ||
    statusRaw.includes("progress") ||
    statusRaw.includes("upcoming") ||
    statusRaw === "confirmed"
  ) {
    status = "Upcoming";
  }

  const price = Number(
    booking.pricing?.total ?? booking.total ?? booking.amount ?? 0,
  );

  const image =
    booking.category?.image ||
    booking.image ||
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80&auto=format";

  return {
    id,
    reference: booking.reference || id,
    title: String(title),
    provider: String(provider),
    date: dateLabel,
    dateISO,
    time: String(time),
    price,
    status,
    image: String(image),
    raw: booking,
  };
}

export function extractBookingsList(data) {
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}
