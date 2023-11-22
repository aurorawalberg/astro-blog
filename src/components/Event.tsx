import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  frontmatter: CollectionEntry<"speaking">["data"];
}

export default function Event({ frontmatter }: Props) {
  const { name, link, pubDatetime, description, organizer } = frontmatter;

  return (
    <li className="my-6">
      <h3 className="text-lg font-medium decoration-dashed">{organizer}</h3>
      <a
        href={link}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 hover:underline focus-visible:no-underline focus-visible:underline-offset-0"
      >
        <h2>{name}</h2>
      </a>
      <Datetime datetime={pubDatetime} />
      <p>{description}</p>
    </li>
  );
}
