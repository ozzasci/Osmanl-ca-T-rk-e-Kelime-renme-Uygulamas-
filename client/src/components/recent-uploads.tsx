import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, Search, Filter, Calendar, Download } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { Word } from "@shared/schema";

interface RecentUploadsProps {
  onBack: () => void;
}

export default function RecentUploads({ onBack }: RecentUploadsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: words } = useQuery<Word[]>({
    queryKey: ['/api/words'],
  });

  if (!words || words.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Son Yüklenen Kelimeler</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Henüz yüklenmiş kelime bulunmuyor.</p>
            <Button onClick={onBack} className="mt-4">
              Kelime Yükle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort words by ID (higher IDs are more recent)
  const sortedWords = [...words].sort((a, b) => b.id - a.id);

  // Get unique categories
  const categories = Array.from(new Set(words.map(w => w.category).filter(Boolean))) as string[];

  // Filter words based on search and category
  const filteredWords = sortedWords.filter(word => {
    const matchesSearch = !debouncedSearch || 
      word.ottoman.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      word.turkish.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      word.pronunciation?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      word.additionalMeanings?.some(meaning => 
        meaning.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

    const matchesCategory = !selectedCategory || word.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group words by upload batch (assuming words with consecutive IDs were uploaded together)
  const uploadBatches: { [key: string]: Word[] } = {};
  let currentBatch = 0;
  let lastId = 0;

  for (const word of sortedWords) {
    // If there's a gap of more than 50 in IDs, consider it a new batch
    if (lastId > 0 && lastId - word.id > 50) {
      currentBatch++;
    }
    
    const batchKey = `batch_${currentBatch}`;
    if (!uploadBatches[batchKey]) {
      uploadBatches[batchKey] = [];
    }
    uploadBatches[batchKey].push(word);
    lastId = word.id;
  }

  const exportToJson = () => {
    const dataStr = JSON.stringify(filteredWords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `son-yuklenen-kelimeler-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Son Yüklenen Kelimeler</h1>
          <p className="text-gray-600">En son yüklediğiniz {words.length} kelimeyi görüntüleyin ve yönetin</p>
        </div>
        <Button variant="outline" onClick={exportToJson} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          JSON İndir
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Kelime ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Tümü ({words.length})
              </Button>
              {categories.map(category => {
                const count = words.filter(w => w.category === category).length;
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Batches */}
      <div className="space-y-4">
        {Object.entries(uploadBatches).map(([batchKey, batchWords], batchIndex) => {
          const batchFilteredWords = batchWords.filter(word => filteredWords.includes(word));
          
          if (batchFilteredWords.length === 0) return null;

          const minId = Math.min(...batchWords.map(w => w.id));
          const maxId = Math.max(...batchWords.map(w => w.id));
          const uploadDate = new Date().toLocaleDateString('tr-TR'); // In real app, this would come from upload timestamp

          return (
            <Card key={batchKey}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span>Yükleme #{Object.keys(uploadBatches).length - batchIndex}</span>
                    <Badge variant="secondary">
                      {batchFilteredWords.length} kelime
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {uploadDate}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batchFilteredWords.slice(0, 12).map((word) => (
                    <div key={word.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-right flex-1" style={{ direction: 'rtl' }}>
                          <div className="font-medium text-lg">{word.ottoman}</div>
                          {word.pronunciation && (
                            <div className="text-xs text-gray-600">{word.pronunciation}</div>
                          )}
                        </div>
                        <div className="mx-2 text-gray-400">→</div>
                        <div className="flex-1">
                          <div className="font-medium">{word.turkish}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        {word.category && (
                          <Badge variant="outline" className="text-xs">
                            {word.category}
                          </Badge>
                        )}
                        <div className="text-xs text-gray-500">
                          ID: {word.id}
                        </div>
                      </div>
                      
                      {word.additionalMeanings && word.additionalMeanings.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          +{word.additionalMeanings.length} anlam
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {batchFilteredWords.length > 12 && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    +{batchFilteredWords.length - 12} kelime daha...
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredWords.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery || selectedCategory 
                ? "Arama kriterlerinize uygun kelime bulunamadı."
                : "Henüz yüklenmiş kelime bulunmuyor."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{words.length}</div>
              <div className="text-sm text-blue-700">Toplam Kelime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-blue-700">Kategori</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{Object.keys(uploadBatches).length}</div>
              <div className="text-sm text-blue-700">Yükleme Oturumu</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredWords.length}</div>
              <div className="text-sm text-blue-700">Görüntülenen</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}