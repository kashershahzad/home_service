import { useState } from "react";
import BookCleaning from "./BookCleaning";
import ExtrasCondition from "./ExtrasCondition";
import PropertyDetails from "./PropertyDetails";
import PropertyType from "./PropertyType";

export default function BookingLayout() {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState("deep");
  const [propertyId, setPropertyId] = useState("flat");
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [extrasData, setExtrasData] = useState(null);

  if (step === 4) {
    return (
      <ExtrasCondition
        initialConditionId={extrasData?.conditionId || "moderate"}
        initialExtras={extrasData?.extras || ["oven", "windows"]}
        onBack={() => setStep(3)}
        onContinue={(data) => {
          setExtrasData(data);
          // Next step will plug in here
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
