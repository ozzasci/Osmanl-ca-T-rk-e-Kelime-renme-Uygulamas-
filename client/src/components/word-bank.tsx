import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Play } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { Word } from "@shared/schema";

interface WordBankProps {
  onBackToDashboard: () => void;
}

export default function WordBank({ onBackToDashboard }: WordBankProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: words, isLoading, error } = useQuery<Word[]>({
    queryKey: debouncedSearch 
      ? ['/api/words/search', { q: debouncedSearch }] 
      : ['/api/words'],
    enabled: true,
  });

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Yeni';
    }
  };

  const filteredWords = words?.filter(word => {
    if (selectedCategory !== "all" && word.category !== selectedCategory) {
      return false;
    }
    return true;
  }) || [];

  const categories = Array.from(new Set(words?.map(w => w.category).filter(Boolean))) || [];

  return (
    <section className="mb-8">
      <Card className="material-shadow">
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <Button variant="ghost" onClick={onBackToDashboard} className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Kelime Bankası
              </CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Kelime ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category || ''}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Kelimeler yüklenirken bir hata oluştu.</p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {searchQuery ? 'Arama kriterlerinize uygun kelime bulunamadı.' : 'Henüz kelime bulunmuyor.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredWords.map((word) => (
                <div key={word.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="text-lg font-medium text-gray-900">
                          {word.ottoman}
                        </div>
                        <div className="text-sm text-gray-600">
                          {word.pronunciation}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {word.turkish}
                        </div>
                      </div>
                      
                      {word.additionalMeanings && word.additionalMeanings.length > 0 && (
                        <div className="text-xs text-blue-600 mb-1">
                          <strong>Diğer Anlamlar:</strong> {word.additionalMeanings.join(', ')}
                        </div>
                      )}
                      
                      {word.example && (
                        <div className="text-xs text-gray-500 mb-1">
                          <strong>Örnek:</strong> {word.example}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {word.category && (
                          <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-2">
                            {word.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor()}>
                        {getDifficultyLabel()}
                      </Badge>
                      <Button size="sm" variant="ghost" className="p-2">
                        <Play className="w-4 h-4 text-blue-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && filteredWords.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Daha fazla göster
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
