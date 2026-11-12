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

  const assignees = Array.isArray(booking.assignees)
    ? booking.assignees
    : Array.isArray(booking.assignedProfessionals)
      ? booking.assignedProfessionals
      : Array.isArray(booking.professionals)
        ? booking.professionals
        : [];
  // Only truly empty assignees → "Not assigned yet". Placeholder names like
  // "Pending Verify" still count as assigned and should render as-is.
  const hasAssignee = assignees.length > 0;
  const pro = hasAssignee ? assignees[0] : null;
  const provider = pro ? pro.fullName || pro.name || null : null;
  const providerImage = pro
    ? pro.avatar || pro.photo || pro.image || null
    : null;
  const providerRating =
    pro?.rating != null
      ? String(pro.rating)
      : booking.providerRating != null
        ? String(booking.providerRating)
        : null;
  const jobsRaw =
    pro?.completedJobs ?? pro?.servicesCount ?? booking.providerJobs ?? null;
  const providerJobs =
    jobsRaw == null
      ? null
      : String(jobsRaw).includes("+")
        ? String(jobsRaw)
        : `${jobsRaw}+ services`;
  const providerBadge = pro?.badge || booking.providerBadge || null;

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

  const durationMins =
    schedule.durationMins ||
    booking.durationMins ||
    booking.packageSnapshot?.durationMins ||
    booking.estimatedDurationMins ||
    null;
  const durationLabel = durationMins ? `${durationMins} mins` : null;

  const scheduleLine = [dateLabel, time].filter(Boolean).join(", ");
  const scheduleWithDuration = [scheduleLine, durationLabel]
    .filter(Boolean)
    .join(" • ");

  const statusRaw = String(
    booking.screen || booking.status || "upcoming",
  ).toLowerCase();
  let status = "Booked";
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
  } else {
    status = "Booked";
  }

  const price = Number(
    booking.pricing?.total ?? booking.total ?? booking.amount ?? 0,
  );

  // Show exactly what API sends in paymentStatus (e.g. "paid") — no invented labels.
  const paymentStatusRaw =
    booking.paymentStatus ?? booking.payment_status ?? null;
  const paymentLabel =
    paymentStatusRaw != null && String(paymentStatusRaw).trim() !== ""
      ? String(paymentStatusRaw).trim()
      : null;

  const review = booking.review || booking.rating || null;
  const reviewScore =
    review?.score ?? review?.rating ?? booking.customerRating ?? null;
  const reviewText =
    review?.comment || review?.text || booking.reviewComment || null;

  const cancelReason =
    booking.cancelReason ||
    booking.cancellationReason ||
    booking.cancel?.reason ||
    "Client Schedule Conflict (Cancelled >4h prior)";

  const image =
    booking.category?.image ||
    booking.image ||
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80&auto=format";

  return {
    id,
    reference: booking.reference || id,
    title: String(title),
    hasAssignee,
    provider: provider ? String(provider) : null,
    providerImage: providerImage ? String(providerImage) : null,
    providerRating,
    providerJobs,
    providerBadge: providerBadge ? String(providerBadge) : null,
    date: dateLabel,
    dateISO,
    time: String(time),
    durationLabel,
    scheduleWithDuration:
      scheduleWithDuration ||
      [dateLabel, time].filter(Boolean).join(" • ") ||
      "Schedule TBD",
    price,
    status,
    paymentLabel,
    reviewScore: reviewScore != null ? Number(reviewScore) : null,
    reviewText: reviewText ? String(reviewText) : null,
    cancelReason: String(cancelReason),
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

export function formatMoney(amount) {
  const n = Number(amount || 0);
  return `$${n.toFixed(2)}`;
}
