export type CameraApiResponse = {
  camera_id: string;
  name: string;
  status: string;
  fps: number;
};

export type CameraGridItem = {
  cameraId: string;
  liveStreamId: string;
  streamPath: string;
  name: string;
  status: string;
  fps: number;
  active: boolean;
  span: string;
};

const GRID_SPANS = [
  "col-span-1 md:col-span-2 row-span-1 md:row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

export function mapCameraToGridItem(
  camera: CameraApiResponse,
  index: number,
): CameraGridItem {
  const isOnline = camera.status.toLowerCase() === "online";

  return {
    cameraId: camera.camera_id,
    liveStreamId: camera.camera_id,
    streamPath: camera.camera_id,
    name: camera.name,
    status: camera.status,
    fps: camera.fps,
    active: index === 0 && isOnline,
    span: GRID_SPANS[index] ?? "col-span-1 row-span-1",
  };
}

export function mapCamerasToGridItems(cameras: CameraApiResponse[]) {
  return cameras.map(mapCameraToGridItem);
}
