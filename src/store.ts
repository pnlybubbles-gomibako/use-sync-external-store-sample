import { useCallback, useSyncExternalStore } from "react";
import { unreachable } from "./utils";

export type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

class Store<T> {
  private cache: T | undefined;
  private state:
    | { type: "ready" }
    | {
        type: "pending";
        promise: Promise<void>;
        abortController: AbortController;
      }
    | { type: "error"; error: Error } = { type: "ready" };
  private listeners: (() => void)[] = [];

  constructor(private fetcher: Fetcher<T>) {}

  public getStateOrThrow() {
    if (this.cache !== undefined) {
      return this.cache;
    }

    if (this.state.type === "pending") {
      throw this.state.promise;
    } else if (this.state.type === "error") {
      throw this.state.error;
    } else if (this.state.type === "ready") {
      throw this.revalidate();
    }

    return unreachable(this.state);
  }

  public revalidate() {
    if (this.state.type === "pending") {
      this.state.abortController.abort();
    }

    const abortController = new AbortController();

    const promise = this.fetcher(abortController.signal)
      .then((data) => {
        this.cache = data;
        this.state = {
          type: "ready",
        };
        this.triggerChange();
      })
      .catch((error) => {
        this.state = {
          type: "error",
          error,
        };
      });

    this.state = {
      type: "pending",
      promise,
      abortController,
    };

    return promise;
  }

  private triggerChange() {
    for (const cb of this.listeners) cb();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);

    return () => {
      const index = this.listeners.indexOf(cb);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public clearCache() {
    this.cache = undefined;
    this.state = { type: "ready" };
    this.triggerChange();
  }
}

const globalStore = new Map<string, Store<unknown>>();

export function useStore<T>(cacheKey: string, fetcher: Fetcher<T>) {
  const cachedStore = globalStore.get(cacheKey) as Store<T> | undefined;
  const store = cachedStore ?? new Store(fetcher);

  if (cachedStore === undefined) {
    globalStore.set(cacheKey, store);
  }

  const state = useSyncExternalStore(
    useCallback((cb) => store.subscribe(cb), [store]),
    () => store.getStateOrThrow()
  );

  const revalidate = useCallback(() => store.revalidate(), [store]);
  const clearCache = useCallback(() => store.clearCache(), [store]);

  return [state, { revalidate, clearCache }] as const;
}
