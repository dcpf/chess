export type SetUserPrefRequest = {
  userEmail: string;
  name: string;
  value: unknown;
};

export type UserPrefs = Record<string, unknown>;
