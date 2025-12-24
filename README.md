# 💌 Doğum Günü Mektubu

Sevdiğiniz kişinin doğum gününü kutlamak için özel olarak tasarlanmış romantik bir zarf-mektup uygulaması.

## ✨ Özellikler

- 📮 Gerçekçi zarf tasarımı ve açılma animasyonu
- ✉️ Zarfa tıklayınca açılan mektup
- ⌨️ Daktilo efektiyle yazılan metin
- 🎵 Arka plan müziği (açılış/kapatma butonu ile)
- 🎊 Konfeti efekti (mektup okunduktan sonra)
- 🎨 Zarif ve romantik tasarım
- 📱 Responsive tasarım (mobil uyumlu)

## 🚀 Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda `http://localhost:5173` adresini açın

## 📦 Build

Production build için:
```bash
npm run build
```

## 🎨 Mesajınızı Özelleştirme

Mektuptaki mesajı değiştirmek için `src/App.jsx` dosyasını açın ve `letterContent` değişkenindeki metni düzenleyin:

```javascript
const letterContent = `Sevgili Petek Hanım,

Buraya kendi mesajınızı yazabilirsiniz.
Satır sonları için \n kullanabilirsiniz.

Sevgiyle...`
```

## 🎵 Müzik Değiştirme

Müzik dosyasını değiştirmek için `src/App.jsx` dosyasındaki `audio` etiketindeki `src` özelliğini güncelleyin.

## 💡 İpuçları

- Mesajı kişiselleştirmek için `src/App.jsx` dosyasındaki `letterContent` değişkenini düzenleyin
- Daktilo hızını ayarlamak için `useEffect` içindeki `setTimeout` süresini değiştirebilirsiniz (şu anda 50ms)
- Renkleri değiştirmek için Tailwind CSS sınıflarını düzenleyin
