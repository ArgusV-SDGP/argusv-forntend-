export type RuntimeConfig = Record<string, string | number | boolean | null>;

export type RagEntry = {
  key: string;
  group: string;
  value: unknown;
};

