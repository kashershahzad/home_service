import BhkSelector from "./BhkSelector";
import { BHK_OPTIONS, FLAT_ROOMS } from "./constants";
import RoomCountsCard from "./RoomCountsCard";

export default function FlatContent({
  bhk,
  onBhkChange,
  roomCounts,
  onChangeCount,
  bhkOptions,
  rooms,
}) {
  const options =
    Array.isArray(bhkOptions) && bhkOptions.length ? bhkOptions : BHK_OPTIONS;
  const roomList = Array.isArray(rooms) && rooms.length ? rooms : FLAT_ROOMS;

  return (
    <>
      <BhkSelector options={options} value={bhk} onChange={onBhkChange} />

      <RoomCountsCard
        rooms={roomList}
        roomCounts={roomCounts}
        onChangeCount={onChangeCount}
      />
    </>
  );
}
