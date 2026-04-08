import { useState, useRef, useEffect, useMemo } from "react";
import { Term } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface FillInBlanksProps {
  terms: Term[];
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
}

export function FillInBlanks({ terms, onNext, onPrev, currentIndex }: FillInBlanksProps) {
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [hintVisible, setHintVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const term = terms[currentIndex];
  
  // Replace the term in the context sentence with blanks
  const contextWithBlanks = useMemo(() => {
    if (!term.context) return "";
    
    // We need to handle cases where the term might have extra info in parentheses like "Emergency room (ER)"
    // The context might only have "emergency room"
    
    // 1. Get the core term (remove parentheses and trim)
    const coreTerm = term.term.replace(/\s*\(.*?\)\s*/g, '').trim();
    // 2. Get the part inside parentheses if it exists
    const match = term.term.match(/\((.*?)\)/);
    const altTerm = match ? match[1].trim() : null;
    
    // Create an array of potential terms to mask
    const searchTerms = [term.term, coreTerm];
    if (altTerm) searchTerms.push(altTerm);
    
    // Filter out duplicates and short strings to avoid masking random letters
    const uniqueSearchTerms = Array.from(new Set(searchTerms)).filter(t => t.length > 2);
    
    // Sort by length descending to match longest possible string first
    uniqueSearchTerms.sort((a, b) => b.length - a.length);
    
    let replaced = term.context;
    
    for (const s of uniqueSearchTerms) {
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, "gi");
      if (regex.test(replaced)) {
        replaced = replaced.replace(regex, "________");
        // Once we've masked the term, we can stop
        break;
      }
    }
    
    // Debug log to see what's happening
    console.log("Term:", term.term);
    console.log("Search Terms:", uniqueSearchTerms);
    console.log("Context:", term.context);
    console.log("Replaced:", replaced);
    
    return replaced;
  }, [term]);

  useEffect(() => {
    setUserInput("");
    setStatus("idle");
    setHintVisible(false);
    inputRef.current?.focus();
  }, [currentIndex]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status === 'correct') {
        onNext();
        return;
    }
    
    // Normalize input
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Extract valid variations for validation
    // 1. Full term
    const fullTerm = term.term.toLowerCase().trim();
    // 2. Core term (without parentheses)
    const coreTerm = term.term.replace(/\s*\(.*?\)\s*/g, '').toLowerCase().trim();
    // 3. Alternative term inside parentheses
    const match = term.term.match(/\((.*?)\)/);
    const altTerm = match ? match[1].toLowerCase().trim() : null;
    
    // 4. Handle slash-separated alternatives like "A&E / ER"
    const slashParts = term.term.split('/').map(p => p.toLowerCase().trim());
    
    const validAnswers = new Set([fullTerm, coreTerm, ...slashParts]);
    if (altTerm) validAnswers.add(altTerm);
    
    if (validAnswers.has(normalizedInput)) {
      setStatus('correct');
      updateStats(term.id, true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      setStatus('incorrect');
      updateStats(term.id, false);
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

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-full bg-white rounded-3xl p-8 border border-border shadow-md mb-8">
        <h3 className="text-center text-lg text-muted-foreground font-medium mb-2 uppercase tracking-wide text-xs">
          Complete the Sentence
        </h3>
        {term.imageUrl && (
          <div className="mb-4 w-full max-h-[120px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
            <img src={term.imageUrl} alt={term.term} className="max-w-full max-h-[120px] object-contain" />
          </div>
        )}
        <p className="text-2xl text-center text-foreground font-medium leading-relaxed">
          "{contextWithBlanks}"
        </p>
        {hintVisible && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="mt-6 text-center bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm"
           >
             <strong>Definition:</strong> {term.definition}
           </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={userInput}
            onChange={(e) => {
                setUserInput(e.target.value);
                if (status === 'incorrect') setStatus('idle');
            }}
            placeholder="Type the missing term..."
            className={`
              h-16 text-lg px-6 rounded-2xl border-2 shadow-sm
              ${status === 'correct' ? 'border-green-500 bg-green-50 text-green-900' : ''}
              ${status === 'incorrect' ? 'border-red-500 bg-red-50 text-red-900' : 'border-border bg-white'}
              focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors
            `}
            disabled={status === 'correct'}
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            {status === 'idle' && (
               <Button 
                 type="button"
                 variant="ghost" 
                 size="icon" 
                 className="text-muted-foreground hover:text-primary"
                 onClick={() => setHintVisible(!hintVisible)}
                 title="Show Hint"
               >
                 <HelpCircle className="w-5 h-5" />
               </Button>
            )}
            {status === 'correct' && <Check className="w-6 h-6 text-green-600" />}
            {status === 'incorrect' && <X className="w-6 h-6 text-red-600" />}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="rounded-xl"
          >
            Previous
          </Button>

          <Button 
            type="submit" 
            size="lg"
            className={`
              min-w-[140px] rounded-xl transition-all
              ${status === 'correct' ? 'bg-green-600 hover:bg-green-700' : ''}
            `}
          >
            {status === 'correct' ? (
                <>Next <ArrowRight className="ml-2 w-4 h-4"/></>
            ) : (
                "Check Answer"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
