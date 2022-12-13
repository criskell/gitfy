export interface Ref {
  name: string;
  value: string;
  symbolic?: boolean;
}

export type SymbolicRef = Ref & { symbolic: true };
export type DirectRef = Ref & { symbolic: false };
