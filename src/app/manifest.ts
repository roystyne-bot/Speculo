import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Speculo",
    short_name: "Speculo",
    description: "AI Mock Interview Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F9F2",
    theme_color: "#75F94C",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}