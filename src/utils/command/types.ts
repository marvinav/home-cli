export interface DefaultOptions {
  verbose: boolean;
  yes: boolean;
}

export type Options<T> = T & DefaultOptions;
