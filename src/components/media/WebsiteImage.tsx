"use client";

import Image, { type ImageProps } from "next/image";
import { isWebsiteMediaSrc } from "@/lib/website-media/paths";

export function WebsiteImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return (
    <Image
      {...props}
      alt={props.alt}
      unoptimized={props.unoptimized || isWebsiteMediaSrc(src)}
    />
  );
}
