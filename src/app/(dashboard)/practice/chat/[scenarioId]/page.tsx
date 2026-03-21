import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scenarios, type Scenario } from "@/lib/ai/scenarios";
import { ChatInterface } from "@/components/practice/ChatInterface";

interface PageProps {
  params: Promise<{ scenarioId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { scenarioId } = await params;

  // Find scenario
  const scenario: Scenario | undefined = scenarios.find(
    (s) => s.id === scenarioId
  );
  if (!scenario) redirect("/practice");

  // Get user's active language
  const userLang = await db.userLanguage.findFirst({
    where: { userId: session.user.id },
    include: { language: true },
    orderBy: { startedAt: "desc" },
  });

  if (!userLang) redirect("/learn");

  // Check for existing conversation with this scenario
  const existingConversation = await db.conversation.findFirst({
    where: {
      userId: session.user.id,
      scenarioId,
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const existingMessages = existingConversation
    ? (
        existingConversation.messages as Array<{
          role: "user" | "assistant";
          content: string;
        }>
      ).map((m, i) => ({
        id: `${m.role}-${i}`,
        role: m.role,
        content: m.content,
      }))
    : undefined;

  return (
    <ChatInterface
      scenarioId={scenarioId}
      scenarioTitle={scenario.title}
      scenarioIcon={scenario.icon}
      scenarioDescription={scenario.description}
      languageName={userLang.language.name}
      level={userLang.level}
      existingConversationId={existingConversation?.id}
      existingMessages={existingMessages}
    />
  );
}
