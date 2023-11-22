import type { CollectionEntry } from "astro:content";

const getSortedEvents = (posts: CollectionEntry<"speaking">[]) =>
  posts.sort(
    (a, b) =>
      Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
      Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
  );

export default getSortedEvents;
