# Personelim - Personel Takip Mobil Uygulaması

React Native ile geliştirilmiş modern bir personel takip sistemidir.

## 🚀 Teknolojiler

- **React Native** - Expo SDK ile
- **Firebase** - Authentication ve Database için
- **React Navigation** - Sayfa geçişleri için
- **React Hook Form** - Form yönetimi için
- **Zod** - Form doğrulama için
- **Zustand** - Global state yönetimi için
- **UI Kitten** - UI tasarım sistemi için
- **Expo Vector Icons** - İkonlar için

## 📱 Özellikler

- ✅ Kullanıcı kaydı ve girişi (Firebase Auth)
- ✅ Personel listesi görüntüleme
- ✅ Personel ekleme/düzenleme/silme
- ✅ Responsive tasarım
- ✅ Form validasyonu
- ✅ Global state yönetimi
- ✅ Modern UI/UX

## 🛠️ Kurulum

### Gereksinimler

- Node.js (16+)
- npm veya yarn
- Expo CLI
- iOS Simulator veya Android Emulator

### Adımlar

1. **Bağımlılıkları yükleyin:**

   ```bash
   npm install
   ```

2. **Firebase konfigürasyonunu ayarlayın:**

   - `src/services/firebase.js` dosyasındaki Firebase config bilgilerini kendi projenizinkilerle değiştirin

3. **Uygulamayı başlatın:**

   ```bash
   npm start
   ```

4. **Platform seçin:**
   - iOS: `i` tuşuna basın
   - Android: `a` tuşuna basın
   - Web: `w` tuşuna basın

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
├── screens/            # Uygulama ekranları
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js
│   └── LoadingScreen.js
├── navigation/         # Navigasyon konfigürasyonu
│   └── AppNavigator.js
├── store/              # Zustand store'ları
│   ├── authStore.js
│   └── personelStore.js
├── services/           # Firebase ve API servisleri
│   ├── firebase.js
│   └── auth.js
├── utils/              # Yardımcı fonksiyonlar
│   └── helpers.js
├── hooks/              # Custom hook'lar
│   └── index.js
└── types/              # TypeScript tip tanımları
    └── index.ts
```

## 🔧 Konfigürasyon

### Firebase Kurulumu

1. Firebase Console'da yeni proje oluşturun
2. Authentication'ı etkinleştirin (Email/Password)
3. Firestore Database oluşturun
4. Web app konfigürasyon bilgilerini alın
5. `src/services/firebase.js` dosyasını güncelleyin

### Expo Konfigürasyonu

Expo konfigürasyonu `app.json` dosyasında bulunur. Gerektiğinde güncelleyebilirsiniz.

## 📱 Kullanım

1. **Kayıt/Giriş:** Uygulamayı ilk açtığınızda kayıt olun veya giriş yapın
2. **Dashboard:** Ana ekranda personel istatistiklerini görün
3. **Personel Ekle:** "Yeni Personel Ekle" butonuna tıklayın
4. **Personel Listesi:** Mevcut personelleri görüntüleyin ve yönetin

## 🧪 Test

```bash
# Test komutları henüz yapılandırılmamış
npm test
```

## 📦 Build

### Development Build

```bash
expo build:android
expo build:ios
```

### Production Build

```bash
expo build:android --release-channel production
expo build:ios --release-channel production
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje bağlantısı: [GitHub Repository](https://github.com/yourusername/personelim-mobile)

## 🔮 Gelecek Özellikler

- [ ] Push notifications
- [ ] Ofline mode desteği
- [ ] Personel fotoğrafları
- [ ] QR kod ile personel kaydı
- [ ] Rapor ve analitik
- [ ] Dark mode
- [ ] Çoklu dil desteği
