import { useState } from "react";
import BookCleaning from "./BookCleaning";
import ExtrasCondition from "./ExtrasCondition";
import PropertyDetails from "./PropertyDetails";
import PropertyType from "./PropertyType";
import ReviewBooking from "./ReviewBooking";
import ScheduleAddress from "./ScheduleAddress";

export default function BookingLayout() {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState("deep");
  const [propertyId, setPropertyId] = useState("flat");
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [extrasData, setExtrasData] = useState(null);
  const [schedule, setSchedule] = useState(null);

  if (step === 6) {
    return (
      <ReviewBooking
        serviceId={serviceId}
        propertyDetails={propertyDetails}
        extrasData={extrasData}
        schedule={schedule}
        onBack={() => setStep(5)}
        onEditSchedule={() => setStep(5)}
        onConfirm={() => {
          // Payment / success step can plug in here
        }}
      />
    );
  }

  if (step === 5) {
    return (
      <ScheduleAddress
        initialSchedule={schedule}
        onBack={() => setStep(4)}
        onContinue={(data) => {
          setSchedule(data);
          setStep(6);
        }}
      />
    );
  }

  if (step === 4) {
    return (
      <ExtrasCondition
        initialExtras={extrasData?.extras || ["oven", "windows"]}
        onBack={() => setStep(3)}
        onContinue={(data) => {
          setExtrasData(data);
          setStep(5);
        }}
      />
    );
  }

  if (step === 3) {
    return (
      <PropertyDetails
        initialPropertyId={propertyId}
        initialDetails={propertyDetails}
        onBack={() => setStep(2)}
        onContinue={(details) => {
          setPropertyDetails(details);
          setPropertyId(details.propertyId);
          setStep(4);
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <PropertyType
        initialPropertyId={propertyId}
        onBack={() => setStep(1)}
        onContinue={(id) => {
          setPropertyId(id);
          setStep(3);
        }}
      />
    );
  }

  return (
    <BookCleaning
      initialServiceId={serviceId}
      onContinue={(id) => {
        setServiceId(id);
        setStep(2);
      }}
    />
  );
}
