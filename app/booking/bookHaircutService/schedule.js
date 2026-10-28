import { useLocalSearchParams, useRouter } from "expo-router";
import ScheduleAddress from "../propertyBooking/ScheduleAddress";

export default function HaircutSchedule() {
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <ScheduleAddress
      initialSchedule={null}
      hideSteps
      onBack={() => router.back()}
      onContinue={(schedule) => {
        router.push({
          pathname: "/payment-method",
          params: {
            ...params,
            scheduleDate: schedule?.date || "",
            scheduleTime: schedule?.displayTime || "",
            scheduleTimeLabel: schedule?.timeLabel || "",
            scheduleTimeRange: schedule?.timeRange || "",
            addressLabel: schedule?.address?.label || "",
            addressLine: schedule?.address?.line || "",
            bookingType: "haircut",
          },
        });
      }}
    />
  );
}
