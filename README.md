# StudyIQ - AI Destekli Not Organizasyon Uygulaması

Bu React Native uygulaması, notlarınızı AI ile organize etmenize yardımcı olur.

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Android için:
```bash
npm run android
```

3. iOS için:
```bash
npm run ios
```

## API Anahtarı Ayarlama

Uygulamanın çalışması için OpenAI API anahtarı gereklidir:

1. [OpenAI Platform](https://platform.openai.com/api-keys) adresine gidin
2. Yeni bir API anahtarı oluşturun
3. `src/services/openaiService.ts` dosyasını açın
4. `YOUR_OPENAI_API_KEY_HERE` yerine kendi API anahtarınızı yazın:

```typescript
const API_KEY = 'sk-proj-your-actual-api-key-here';
```

## Özellikler

- **Metin Girişi**: Notlarınızı yazarak veya yapıştırarak girebilirsiniz
- **AI Analizi**: GPT-4o-mini ile notlarınızı organize eder
- **Farklı Formatlar**: 
  - Özet
  - Detaylı Analiz
  - Madde İşaretleri
- **Türkçe Destek**: Tüm çıktılar Türkçe olarak verilir

## Sorun Giderme

### API Hatası Alıyorsanız:

1. **API anahtarı ayarlanmamış**: `src/services/openaiService.ts` dosyasında API anahtarınızı güncelleyin
2. **API anahtarı geçersiz**: OpenAI hesabınızdan yeni bir API anahtarı alın
3. **Kota aşıldı**: OpenAI hesabınızda yeterli kredi olduğundan emin olun
4. **İnternet bağlantısı**: İnternet bağlantınızı kontrol edin

### Uygulama Çalışmıyorsa:

1. Metro bundler'ı yeniden başlatın:
```bash
npm start
```

2. Cache'i temizleyin:
```bash
npx react-native start --reset-cache
```

3. Android için:
```bash
cd android && ./gradlew clean && cd .. && npm run android
```

## Teknik Detaylar

- **React Native**: 0.75.2
- **TypeScript**: 5.0.4
- **OpenAI API**: GPT-4o-mini modeli
- **Vector Icons**: Material Icons

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.


