import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProjectById,
  getProjectMetadataDescription,
  getProjects,
} from "@/lib/data";
import ProjectPage from "./ProjectPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  return {
    title: project ? project.title : "프로젝트 상세",
    description: project ? getProjectMetadataDescription(project) : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectPage project={project} />;
}
