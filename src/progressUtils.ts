import useSWR from 'swr';

const sizeShouldBe = 1109000

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

const progress = {
  percentage: 0,
}

export async function getArtifacts() {
  return await fetch("https://api.github.com/repos/isledecomp/isle/actions/artifacts").then(res => res.json());
}

export async function loadEntries(): Promise<Entry[]> {
  const size = await getArtifacts();
  const entries: Entry[] = [];

  size.artifacts.forEach(art => {
    entries.push({
      version: "1.1",
      time: art.created_at,
      total: sizeShouldBe,
      decompiled: (art.size_in_bytes - 4888 - 904 - 41984 - 20995),
    })
  });

  for (const entry of entries) {
    // use the last entry to find out the total number of functions / bytes to decompile
    entry.total = entries[entries.length - 1].total;
  }

  return entries;
}

export async function getCurrentProgress(): Promise<String> {
  await loadEntries()
  console.log(progress.percentage)
  return JSON.stringify(progress.percentage) + "%";
}

export function useCurrentProgressText() {
  return useSWR("*progressText", getCurrentProgress);
}
