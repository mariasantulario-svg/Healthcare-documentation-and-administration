import { BookOpen, GraduationCap, HeartPulse, Instagram, Library } from "lucide-react";
import { useTerms } from "@/hooks/use-terms";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profileImage from "@assets/IMG_6270_1770640458583.jpeg";

export function Header() {
  const { data: terms } = useTerms();
  
  return (
    <header className="relative overflow-hidden bg-white border-b border-slate-200">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" className="text-primary" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/20"
            >
              <HeartPulse className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 flex items-center gap-2">
                HEALTHCARE <span className="text-primary">VOCABULARY</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <GraduationCap className="h-4 w-4 text-primary/60" />
                <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">
                  Documentation & Administration Master
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Database</span>
                <span className="text-slate-900 font-bold text-sm leading-tight">{terms?.length || 0} Terms</span>
              </div>
            </div>

            <a 
              href="https://climbing-newsstand-56f.notion.site/FP-Teaching-Lab-30094019816981fbbeccc493046f95d0?pvs=149" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-95"
            >
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                <Library className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
              </div>
              <div className="flex flex-col pr-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Resource</span>
                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">Notion Lab</span>
              </div>
            </a>

            <a 
              href="https://www.instagram.com/espteachingmar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-sm hover:border-pink-200 hover:shadow-md transition-all active:scale-95"
            >
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-pink-50 group-hover:ring-pink-100 transition-all shadow-sm">
                  <AvatarImage src={profileImage} alt="@espteachingmar" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-xs font-bold">Mar</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1 rounded-full border-2 border-white">
                  <Instagram className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-xs font-black text-slate-900 leading-none">Mar</span>
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-pink-600 transition-colors">@espteachingmar</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
