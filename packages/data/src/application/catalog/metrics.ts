export type GenerationMetric = {
  day: string;
  solar: number;
  wind: number;
};

export const generation: GenerationMetric[] = [
  { day: "Mon", solar: 42, wind: 27 },
  { day: "Tue", solar: 48, wind: 25 },
  { day: "Wed", solar: 54, wind: 31 },
  { day: "Thu", solar: 51, wind: 36 },
  { day: "Fri", solar: 60, wind: 34 },
  { day: "Sat", solar: 64, wind: 39 },
  { day: "Sun", solar: 68, wind: 42 },
];
