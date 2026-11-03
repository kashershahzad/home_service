import { useState } from "react";
import BookCleaning from "./BookCleaning";
import ConfirmedBooking from "./confirmedBooking/ConfirmedBooking";
import LiveTracking from "./confirmedBooking/LiveTracking";
import TrackBooking from "./confirmedBooking/TrackBooking";
import ExtrasCondition from "./ExtrasCondition";
import PropertyDetails from "./PropertyDetails";
import PropertyType from "./PropertyType";
import ReviewBooking from "./ReviewBooking";
import ScheduleAddress from "./ScheduleAddress";

function createBookingId() {
  return `HC${Math.floor(1000000 + Math.random() * 9000000)}`;
}

export default function BookingLayout() {
  const [step, setStep] = useState(7);
  const [serviceId, setServiceId] = useState("deep");
  const [propertyId, setPropertyId] = useState("flat");
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [extrasData, setExtrasData] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [bookingId, setBookingId] = useState("HC8427391");

  if (step === 9) {
    return (
      <LiveTracking
        schedule={schedule}
        onBack={() => setStep(8)}
      />
    );
  }

  if (step === 8) {
    return (
      <TrackBooking
        serviceId={serviceId}
        schedule={schedule}
        bookingId={bookingId}
        onBack={() => setStep(7)}
        onNext={() => setStep(9)}
      />
    );
  }

  if (step === 7) {
    return (
      <ConfirmedBooking
        serviceId={serviceId}
        schedule={schedule}
        bookingId={bookingId}
        onBack={() => setStep(6)}
        onTrack={() => setStep(8)}
      />
    );
  }

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
          setBookingId((current) => current || createBookingId());
          setStep(7);
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
