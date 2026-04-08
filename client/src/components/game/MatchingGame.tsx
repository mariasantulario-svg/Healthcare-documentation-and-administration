import { useState, useEffect } from "react";
import { Term } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

interface MatchingGameProps {
  terms: Term[];
  onComplete: () => void;
}

export function MatchingGame({ terms, onComplete }: MatchingGameProps) {
  const [items, setItems] = useState<Array<{ id: string, content: string, type: 'term' | 'def', termId: number, status: 'default' | 'selected' | 'matched' | 'error' }>>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [gameTerms, setGameTerms] = useState<Term[]>([]);

  // Initialize game
  useEffect(() => {
    // Take max 6 terms for a game round to prevent clutter
    const currentTerms = terms.slice(0, 6);
    setGameTerms(currentTerms);
    
    const termCards = currentTerms.map(t => ({
      id: `t-${t.id}`,
      content: t.term,
      type: 'term' as const,
      termId: t.id,
      status: 'default' as const
    }));
    
    const defCards = currentTerms.map(t => ({
      id: `d-${t.id}`,
      content: t.definition,
      type: 'def' as const,
      termId: t.id,
      status: 'default' as const
    }));

    // Shuffle
    const allCards = [...termCards, ...defCards].sort(() => Math.random() - 0.5);
    setItems(allCards);
  }, [terms]);

  const handleCardClick = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || item.status === 'matched' || item.status === 'selected') return;

    // If we already have 2 selected (waiting for error animation to clear), ignore
    if (selectedIds.length >= 2) return;

    // Select the card
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'selected' } : i));
    const newSelected = [...selectedIds, id];
    setSelectedIds(newSelected);

    // Check for match if we have 2
    if (newSelected.length === 2) {
      const first = items.find(i => i.id === newSelected[0]);
      const second = items.find(i => i.id === newSelected[1]);

      if (first && second) {
        if (first.termId === second.termId) {
          // MATCH!
          setTimeout(() => {
            setItems(prev => prev.map(i => newSelected.includes(i.id) ? { ...i, status: 'matched' } : i));
            setSelectedIds([]);
            setMatchedCount(c => c + 1);
            
            if (matchedCount + 1 === gameTerms.length) {
              // Mark all terms in the round as correct
              gameTerms.forEach(t => updateStats(t.id, true));
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            }
          }, 500);
        } else {
          // ERROR!
          // Mark both terms as incorrect if they don't match
          updateStats(first.termId, false);
          updateStats(second.termId, false);
          setTimeout(() => {
            setItems(prev => prev.map(i => newSelected.includes(i.id) ? { ...i, status: 'error' } : i));
          }, 200);

          setTimeout(() => {
            setItems(prev => prev.map(i => newSelected.includes(i.id) ? { ...i, status: 'default' } : i));
            setSelectedIds([]);
          }, 1000);
        }
      }
    }
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

  if (matchedCount === terms.slice(0, 6).length && terms.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[500px]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-100 p-6 rounded-full mb-6"
        >
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-4">Round Complete!</h3>
        <p className="text-muted-foreground mb-8">You matched all the terms correctly.</p>
        <Button onClick={onComplete} size="lg" className="rounded-xl px-8">
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-5xl mx-auto">
      <AnimatePresence>
        {items.map((item) => {
          const term = gameTerms.find(t => t.id === item.termId);
          const showImage = item.type === 'term' && term?.imageUrl;
          return (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              backgroundColor: 
                item.status === 'selected' ? 'var(--selected-bg)' : 
                item.status === 'matched' ? 'var(--matched-bg)' : 
                item.status === 'error' ? 'var(--error-bg)' : 'white'
            }}
            whileHover={{ scale: item.status === 'default' ? 1.02 : 1 }}
            className={`
              relative p-6 rounded-2xl cursor-pointer border-2 transition-colors duration-200
              flex items-center justify-center text-center min-h-[140px] shadow-sm
              ${item.status === 'default' ? 'bg-white border-transparent hover:border-primary/20 hover:shadow-md' : ''}
              ${item.status === 'selected' ? 'bg-primary/10 border-primary text-primary' : ''}
              ${item.status === 'matched' ? 'bg-green-50 border-green-500 text-green-700 opacity-50' : ''}
              ${item.status === 'error' ? 'bg-red-50 border-red-500 text-red-700' : ''}
            `}
            onClick={() => handleCardClick(item.id)}
          >
            {showImage && (
              <div className="absolute top-2 left-2 w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white">
                <img src={term?.imageUrl ?? ''} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <span className={`text-sm sm:text-base font-medium ${showImage ? 'pl-12' : ''}`}>
              {item.content}
            </span>
            
            {item.status === 'matched' && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </motion.div>
            )}
            
            {item.status === 'error' && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <XCircle className="w-5 h-5 text-red-600" />
              </motion.div>
            )}
          </motion.div>
        );
        })}
      </AnimatePresence>
    </div>
  );
}
