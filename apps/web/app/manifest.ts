import type { MetadataRoute } from "next"

// What a phone uses when the app is added to its home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "contatempo",
    short_name: "contatempo",
    description: "A simple time tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
