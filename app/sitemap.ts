import { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://soma.wibaek.com";

  // 메인 페이지
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1,
    },
  ];

  try {
    // 모든 프로젝트 가져오기
    const projects = await getProjects();

    // 각 프로젝트에 대한 URL 생성
    const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      changeFrequency: "weekly" as const,
    }));

    return [...routes, ...projectRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // 에러 발생 시 메인 페이지만 반환
    return routes;
  }
}
