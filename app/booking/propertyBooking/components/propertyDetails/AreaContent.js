import { AREA_MARLA_CHIPS, SQFT_CHIPS } from "./constants";
import UnitMeasurementBlock from "./UnitMeasurementBlock";

export default function AreaContent({
  label = "Area",
  areaUnit,
  onAreaUnitChange,
  areaSize,
  onAreaSizeChange,
}) {
  const isMarla = areaUnit === "marla";
  const unitLabel = isMarla ? "Marla" : "sq ft";

  return (
    <UnitMeasurementBlock
      title={label}
      unitOptions={[
        { id: "sqft", label: "sq ft" },
        { id: "marla", label: "Marla" },
      ]}
      unitValue={areaUnit}
      onUnitChange={(id) => {
        onAreaUnitChange(id);
        onAreaSizeChange(id === "sqft" ? 1000 : 10);
      }}
      sizeValue={areaSize}
      unitLabel={unitLabel}
      onDecrement={() =>
        onAreaSizeChange((v) => Math.max(1, v - (isMarla ? 1 : 50)))
      }
      onIncrement={() =>
        onAreaSizeChange((v) => v + (isMarla ? 1 : 50))
      }
      chipOptions={isMarla ? AREA_MARLA_CHIPS : SQFT_CHIPS}
      onChipSelect={(v) => onAreaSizeChange(Number(v))}
      chipSuffix={unitLabel}
    />
  );
}
