export type RuntimeConfig = Record<string, string | number | boolean | null>;

export type RagEntry = {
  key: string;
  group: string;
  value: unknown;
};

export type NotifRule = {
  id: string;
  zone_id: string;
  severity: string;
  channels: string[];
  config: Record<string, unknown>;
};
