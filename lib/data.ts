import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore"
import { db } from "./firebase"

export type Project = {
  id: string
  title: string
  link: string
  description: string
  imageUrl: string
  rank: number | null // null = not ranked, 0 = ranked but unknown position
  type: string // e.g., "Web", "App", "AI"
  generation: number // 소프트웨어 마에스트로 기수
}

// 모든 프로젝트 가져오기
export async function getProjects(): Promise<Project[]> {
  try {
    const projectsRef = collection(db, "projects")
    const projectsSnapshot = await getDocs(projectsRef)

    return projectsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        link: data.link,
        description: data.description,
        imageUrl: data.imageUrl,
        rank: data.rank,
        type: data.type,
        generation: data.generation,
      } as Project
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

// 특정 ID의 프로젝트 가져오기
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, "projects", id)
    const projectSnapshot = await getDoc(projectRef)

    if (!projectSnapshot.exists()) {
      return null
    }

    const data = projectSnapshot.data()
    return {
      id: projectSnapshot.id,
      title: data.title,
      link: data.link,
      description: data.description,
      imageUrl: data.imageUrl,
      rank: data.rank,
      type: data.type,
      generation: data.generation,
    } as Project
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}

// 필터링된 프로젝트 가져오기
export async function getFilteredProjects(
  typeFilter: string | null,
  generationFilter: number | null,
  excellentOnly: boolean,
): Promise<Project[]> {
  try {
    const projectsQuery = collection(db, "projects")
    const constraints = []

    // 필터 적용
    if (typeFilter) {
      constraints.push(where("type", "==", typeFilter))
    }

    if (generationFilter) {
      constraints.push(where("generation", "==", generationFilter))
    }

    if (excellentOnly) {
      constraints.push(where("rank", "!=", null))
    }

    // 쿼리 실행
    const querySnapshot = await getDocs(constraints.length > 0 ? query(projectsQuery, ...constraints) : projectsQuery)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        link: data.link,
        description: data.description,
        imageUrl: data.imageUrl,
        rank: data.rank,
        type: data.type,
        generation: data.generation,
      } as Project
    })
  } catch (error) {
    console.error("Error fetching filtered projects:", error)
    return []
  }
}

// 프로젝트 타입 목록 가져오기
export async function getProjectTypes(): Promise<string[]> {
  try {
    const projectsRef = collection(db, "projects")
    const projectsSnapshot = await getDocs(projectsRef)

    const types = new Set<string>()
    projectsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.type) {
        types.add(data.type)
      }
    })

    return Array.from(types)
  } catch (error) {
    console.error("Error fetching project types:", error)
    return []
  }
}

// 프로젝트 기수 목록 가져오기
export async function getProjectGenerations(): Promise<number[]> {
  try {
    const projectsRef = collection(db, "projects")
    const projectsSnapshot = await getDocs(projectsRef)

    const generations = new Set<number>()
    projectsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.generation) {
        generations.add(data.generation)
      }
    })

    return Array.from(generations).sort((a, b) => b - a) // 내림차순 정렬
  } catch (error) {
    console.error("Error fetching project generations:", error)
    return []
  }
}
