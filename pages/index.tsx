import { Suspense } from "react";
import { Fetcher, useStore } from "../src/store";

type Response = {
  fact: string;
  length: number;
};

const fetchCat: Fetcher<Response> = (signal) =>
  fetch("https://catfact.ninja/fact", { signal }).then((v) => v.json());

const Statement = () => {
  const [data, { revalidate, clearCache }] = useStore("cat", fetchCat);

  return (
    <p>
      <button onClick={revalidate}>revalidate</button>{" "}
      <button onClick={clearCache}>clearCache</button> {data.fact}
    </p>
  );
};

const delay =
  (ms: number): Fetcher<Date> =>
  (signal) =>
    new Promise((resolve) => {
      const id = setTimeout(() => resolve(new Date()), ms);
      signal.addEventListener("abort", () => clearTimeout(id));
    });

const Timer = () => {
  const [finishedTime, { revalidate, clearCache }] = useStore(
    "timer",
    delay(500)
  );

  return (
    <p>
      <button onClick={revalidate}>revalidate</button>{" "}
      <button onClick={clearCache}>clearCache</button> timer finished at{" "}
      {finishedTime.toISOString()}
    </p>
  );
};

export default () => {
  return (
    <main>
      <h1>useSyncExternalStoreSample</h1>
      <p>
        revalidate:
        キャッシュされたデータを表示しながら裏でデータフェッチを行う。新しいデータが取得できたら再描画する。
      </p>
      <p>
        clearCache:
        キャッシュされたデータを削除し、ローディング(fallback)を表示しながらデータフェッチを行う。新しいデータが取得できたら描画(resume)する。
      </p>
      <Suspense fallback={<p>loading...</p>}>
        <Statement />
      </Suspense>
      <Suspense fallback={<p>waiting timer...</p>}>
        <Timer />
      </Suspense>
    </main>
  );
};
