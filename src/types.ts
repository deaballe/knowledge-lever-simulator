export type Construct =
  | "KS"
  | "HC"
  | "SC"
  | "RC"
  | "TC"
  | "AC"
  | "IN"
  | "OP";

export type Lever = Exclude<Construct, "IN" | "OP">;

export type ConstructScores = Record<Construct, number>;

export type LeverDeltas = Partial<Record<Lever, number>>;

export type PropagationResult = {
  dHC: number;
  dRC: number;
  dTC: number;
  dSC: number;
  dAC: number;
  dIN: number;
  dOP: number;
};

export type PriorityItem = {
  lever: Lever;
  label: string;
  totalEffectIN: number;
  totalEffectOP: number;
  priority: number;
  score: number;
};

export type TrafficLight = "green" | "yellow" | "red";
