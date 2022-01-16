import { resolve } from "path";
import { constants } from "fs";
import { lstat, access } from "fs/promises";

export async function getDirectories(inputs: string[], write: boolean = false) {
  const result: {
    resolved: { input: string; path: string }[];
    unresolved: { input: string; reason: string }[];
  } = {
    resolved: [],
    unresolved: [],
  };
  for (let input of inputs) {
    try {
      const path = resolve(process.cwd(), input);
      const stat = await lstat(path);
      if (stat.isDirectory()) {
        write
          ? await access(path, constants.W_OK)
          : await access(path, constants.R_OK);
        result.resolved.push({ input, path });
      } else {
        result.unresolved.push({ input, reason: "Not a directory" });
      }
    } catch (err) {
      if (err instanceof Error) {
        result.unresolved.push({ input, reason: err.message });
      } else {
        result.unresolved.push({ input, reason: "Unexpected error occurred" });
      }
    }
  }
  return result;
}
