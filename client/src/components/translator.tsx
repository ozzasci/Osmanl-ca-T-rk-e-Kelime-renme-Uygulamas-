import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRightLeft, Search, BookOpen, Volume2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { Word } from "@shared/schema";

interface TranslatorProps {
  onBack: () => void;
}

export default function Translator({ onBack }: TranslatorProps) {
  const [inputText, setInputText] = useState("");
  const [translationDirection, setTranslationDirection] = useState<'ottoman-to-turkish' | 'turkish-to-ottoman'>('ottoman-to-turkish');
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  
  const debouncedInput = useDebounce(inputText, 300);

  const { data: words } = useQuery<Word[]>({
    queryKey: ['/api/words'],
  });

  // Search for matching words
  const searchWords = (query: string) => {
    if (!words || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const results = words.filter(word => {
      if (translationDirection === 'ottoman-to-turkish') {
        return word.ottoman.toLowerCase().includes(searchTerm) ||
               word.pronunciation?.toLowerCase().includes(searchTerm);
      } else {
        return word.turkish.toLowerCase().includes(searchTerm) ||
               word.additionalMeanings?.some(meaning => meaning.toLowerCase().includes(searchTerm));
      }
    }).slice(0, 10); // Limit to 10 results

    setSearchResults(results);
  };

  // Trigger search when debounced input changes
  useEffect(() => {
    searchWords(debouncedInput);
  }, [debouncedInput]);

  const switchDirection = () => {
    setTranslationDirection(prev => 
      prev === 'ottoman-to-turkish' ? 'turkish-to-ottoman' : 'ottoman-to-turkish'
    );
    setInputText("");
    setSearchResults([]);
  };

  const translateText = (text: string) => {
    if (!words || !text.trim()) return "";

    const words_list = text.toLowerCase().split(/\s+/);
    const translations: string[] = [];

    for (const word_part of words_list) {
      const match = words.find(word => {
        if (translationDirection === 'ottoman-to-turkish') {
          return word.ottoman.toLowerCase() === word_part ||
                 word.pronunciation?.toLowerCase() === word_part;
        } else {
          return word.turkish.toLowerCase() === word_part;
        }
      });

      if (match) {
        if (translationDirection === 'ottoman-to-turkish') {
          translations.push(match.turkish);
        } else {
          translations.push(match.ottoman);
        }
      } else {
        translations.push(`[${word_part}]`); // Untranslated words in brackets
      }
    }

    return translations.join(' ');
  };

  const translatedText = translateText(inputText);

  if (!words || words.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Osmanlıca Çeviri</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Çeviri fonksiyonu için önce kelime yüklemeniz gerekiyor.</p>
            <Button onClick={onBack} className="mt-4">
              Kelime Yükle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Osmanlıca Çeviri</h1>
          <p className="text-gray-600">Osmanlıca ve Türkçe arasında basit çeviri yapın</p>
        </div>
      </div>

      {/* Translation Direction Control */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Badge variant={translationDirection === 'ottoman-to-turkish' ? "default" : "secondary"}>
              {translationDirection === 'ottoman-to-turkish' ? 'Osmanlıca' : 'Türkçe'}
            </Badge>
            <Button variant="outline" size="sm" onClick={switchDirection}>
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Badge variant={translationDirection === 'turkish-to-ottoman' ? "default" : "secondary"}>
              {translationDirection === 'turkish-to-ottoman' ? 'Osmanlıca' : 'Türkçe'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Side */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {translationDirection === 'ottoman-to-turkish' ? 'Osmanlıca Metin' : 'Türkçe Metin'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={translationDirection === 'ottoman-to-turkish' 
                ? 'Osmanlıca kelime veya cümle yazın...' 
                : 'Türkçe kelime veya cümle yazın...'}
              className="min-h-[120px] text-lg"
              style={translationDirection === 'ottoman-to-turkish' ? { direction: 'rtl' } : {}}
            />
            
            {inputText && (
              <div className="text-sm text-gray-600">
                <Search className="w-4 h-4 inline mr-1" />
                {searchResults.length} sonuç bulundu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Side */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {translationDirection === 'turkish-to-ottoman' ? 'Osmanlıca Çeviri' : 'Türkçe Çeviri'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="min-h-[120px] p-3 border border-gray-200 rounded-md bg-gray-50 text-lg"
              style={translationDirection === 'turkish-to-ottoman' ? { direction: 'rtl' } : {}}
            >
              {translatedText || (
                <span className="text-gray-400">
                  Çeviri burada görünecek...
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulunan Kelimeler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((word) => (
                <div 
                  key={word.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => setInputText(translationDirection === 'ottoman-to-turkish' ? word.ottoman : word.turkish)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="text-right" style={{ direction: 'rtl' }}>
                        <div className="font-medium text-lg">{word.ottoman}</div>
                        {word.pronunciation && (
                          <div className="text-sm text-gray-600">{word.pronunciation}</div>
                        )}
                      </div>
                      <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{word.turkish}</div>
                      </div>
                    </div>
                    
                    {word.additionalMeanings && word.additionalMeanings.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {word.additionalMeanings.slice(0, 3).map((meaning, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {meaning}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {word.category && (
                    <Badge variant="secondary" className="ml-4">
                      {word.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Nasıl Kullanılır?</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Çeviri yönünü değiştirmek için ortadaki butona tıklayın</li>
            <li>• Kelime veya cümle yazın, otomatik olarak çevrilecektir</li>
            <li>• Bulunan kelimelerden birine tıklayarak seçebilirsiniz</li>
            <li>• Köşeli parantez içindeki kelimeler sözlükte bulunamadı</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}