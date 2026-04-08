import { useState } from "react";
import { Term } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizModeProps {
  terms: Term[];
  onComplete: () => void;
}

export function QuizMode({ terms, onComplete }: QuizModeProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [options, setOptions] = useState<Term[]>([]);

  // Generate options for current question
  const currentTerm = terms[currentIdx];

  // Initialize options when index changes
  useState(() => {
    generateOptions();
  });

  function generateOptions() {
    if (!currentTerm) return;
    
    // Get 3 incorrect options
    const otherTerms = terms.filter(t => t.id !== currentTerm.id);
    const shuffledOthers = [...otherTerms].sort(() => Math.random() - 0.5).slice(0, 3);
    
    // Combine and shuffle
    const allOptions = [currentTerm, ...shuffledOthers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  }

  // Effect to regenerate options when index advances
  // (In a real app, use useEffect with dependency on currentIdx)
  if (currentTerm && options.length === 0) {
      generateOptions();
  }

  const handleAnswer = (termId: number) => {
    if (isAnswered) return;
    
    setSelectedOption(termId);
    setIsAnswered(true);

    if (termId === currentTerm.id) {
      setScore(s => s + 1);
      updateStats(currentTerm.id, true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });
    } else {
      updateStats(currentTerm.id, false);
    }
  };

  const updateStats = (termId: number, isCorrect: boolean) => {
    try {
      const saved = localStorage.getItem("vocab-stats");
      const stats = saved ? JSON.parse(saved) : {};
      
      if (!stats[termId]) {
        stats[termId] = { correct: 0, attempts: 0 };
      }
      
      stats[termId].attempts += 1;
      if (isCorrect) {
        stats[termId].correct += 1;
      }
      
      localStorage.setItem("vocab-stats", JSON.stringify(stats));
      window.dispatchEvent(new Event("vocab-stats-updated"));
    } catch (e) {
      console.error("Failed to save stats", e);
    }
  };

  const handleNext = () => {
    if (currentIdx < terms.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      
      // Need to regenerate options for next question
      // This is a simplified logic - ideally handled by a useEffect
      setTimeout(() => {
         const nextTerm = terms[currentIdx + 1];
         const otherTerms = terms.filter(t => t.id !== nextTerm.id);
         const shuffledOthers = [...otherTerms].sort(() => Math.random() - 0.5).slice(0, 3);
         const allOptions = [nextTerm, ...shuffledOthers].sort(() => Math.random() - 0.5);
         setOptions(allOptions);
      }, 0);
    } else {
      onComplete(); // Show results logic could be handled by parent or here
    }
  };

  if (!currentTerm) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center text-sm font-medium text-muted-foreground">
        <span>Question {currentIdx + 1} of {terms.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-border mb-8 text-center min-h-[200px] flex flex-col items-center justify-center">
        {currentTerm.imageUrl && (
          <div className="mb-4 w-full max-h-[140px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={currentTerm.imageUrl}
              alt={currentTerm.term}
              className="max-w-full max-h-[140px] object-contain"
            />
          </div>
        )}
        <h3 className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
          {currentTerm.definition}
        </h3>
        <p className="mt-4 text-sm text-muted-foreground italic bg-secondary/50 px-4 py-2 rounded-full">
          Select the correct term
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === currentTerm.id;
          const showCorrect = isAnswered && isCorrect;
          const showIncorrect = isAnswered && isSelected && !isCorrect;

          return (
            <motion.button
              key={option.id}
              whileHover={!isAnswered ? { scale: 1.02 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(option.id)}
              disabled={isAnswered}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all
                flex items-center justify-between group
                ${!isAnswered ? 'bg-white hover:border-primary/50 hover:shadow-md border-transparent' : ''}
                ${showCorrect ? 'bg-green-50 border-green-500 text-green-900' : ''}
                ${showIncorrect ? 'bg-red-50 border-red-500 text-red-900' : ''}
                ${isAnswered && !showCorrect && !showIncorrect ? 'bg-gray-50 border-transparent opacity-50' : ''}
              `}
            >
              <span className="font-semibold text-lg">{option.term}</span>
              
              {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
              {showIncorrect && <XCircle className="w-6 h-6 text-red-600" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-end"
          >
            <Button size="lg" onClick={handleNext} className="rounded-xl px-8 bg-primary hover:bg-primary/90">
              {currentIdx === terms.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
