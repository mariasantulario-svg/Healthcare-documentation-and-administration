import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { useTerms } from "@/hooks/use-terms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flashcard } from "@/components/game/Flashcard";
import { MatchingGame } from "@/components/game/MatchingGame";
import { QuizMode } from "@/components/game/QuizMode";
import { FillInBlanks } from "@/components/game/FillInBlanks";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: terms, isLoading, error } = useTerms();
  
  // Filtering State
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [currentMode, setCurrentMode] = useState("flashcards");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derived Data
  const filteredTerms = useMemo(() => {
    if (!terms) return [];
    
    return terms.filter(term => {
      const courseMatch = selectedCourse === "all" || term.course === selectedCourse;
      const unitMatch = selectedUnit === "all" || term.unitNumber.toString() === selectedUnit;
      return courseMatch && unitMatch;
    });
  }, [terms, selectedCourse, selectedUnit]);

  // Available Units for Filter
  const availableUnits = useMemo(() => {
    if (!terms) return [];
    // Map of unitNumber to unitTitle
    const unitMap = new Map<number, string>();
    terms.forEach(t => {
      if (!unitMap.has(t.unitNumber)) {
        unitMap.set(t.unitNumber, t.unitTitle);
      }
    });
    return Array.from(unitMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([number, title]) => ({ number, title }));
  }, [terms]);

  // Reset index when filters change
  useMemo(() => {
    setCurrentIndex(0);
  }, [selectedCourse, selectedUnit, currentMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <Loader2 className="w-8 h-8 animate-spin mr-2 text-primary" />
        <span className="text-lg font-medium">Loading vocabulary...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <AlertCircle className="w-8 h-8 mr-2 text-destructive" />
        <span className="text-lg font-medium">Error loading data. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-slate-50/50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Controls Section */}
        <Card className="glass-panel border-0 p-6 mb-8 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white border-white/20 rounded-xl shadow-sm">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border shadow-xl">
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="1º Curso">1º Curso (Units 1-9)</SelectItem>
                  <SelectItem value="2º Curso">2º Curso (Units 10-18)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-full sm:w-[240px] bg-white border-white/20 rounded-xl shadow-sm">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border shadow-xl">
                  <SelectItem value="all">All Units</SelectItem>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit.number} value={unit.number.toString()}>
                      {unit.number}. {unit.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
              {filteredTerms.length} terms available
            </div>
          </div>
        </Card>

        {/* Game Area */}
        <Tabs 
          value={currentMode} 
          onValueChange={setCurrentMode}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="bg-black/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner">
              <TabsTrigger 
                value="flashcards" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
              >
                Flashcards
              </TabsTrigger>
              <TabsTrigger 
                value="matching" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
              >
                Matching
              </TabsTrigger>
              <TabsTrigger 
                value="quiz" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
              >
                Quiz
              </TabsTrigger>
              <TabsTrigger 
                value="fillblank" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
              >
                Fill Blanks
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
              >
                Progress
              </TabsTrigger>
            </TabsList>
          </div>

          <motion.div
            key={currentMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="glass-panel border-0 min-h-[500px] rounded-3xl overflow-hidden relative">
              {filteredTerms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground p-8 text-center">
                  <p className="text-xl mb-2">No terms found for this selection.</p>
                  <p className="text-sm">Try adjusting your filters to see more vocabulary.</p>
                </div>
              ) : (
                <div className="p-4 md:p-8 h-full">
                  <TabsContent value="flashcards" className="mt-0 h-full">
                    <Flashcard 
                      key={filteredTerms[currentIndex].id} // Force remount on term change for flip reset
                      term={filteredTerms[currentIndex]} 
                      onNext={() => setCurrentIndex(i => Math.min(i + 1, filteredTerms.length - 1))}
                      onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
                      isFirst={currentIndex === 0}
                      isLast={currentIndex === filteredTerms.length - 1}
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground/50">
                      Card {currentIndex + 1} of {filteredTerms.length}
                    </div>
                  </TabsContent>

                  <TabsContent value="matching" className="mt-0 h-full">
                    <MatchingGame 
                      terms={filteredTerms}
                      onComplete={() => console.log("Matching round done")} 
                    />
                  </TabsContent>

                  <TabsContent value="quiz" className="mt-0 h-full">
                    <QuizMode 
                      terms={filteredTerms}
                      onComplete={() => setCurrentIndex(0)} // Simple reset for now
                    />
                  </TabsContent>

                  <TabsContent value="fillblank" className="mt-0 h-full">
                    <FillInBlanks
                      currentIndex={currentIndex}
                      terms={filteredTerms}
                      onNext={() => setCurrentIndex(i => Math.min(i + 1, filteredTerms.length - 1))}
                      onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground/50">
                      Question {currentIndex + 1} of {filteredTerms.length}
                    </div>
                  </TabsContent>

                  <TabsContent value="progress" className="mt-0 h-full">
                    <ProgressDashboard terms={terms || []} />
                  </TabsContent>
                </div>
              )}
            </Card>
          </motion.div>
        </Tabs>
      </main>
    </div>
  );
}
