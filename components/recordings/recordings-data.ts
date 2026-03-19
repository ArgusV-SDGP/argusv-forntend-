export type MetadataEvent = {
  time: string;
  text: string;
  color: string;
};

export const METADATA_EVENTS: MetadataEvent[] = [
  {
    time: "03:02 PM",
    text: "VLM: A delivery van arrived and parked near the entrance.",
    color: "bg-emerald-500",
  },
  {
    time: "03:15 PM",
    text: "VLM: Two people walked from the van toward the building.",
    color: "bg-blue-500",
  },
  {
    time: "03:20 PM",
    text: "VLM: A person in a red jacket left a package.",
    color: "bg-lime-500",
  },
];

export const TIMELINE_INTENSITY = [
  8, 12, 18, 68, 22, 76, 80, 30, 12, 20, 10, 0, 16, 54, 18, 0, 70, 24, 18, 12,
  28, 74, 82, 76, 20, 14, 18, 48, 16, 0, 0, 36, 0, 14, 0, 0, 0, 0, 10, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
];

export const TIMELINE_LABELS = [
  "00:00",
  "02:00",
  "04:00",
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
  "24:00",
];
