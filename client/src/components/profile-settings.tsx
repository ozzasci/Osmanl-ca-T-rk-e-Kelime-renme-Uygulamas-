import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Settings, Target, Bell, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DashboardStats } from "@shared/schema";

interface ProfileSettingsProps {
  onBack: () => void;
}

interface UserSettings {
  dailyGoal: number;
  sessionLength: number;
  difficulty: 'kolay' | 'orta' | 'zor';
  notifications: boolean;
  soundEffects: boolean;
  darkMode: boolean;
  language: 'tr' | 'en';
}

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  streak: number;
  totalWords: number;
  settings: UserSettings;
}

export default function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "Kullanıcı",
    email: "kullanici@example.com",
    joinDate: "2024-01-01",
    streak: 0,
    totalWords: 0,
    settings: {
      dailyGoal: 20,
      sessionLength: 20,
      difficulty: 'orta',
      notifications: true,
      soundEffects: true,
      darkMode: false,
      language: 'tr'
    }
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  // Update profile when stats are loaded
  useEffect(() => {
    if (stats) {
      setProfile(prev => ({
        ...prev,
        streak: stats.streak,
        totalWords: stats.learnedWords
      }));
    }
  }, [stats]);

  const saveProfileMutation = useMutation({
    mutationFn: async (updatedProfile: UserProfile) => {
      // In a real app, this would save to backend
      return Promise.resolve(updatedProfile);
    },
    onSuccess: (data) => {
      setProfile(data);
      setEditingProfile(false);
      toast({
        title: "Profil güncellendi",
        description: "Değişiklikleriniz başarıyla kaydedildi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const resetProgressMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would reset user progress
      return apiRequest("/api/progress/reset", "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "İlerleme sıfırlandı",
        description: "Tüm öğrenme verileriniz sıfırlandı.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İlerleme sıfırlanırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would export user data
      const data = {
        profile,
        stats,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `osmanli-turkce-verilerim-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Veriler indirildi",
        description: "Öğrenme verileriniz bilgisayarınıza indirildi.",
      });
    }
  });

  const handleSaveProfile = () => {
    saveProfileMutation.mutate(tempProfile);
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setTempProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const levelProgress = Math.min(100, (profile.totalWords / 100) * 100);
  const currentLevel = Math.floor(profile.totalWords / 100) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Ayarları</h1>
          <p className="text-gray-600">Hesabınızı ve öğrenme tercihlerinizi yönetin</p>
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profil Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 space-y-4">
              {editingProfile ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">İsim</Label>
                    <Input
                      id="name"
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={saveProfileMutation.isPending}>
                      {saveProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setEditingProfile(false);
                      setTempProfile(profile);
                    }}>
                      İptal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500">
                    Katılım tarihi: {new Date(profile.joinDate).toLocaleDateString('tr-TR')}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                    Düzenle
                  </Button>
                </div>
              )}
            </div>

            <div className="text-right space-y-3">
              <div>
                <div className="text-2xl font-bold text-blue-600">{profile.streak}</div>
                <div className="text-sm text-gray-600">gün streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{profile.totalWords}</div>
                <div className="text-sm text-gray-600">öğrenilen kelime</div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Level Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Seviye {currentLevel}</span>
              <Badge variant="secondary">
                {profile.totalWords % 100}/100
              </Badge>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              Bir sonraki seviyeye {100 - (profile.totalWords % 100)} kelime kaldı
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Öğrenme Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="dailyGoal">Günlük Hedef</Label>
              <Select 
                value={tempProfile.settings.dailyGoal.toString()} 
                onValueChange={(value) => handleSettingChange('dailyGoal', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 kelime</SelectItem>
                  <SelectItem value="20">20 kelime</SelectItem>
                  <SelectItem value="30">30 kelime</SelectItem>
                  <SelectItem value="50">50 kelime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sessionLength">Oturum Uzunluğu</Label>
              <Select 
                value={tempProfile.settings.sessionLength.toString()} 
                onValueChange={(value) => handleSettingChange('sessionLength', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 kelime</SelectItem>
                  <SelectItem value="15">15 kelime</SelectItem>
                  <SelectItem value="20">20 kelime</SelectItem>
                  <SelectItem value="25">25 kelime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Zorluk Seviyesi</Label>
              <Select 
                value={tempProfile.settings.difficulty} 
                onValueChange={(value: 'kolay' | 'orta' | 'zor') => handleSettingChange('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kolay">Kolay</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="zor">Zor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Arayüz Dili</Label>
              <Select 
                value={tempProfile.settings.language} 
                onValueChange={(value: 'tr' | 'en') => handleSettingChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Bildirimler</Label>
                <p className="text-sm text-gray-600">Günlük hatırlatıcılar ve başarım bildirimleri</p>
              </div>
              <Switch 
                id="notifications"
                checked={tempProfile.settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound">Ses Efektleri</Label>
                <p className="text-sm text-gray-600">Doğru/yanlış cevap sesleri</p>
              </div>
              <Switch 
                id="sound"
                checked={tempProfile.settings.soundEffects}
                onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="darkMode">Koyu Tema</Label>
                <p className="text-sm text-gray-600">Gece kullanımı için koyu renk teması</p>
              </div>
              <Switch 
                id="darkMode"
                checked={tempProfile.settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveProfile} disabled={saveProfileMutation.isPending}>
              {saveProfileMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Veri Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => exportDataMutation.mutate()}
              disabled={exportDataMutation.isPending}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exportDataMutation.isPending ? "İndiriliyor..." : "Verilerimi İndir"}
            </Button>

            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm("Tüm ilerlemenizi sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
                  resetProgressMutation.mutate();
                }
              }}
              disabled={resetProgressMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {resetProgressMutation.isPending ? "Sıfırlanıyor..." : "İlerlemeyi Sıfırla"}
            </Button>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>Verilerimi İndir:</strong> Tüm öğrenme verilerinizi JSON formatında indirin</p>
            <p>• <strong>İlerlemeyi Sıfırla:</strong> Tüm öğrenme ilerlemesini ve istatistikleri sıfırlar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}