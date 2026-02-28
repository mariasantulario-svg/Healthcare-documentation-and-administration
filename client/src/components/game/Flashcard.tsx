import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Term } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCw, Volume2 } from "lucide-react";

interface FlashcardProps {
  term: Term;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function Flashcard({ term, onNext, onPrev, isFirst, isLast }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when term changes
  // We use a key on the component in the parent to force remount, 
  // or use this effect pattern if component stays mounted
  // useEffect(() => setIsFlipped(false), [term]); 

  const handleFlip = () => {
    if (!isFlipped) {
      updateStats(term.id, true);
    }
    setIsFlipped(!isFlipped);
  };

  const updateStats = (termId: number, isCorrect: boolean) => {
    try {
      const saved = localStorage.getItem("vocab-stats");
      const stats = saved ? JSON.parse(saved) : {};
      if (!stats[termId]) stats[termId] = { correct: 0, attempts: 0 };
      stats[termId].attempts += 1;
      if (isCorrect) stats[termId].correct += 1;
      localStorage.setItem("vocab-stats", JSON.stringify(stats));
      window.dispatchEvent(new Event("vocab-stats-updated"));
    } catch (e) {
      console.error("Failed to save stats", e);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div 
        className="relative h-[400px] w-full perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <motion.div 
          className="w-full h-full relative transform-style-3d transition-all duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white !bg-opacity-100 rounded-3xl shadow-xl border border-gray-200 flex flex-col items-center justify-center p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="absolute top-6 left-6 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {term.category}
            </div>
            
            {term.imageUrl && (
              <div className="mb-6 w-full max-h-[180px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                <img 
                  src={term.imageUrl} 
                  alt={term.term}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            
            <h3 className={`${term.imageUrl ? 'text-3xl' : 'text-4xl'} font-bold text-slate-900 font-display mb-6`}>
              {term.term}
            </h3>
            
            <p className="text-slate-400 text-sm font-medium animate-pulse">
              Click to flip
            </p>

            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-6 right-6 text-slate-400 hover:text-primary hover:bg-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                speak(term.term);
              }}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white !bg-opacity-100 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center justify-center p-8 text-center rotate-y-180 overflow-y-auto">
            <div className="w-full max-w-md space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold text-primary mb-2 tracking-wider">Definition</h4>
                <p className="text-lg text-slate-900 font-bold leading-relaxed">
                  {term.definition}
                </p>
              </div>
              
              <div className="w-full h-px bg-slate-200" />
              
              <div>
                <h4 className="text-xs uppercase font-bold text-primary mb-2 tracking-wider">Context</h4>
                <p className="text-base text-slate-600 font-medium italic">
                  "{term.context}"
                </p>
              </div>
              
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-sm font-bold text-primary mr-2">ESPAÑOL: </span>
                <span className="text-sm text-slate-900 font-bold">{term.spanish}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between mt-8 px-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onPrev} 
          disabled={isFirst}
          className="w-32 rounded-xl shadow-sm bg-white border-slate-200 hover:border-primary/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Prev
        </Button>
        
        <div className="text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
           Flip Card
        </div>

        <Button 
          variant="default" 
          size="lg" 
          onClick={onNext} 
          disabled={isLast}
          className="w-32 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
        >
          {isLast ? "Finish" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
