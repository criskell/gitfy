export type RequireProps<T, K extends keyof T> = T & {
  [P in K]-?: T[P]
};

export type NullableProps<T, K extends keyof T> = T & {
  [P in K]?: T[P]
};