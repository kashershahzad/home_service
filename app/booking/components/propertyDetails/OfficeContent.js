import AreaContent from "./AreaContent";
import DropdownField from "./DropdownField";

export default function OfficeContent({
  areaUnit,
  onAreaUnitChange,
  areaSize,
  onAreaSizeChange,
  hasWashrooms,
  onHasWashroomsChange,
  hasKitchen,
  onHasKitchenChange,
}) {
  return (
    <>
      <AreaContent
        label="Area"
        areaUnit={areaUnit}
        onAreaUnitChange={onAreaUnitChange}
        areaSize={areaSize}
        onAreaSizeChange={onAreaSizeChange}
      />
      <DropdownField
        title="Washrooms"
        subtitle="Does this office include washrooms?"
        value={hasWashrooms}
        options={["Yes", "No"]}
        onSelect={onHasWashroomsChange}
      />
      <DropdownField
        title="Kitchen"
        subtitle="Does this office include a kitchen or pantry area?"
        value={hasKitchen}
        options={["Yes", "No"]}
        onSelect={onHasKitchenChange}
      />
    </>
  );
}
