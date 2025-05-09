"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  id: z.string().min(1, "프로젝트 ID는 필수입니다"),
  title: z.string().min(1, "프로젝트 제목은 필수입니다"),
  link: z
    .string()
    .url("올바른 URL을 입력해주세요")
    .optional()
    .or(z.literal("")),
  description: z.string().min(1, "프로젝트 설명은 필수입니다"),
  imageUrl: z
    .string()
    .url("올바른 URL을 입력해주세요")
    .optional()
    .or(z.literal("")),
  type: z.enum(["Web", "App", "AI"]),
  generation: z.string().min(1, "기수는 필수입니다"),
});

export default function ProjectForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      title: "",
      link: "",
      description: "",
      imageUrl: "",
      type: "Web",
      generation: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const projectRef = doc(db, "projects", values.id);
      await setDoc(projectRef, {
        ...values,
        generation: parseInt(values.generation),
        createdAt: new Date().toISOString(),
      });
      router.replace("/admin/new");
    } catch (error) {
      console.error("Error adding project:", error);
      setError(
        error instanceof Error
          ? error.message
          : "프로젝트 추가 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>새 프로젝트 추가</CardTitle>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 돌아가기
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  오류가 발생했습니다
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프로젝트 ID</FormLabel>
                  <FormControl>
                    <Input placeholder="프로젝트 ID를 입력하세요" {...field} />
                  </FormControl>
                  <FormDescription>
                    프로젝트를 식별하는 고유한 ID입니다. 영문자, 숫자,
                    하이픈(-)만 사용 가능합니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프로젝트 제목</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="프로젝트 이름을 입력하세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프로젝트 링크</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormDescription>선택사항</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프로젝트 설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="프로젝트에 대한 설명을 입력하세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이미지 URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormDescription>선택사항</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프로젝트 유형</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="프로젝트 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="App">App</SelectItem>
                        <SelectItem value="AI">AI</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="generation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>기수</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="예: 14" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : "프로젝트 추가"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
