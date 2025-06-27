import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, Shield, BookOpen, Users } from "lucide-react";

interface CopyrightProps {
  onBack: () => void;
}

export default function Copyright({ onBack }: CopyrightProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Telif Hakları ve Yasal Bilgiler</h1>
          <p className="text-gray-600">Uygulamanın kullanım koşulları ve yasal bilgileri</p>
        </div>
      </div>

      {/* Copyright Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Telif Hakları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Uygulama Hakları</h3>
            <p className="text-gray-700 leading-relaxed">
              Bu Osmanlıca-Türkçe öğrenme uygulaması özgün bir yazılım olarak geliştirilmiştir. 
              Uygulamanın kaynak kodu, tasarımı ve özgün içerikleri telif hakkı koruması altındadır.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Kelime Sözlüğü Hakları</h3>
            <p className="text-gray-700 leading-relaxed">
              Uygulamada kullanılan Osmanlıca kelime sözlüğü çeşitli açık kaynak ve kamu malı 
              kaynaklardan derlenmiştir. Kullanıcılar tarafından yüklenen kelime listeleri 
              ilgili kullanıcıların sorumluluğundadır.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Açık Kaynak Bileşenler</h3>
            <p className="text-gray-700 leading-relaxed">
              Bu uygulama açık kaynak kütüphaneler kullanmaktadır:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
              <li>React.js - MIT Lisansı</li>
              <li>TypeScript - Apache 2.0 Lisansı</li>
              <li>Tailwind CSS - MIT Lisansı</li>
              <li>Radix UI - MIT Lisansı</li>
              <li>Lucide Icons - ISC Lisansı</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Terms of Use */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Kullanım Koşulları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Kabul Edilen Kullanım</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Eğitim amaçlı kişisel kullanım</li>
              <li>Akademik araştırma ve çalışma</li>
              <li>Osmanlıca öğrenme ve öğretme faaliyetleri</li>
              <li>Kültürel koruma ve geliştirme çalışmaları</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Yasaklanan Kullanım</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Ticari amaçla yeniden satış</li>
              <li>Telif hakkı ihlali içeren içerik yükleme</li>
              <li>Sistem güvenliğini tehdit edici faaliyetler</li>
              <li>Yanıltıcı veya zararlı içerik paylaşımı</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Kullanıcı Sorumlulukları</h3>
            <p className="text-gray-700 leading-relaxed">
              Kullanıcılar yükledikleri içeriklerin yasal olmasından ve üçüncü şahısların 
              haklarını ihlal etmemesinden sorumludur. Kendi kelime listelerinizi yüklerken 
              telif hakları ve kaynak belirtme konularında dikkatli olunmalıdır.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gizlilik Politikası
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Veri Toplama</h3>
            <p className="text-gray-700 leading-relaxed">
              Uygulama yalnızca öğrenme ilerlemenizi takip etmek için gerekli verileri toplar:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
              <li>Öğrenme istatistikleri ve ilerleme verileri</li>
              <li>Çalışma oturumları ve performans metrikleri</li>
              <li>Kullanıcı tercihleri ve uygulama ayarları</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Veri Güvenliği</h3>
            <p className="text-gray-700 leading-relaxed">
              Tüm verileriniz güvenli şekilde saklanır ve üçüncü şahıslarla paylaşılmaz. 
              Kişisel bilgileriniz şifrelenerek korunur ve yalnızca uygulama işlevselliği 
              için kullanılır.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Veri Silme</h3>
            <p className="text-gray-700 leading-relaxed">
              Profil ayarlarından tüm verilerinizi silebilir veya hesabınızı kapatabilirsiniz. 
              Bu durumda tüm kişisel verileriniz kalıcı olarak silinecektir.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Educational Use */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Eğitim Amaçlı Kullanım
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Akademik Kullanım</h3>
            <p className="text-gray-700 leading-relaxed">
              Bu uygulama eğitim kurumları, araştırmacılar ve öğrenciler tarafından 
              Osmanlıca öğrenme ve araştırma amaçlı özgürce kullanılabilir.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Kaynak Gösterme</h3>
            <p className="text-gray-700 leading-relaxed">
              Akademik çalışmalarda bu uygulamayı referans olarak kullanırken 
              uygun atıf yapılması rica edilir:
            </p>
            <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-sm">
              "Osmanlıca-Türkçe Öğrenme Platformu. (2025). 
              İnteraktif Osmanlıca Kelime Öğrenme Uygulaması."
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Katkıda Bulunma</h3>
            <p className="text-gray-700 leading-relaxed">
              Osmanlıca dil öğrenimini desteklemek isteyen akademisyenler ve araştırmacılar 
              kelime sözlüğünün genişletilmesi için katkıda bulunabilirler.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-blue-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">İletişim</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            Telif hakları, kullanım koşulları veya gizlilik politikası hakkında 
            sorularınız varsa lütfen bizimle iletişime geçin. Osmanlıca dil öğrenimini 
            destekleme konusunda her türlü öneriye açığız.
          </p>
          <div className="mt-3 text-blue-700 text-sm">
            <p><strong>Son güncellenme:</strong> 26 Haziran 2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}