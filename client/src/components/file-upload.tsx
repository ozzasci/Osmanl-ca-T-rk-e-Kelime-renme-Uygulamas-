import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface FileUploadProps {
  onClose: () => void;
}

export default function FileUpload({ onClose }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    imported?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Hata",
        description: "Lütfen bir JSON dosyası seçin.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      setUploadProgress(30);

      // Parse JSON
      const jsonData = JSON.parse(fileContent);
      if (!Array.isArray(jsonData)) {
        throw new Error("JSON dosyası bir dizi içermelidir");
      }

      setUploadProgress(50);

      // Send to server
      const response = await fetch('/api/words/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words: jsonData }),
        credentials: 'include',
      });

      setUploadProgress(80);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Yükleme başarısız');
      }

      setUploadProgress(100);
      setUploadResult(result);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/words'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });

      toast({
        title: "Başarılı!",
        description: result.message,
      });

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu';
      setUploadResult({
        success: false,
        error: errorMessage,
      });
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Kelime Dosyası Yükle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Osmanlıca kelimelerinizi JSON formatında yükleyebilirsiniz. Dosya şu formatta olmalıdır:
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono">
          {`[
  {
    "word": "اقلام",
    "transliteration": "Aklâm", 
    "meaning": "Kalemler",
    "additional_meanings": []
  }
]`}
        </div>

        {!isUploading && !uploadResult && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              onClick={triggerFileSelect}
              className="w-full"
              size="lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              JSON Dosyası Seç
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Dosya yükleniyor...</div>
            <Progress value={uploadProgress} className="w-full" />
            <div className="text-xs text-gray-500">
              {uploadProgress < 30 && "Dosya okunuyor..."}
              {uploadProgress >= 30 && uploadProgress < 50 && "İçerik kontrol ediliyor..."}
              {uploadProgress >= 50 && uploadProgress < 80 && "Kelimeler kaydediliyor..."}
              {uploadProgress >= 80 && "Tamamlanıyor..."}
            </div>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              uploadResult.success 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <div className="flex-1">
                {uploadResult.success ? (
                  <div>
                    <div className="font-medium">Başarılı!</div>
                    <div className="text-sm">
                      {uploadResult.imported} kelime yüklendi
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">Hata</div>
                    <div className="text-sm">{uploadResult.error}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {uploadResult.success && (
                <Button 
                  onClick={triggerFileSelect}
                  variant="outline"
                  className="flex-1"
                >
                  Başka Dosya Yükle
                </Button>
              )}
              <Button 
                onClick={onClose}
                className="flex-1"
              >
                {uploadResult.success ? 'Kapat' : 'Tekrar Dene'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}