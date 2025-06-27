import { Button } from "@/components/ui/button";
import { Home, BookOpen, Search, BarChart3, User } from "lucide-react";

interface BottomNavigationProps {
  activeSection: 'dashboard' | 'flashcards' | 'wordbank' | 'upload' | 'analytics' | 'profile' | 'quiz' | 'translator' | 'copyright' | 'recent';
  onSectionChange: (section: 'dashboard' | 'flashcards' | 'wordbank' | 'upload' | 'analytics' | 'profile' | 'quiz' | 'translator' | 'copyright' | 'recent') => void;
  onStartFlashcards: () => void;
}

export default function BottomNavigation({ 
  activeSection, 
  onSectionChange, 
  onStartFlashcards 
}: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 py-2">
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-1 h-auto ${
            activeSection === 'dashboard' ? 'text-blue-600' : 'text-gray-400'
          }`}
          onClick={() => onSectionChange('dashboard')}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Ana Sayfa</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-1 h-auto ${
            activeSection === 'flashcards' ? 'text-blue-600' : 'text-gray-400'
          }`}
          onClick={onStartFlashcards}
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-xs">Çalış</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-1 h-auto ${
            activeSection === 'wordbank' ? 'text-blue-600' : 'text-gray-400'
          }`}
          onClick={() => onSectionChange('wordbank')}
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-xs">Ara</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-1 h-auto ${
            activeSection === 'analytics' ? 'text-blue-600' : 'text-gray-400'
          }`}
          onClick={() => onSectionChange('analytics')}
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-xs">Analiz</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-1 h-auto ${
            activeSection === 'profile' ? 'text-blue-600' : 'text-gray-400'
          }`}
          onClick={() => onSectionChange('profile')}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Profil</span>
        </Button>
      </div>
    </nav>
  );
}
