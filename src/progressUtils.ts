import useSWR from 'swr';

export type Counts = {
  /// Number of functions.
  count: number,
  /// Number of bytes.
  size: number,
};

export type Entry = {
  version: string,
  time: Date,
  total: number,
  decompiled: number,
};

export async function loadEntries(): Promise<Entry[]> {
  const sizeShouldBe = 1109000
  const size = await fetch("https://api.github.com/repos/isledecomp/isle/actions/artifacts").then(res => res.json());
  const entries: Entry[] = [];

  size.artifacts.forEach(art => {
    entries.push({
      version: "1.1",
      time: art.created_at,
      total: sizeShouldBe,
      decompiled: (art.size_in_bytes - 4888 - 904 - 41984 - 20995) / 1000,
    })
  });

  for (const entry of entries) {
    // use the last entry to find out the total number of functions / bytes to decompile
    entry.total = entries[entries.length - 1].total;
  }

  return entries;
}

export async function getCurrentProgressText(): Promise<string> {
  const res = await fetch(CURRENT_PROGRESS_JSON_PATH).then(res => res.json());
  return res.message;
}

export function useCurrentProgressText() {
  return useSWR("*progressText", getCurrentProgressText);
}
