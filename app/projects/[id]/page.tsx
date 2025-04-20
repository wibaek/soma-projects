import { Metadata } from "next";
import { getProjectById } from "@/lib/data";
import ProjectPage from "./ProjectPage";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const project = await getProjectById(params.id);

  return {
    title: project ? `${project.title}` : "프로젝트 상세",
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  return <ProjectPage project={project} />;
}
