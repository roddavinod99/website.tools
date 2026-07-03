import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { learningTopics } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return learningTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = learningTopics.find((t) => t.slug === slug);
  if (!topic) return {};
  return {
    title: `${topic.title} - Learning`,
    description: topic.description,
  };
}

export default async function LearningTopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = learningTopics.find((t) => t.slug === slug);
  if (!topic) notFound();
  return redirect(`/guides/${slug}`);
}
