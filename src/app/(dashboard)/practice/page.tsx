"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Layers } from "lucide-react";
import { scenarios } from "@/lib/ai/scenarios";

export default function PracticePage() {
  const freeScenarios = scenarios.filter((s) => !s.isPremium);
  const premiumScenarios = scenarios.filter((s) => s.isPremium);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pratiquer</h1>
          <p className="text-muted-foreground">
            Choisis une situation et pratique avec l&apos;IA
          </p>
        </div>
        <Link href="/practice/flashcards" className={buttonVariants({ variant: "outline" })}>
            <Layers className="mr-2 h-4 w-4" />
            Flashcards
        </Link>
      </div>

      {/* Flashcard review reminder */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="font-semibold">12 mots à réviser aujourd&apos;hui</p>
            <p className="text-sm text-muted-foreground">
              Ta session quotidienne de flashcards t&apos;attend
            </p>
          </div>
          <Link href="/practice/flashcards" className={buttonVariants()}>
              Réviser
              <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      {/* Free scenarios */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Situations disponibles</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {freeScenarios.map((scenario) => (
            <Link key={scenario.id} href={`/practice/chat/${scenario.id}`}>
              <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{scenario.icon}</span>
                    <Badge variant="secondary">{scenario.level}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold">{scenario.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {scenario.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Premium scenarios */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Situations premium
          <Badge variant="outline" className="ml-2">
            10€/mois
          </Badge>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {premiumScenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="relative cursor-not-allowed opacity-60"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{scenario.icon}</span>
                  <Badge>{scenario.level}</Badge>
                </div>
                <h3 className="mt-3 font-semibold">{scenario.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {scenario.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
