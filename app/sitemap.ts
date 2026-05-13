import { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://soma.wibaek.com";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      priority: 1,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getProjects().map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    changeFrequency: "weekly",
  }));

  return [...routes, ...projectRoutes];
}
