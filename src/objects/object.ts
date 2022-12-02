import { Blob } from "./blob";

export type ObjectId = string;
export type GitObject = Blob;
export enum ObjectType {
  BLOB = "blob",
};