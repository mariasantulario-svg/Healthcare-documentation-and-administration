import { useMemo, useState, useEffect } from "react";
import { Term } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, BookOpen, BarChart2 } from "lucide-react";

interface ProgressDashboardProps {
  terms: Term[];
}

export function ProgressDashboard({ terms }: ProgressDashboardProps) {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const loadStats = () => {
      try {
        const saved = localStorage.getItem("vocab-stats");
        setStats(saved ? JSON.parse(saved) : {});
      } catch {
        setStats({});
      }
    };

    loadStats();
    window.addEventListener("vocab-stats-updated", loadStats);
    return () => window.removeEventListener("vocab-stats-updated", loadStats);
  }, []);

  const masteredTerms = useMemo(() => {
    return terms.filter(t => stats[t.id]?.correct >= 2);
  }, [terms, stats]);

  const overallAccuracy = useMemo(() => {
    let totalCorrect = 0;
    let totalAttempts = 0;
    Object.values(stats).forEach((s: any) => {
      totalCorrect += s.correct || 0;
      totalAttempts += s.attempts || 0;
    });
    return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  }, [stats]);

  const unitProgress = useMemo(() => {
    const units = Array.from(new Set(terms.map(t => t.unitNumber))).sort((a, b) => a - b);
    return units.map(u => {
      const unitTerms = terms.filter(t => t.unitNumber === u);
      const masteredInUnit = unitTerms.filter(t => stats[t.id]?.correct >= 2).length;
      return {
        number: u,
        title: unitTerms[0]?.unitTitle || `Unit ${u}`,
        progress: Math.round((masteredInUnit / unitTerms.length) * 100),
        total: unitTerms.length,
        mastered: masteredInUnit
      };
    });
  }, [terms, stats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <BarChart2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAccuracy}%</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terms Mastered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masteredTerms.length} / {terms.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Units</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unitProgress.filter(u => u.progress > 0).length} / {unitProgress.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Unit Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {unitProgress.map((unit) => (
                  <div key={unit.number} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{unit.number}. {unit.title}</span>
                      <span className="text-muted-foreground">{unit.mastered}/{unit.total}</span>
                    </div>
                    <Progress value={unit.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm">
          <CardHeader>
            <CardTitle>Mastered Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-1 gap-2">
                {masteredTerms.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No terms mastered yet. Keep practicing!</p>
                ) : (
                  masteredTerms.map((term) => (
                    <div key={term.id} className="flex items-center gap-2 p-2 rounded-lg bg-green-50/80 border border-green-100">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{term.term}</span>
                        <span className="text-xs text-muted-foreground truncate">{term.definition}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
