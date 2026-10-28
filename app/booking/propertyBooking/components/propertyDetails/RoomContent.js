import AreaContent from "./AreaContent";
import DropdownField from "./DropdownField";

export default function RoomContent({
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
        subtitle="Does this room include washrooms?"
        value={hasWashrooms}
        options={["Yes", "No"]}
        onSelect={onHasWashroomsChange}
      />
      <DropdownField
        title="Kitchen"
        subtitle="Does this room include a kitchen or pantry area?"
        value={hasKitchen}
        options={["Yes", "No"]}
        onSelect={onHasKitchenChange}
      />
    </>
  );
}
