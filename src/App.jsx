import { useState, useEffect, useRef } from 'react'
import { Heart, Stars, Volume2, VolumeX, X } from 'lucide-react'

export default function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [isReadMode, setIsReadMode] = useState(false)
  const [textIndex, setTextIndex] = useState(0)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showPhoto, setShowPhoto] = useState(false)

  const scrollRef = useRef(null)
  const audioRef = useRef(null)
  const youtubePlayerRef = useRef(null)

  // *** MEKTUP METNİNİ BURADAN DEĞİŞTİREBİLİRSİN ***
  const letterContent = `Sevgili Petek Hanım,

Hislerimi dışa vurmakta pek iyi olmasam da denemek istedim.

Seni tanıdığım günden beri hayatımın renkleri değişti. Gülüşün ve varlığın, benim için hayatın en güzel detayı haline geldi.

Yüzüne ufak da olsa bir tebessüm eklemek, seni mutlu etmek için bir şeyler yapmak istedim. Umarım başarabilmişimdir.

Hayatımdaki en zarif tesadüfsün.

Doğum Günün Kutlu Olsun!

Emin`

  // Tarayıcı tespiti (Chrome'da otomatik çalmayı kapat)
  const isChrome =
    typeof navigator !== 'undefined' &&
    /Chrome/.test(navigator.userAgent) &&
    !/Edg|OPR/.test(navigator.userAgent) &&
    !(navigator.brave)

  const [userInteracted, setUserInteracted] = useState(!isChrome)

  // YouTube video ID'sini linkten çıkar
  const youtubeVideoId = 'jpKaptxKfnI'

  // Müzik başlatıcı: önce mute, sonra oynat, sonra sesi açmayı dener
  const startMusicMutedThenUnmute = (player) => {
    if (!player) return
    try {
      player.mute()
      player.playVideo()
      setMusicPlaying(true)
      // Biraz gecikmeyle sesi açmayı dene
      setTimeout(() => {
        try {
          player.unMute()
          player.setVolume(40)
        } catch (e) {
          // Engellenirse sessizde devam etsin
        }
      }, 600)
    } catch (e) {
      console.log('Müzik başlatılamadı:', e)
    }
  }

  // YouTube IFrame API yükleme ve otomatik çalma
  useEffect(() => {
    let playerInitialized = false

    const initPlayer = () => {
      if (playerInitialized || youtubePlayerRef.current) return
      
      playerInitialized = true
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: youtubeVideoId,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          mute: 1,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            console.log('YouTube player hazır, otomatik başlatılıyor...')
            // Chrome'da etkileşim bekle
            if (isChrome && !userInteracted) {
              console.log('Chrome tespit edildi, otomatik çalma kapalı; etkileşim bekleniyor')
              return
            }
            try {
              // Önce sessiz başlat, sonra açmayı dene
              startMusicMutedThenUnmute(event.target)
              console.log('Müzik otomatik (mute) başlatıldı')

              // Player durursa otomatik tekrar başlat
              const checkPlaying = setInterval(() => {
                if (youtubePlayerRef.current) {
                  try {
                    const state = youtubePlayerRef.current.getPlayerState()
                    // Eğer paused, ended veya cued durumundaysa tekrar başlat
                    if (state === window.YT.PlayerState.PAUSED || 
                        state === window.YT.PlayerState.ENDED ||
                        state === window.YT.PlayerState.CUED) {
                      console.log('Müzik durdu, tekrar başlatılıyor... State:', state)
                      youtubePlayerRef.current.playVideo()
                      setMusicPlaying(true)
                    }
                  } catch (e) {
                    console.log('State kontrolü hatası:', e)
                  }
                }
              }, 2000) // Her 2 saniyede bir kontrol et
              // Cleanup için ref'e kaydet
              if (youtubePlayerRef.current) {
                youtubePlayerRef.current._checkInterval = checkPlaying
              }
            } catch (e) {
              console.log('Otomatik çalma hatası:', e)
              // Hata olursa kısa bir gecikme ile tekrar dene
              setTimeout(() => {
                try {
                  event.target.mute()
                  event.target.playVideo()
                  setMusicPlaying(true)
                } catch (e2) {
                  console.log('İkinci deneme de başarısız:', e2)
                }
              }, 1000)
            }
          },
          onStateChange: (event) => {
            console.log('Player state değişti:', event.data)
            if (event.data === window.YT.PlayerState.PLAYING) {
              setMusicPlaying(true)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              // Kullanıcı durdurmadıysa tekrar başlat
              setTimeout(() => {
                if (youtubePlayerRef.current && musicPlaying) {
                  console.log('Müzik durdu, tekrar başlatılıyor...')
                  youtubePlayerRef.current.playVideo()
                }
              }, 1000)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              // Video bittiğinde tekrar başlat
              if (youtubePlayerRef.current && youtubePlayerRef.current.playVideo) {
                youtubePlayerRef.current.playVideo()
              }
            } else if (event.data === window.YT.PlayerState.BUFFERING) {
              // Buffer'lama sırasında çalmaya devam et
              setMusicPlaying(true)
            }
          },
          onError: (event) => {
            console.error('YouTube player hatası:', event.data)
          }
        }
      })
    }

    // YouTube IFrame API script'ini yükle
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      // API hazır olduğunda callback
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API hazır')
        initPlayer()
      }
    } else if (window.YT && window.YT.Player) {
      // API zaten yüklüyse direkt oluştur
      console.log('YouTube API zaten yüklü')
      initPlayer()
    }

    // Kullanıcı etkileşimi için listener ekle (sadece yedek olarak)
    const handleUserInteraction = () => {
      if (!userInteracted && youtubePlayerRef.current) {
        setUserInteracted(true)
        // Chrome dahil: önce sessiz başlat, sonra açmayı dene
        startMusicMutedThenUnmute(youtubePlayerRef.current)
      }
    }

    // Sayfa tıklamasında müziği başlat (Chrome dahil)
    document.addEventListener('click', handleUserInteraction, { once: true })
    document.addEventListener('touchstart', handleUserInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [youtubeVideoId, userInteracted])

  useEffect(() => {
    if (isReadMode && textIndex < letterContent.length) {
      const timer = setTimeout(() => {
        setTextIndex((prev) => prev + 1)
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 50)

      return () => clearTimeout(timer)
    } else if (isReadMode && textIndex >= letterContent.length) {
      // Konfetiyi başlat
      setTimeout(() => setShowConfetti(true), 500)
      // Fotoğrafı göster (konfetiden 2.5 saniye sonra)
      setTimeout(() => setShowPhoto(true), 3000)
    }
  }, [isReadMode, textIndex, letterContent.length])

  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true)
      // Müziği başlat (zarfa tıklayınca)
      if (!userInteracted) {
        setUserInteracted(true)
      }
      if (youtubePlayerRef.current) {
        startMusicMutedThenUnmute(youtubePlayerRef.current)
        console.log('Müzik zarfa tıklayınca başlatıldı!')
      }
      setTimeout(() => {
        setIsReadMode(true)
      }, 800)
    }
  }

  const handleCloseReadMode = (e) => {
    e.stopPropagation()
    setIsReadMode(false)
    setIsOpen(false)
    setTextIndex(0)
    setShowConfetti(false)
    setShowPhoto(false)
    if (youtubePlayerRef.current && youtubePlayerRef.current.pauseVideo) {
      youtubePlayerRef.current.pauseVideo()
      setMusicPlaying(false)
    }
  }

  const toggleMusic = (e) => {
    e.stopPropagation()
    if (youtubePlayerRef.current) {
      if (musicPlaying) {
        youtubePlayerRef.current.pauseVideo()
        setMusicPlaying(false)
        // Check interval'ı temizle
        if (youtubePlayerRef.current._checkInterval) {
          clearInterval(youtubePlayerRef.current._checkInterval)
          youtubePlayerRef.current._checkInterval = null
        }
      } else {
        youtubePlayerRef.current.playVideo()
        setMusicPlaying(true)
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative font-sans text-slate-800 bg-[#f8f5f0]">
      {/* Ana Arkaplan Deseni (Damask) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-damask-pattern z-0 mix-blend-multiply"></div>

      {/* İnce Kağıt Dokusu Katmanı */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-paper-texture z-0 mix-blend-multiply"></div>

      {/* Soft Floral Katman */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-floral-soft z-0 mix-blend-multiply"></div>

      {/* Vinyet */}
      <div className="vignette-overlay"></div>

      {/* Işık halesi */}
      <div className="absolute inset-0 pointer-events-none z-[52]">
        <div
          className="absolute left-1/2 top-10 -translate-x-1/2 w-[60vw] h-[50vh] rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 240, 245, 0.8) 0%, rgba(255, 200, 220, 0) 70%)'
          }}
        ></div>
      </div>

      {/* Konfeti Efekti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-[60]">
          {[...Array(50)].map((_, i) => (
            <div
              key={`c-${i}`}
              className="absolute w-2 h-2 rounded animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                backgroundColor: ['#FFD700', '#FF69B4', '#FF4500', '#00CED1'][Math.floor(Math.random() * 4)],
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Minimal Çiçek Süsleri */}
      <div className="absolute inset-0 pointer-events-none z-[55]">
        <span className="absolute text-4xl opacity-60 animate-slowFloat" style={{ top: '8%', left: '6%', animationDelay: '0s' }}>🌸</span>
        <span className="absolute text-3xl opacity-55 animate-slowFloat" style={{ top: '18%', right: '10%', animationDelay: '2s' }}>🌺</span>
        <span className="absolute text-4xl opacity-50 animate-slowFloat" style={{ bottom: '14%', left: '12%', animationDelay: '4s' }}>🌷</span>
        <span className="absolute text-3xl opacity-60 animate-slowFloat" style={{ bottom: '10%', right: '8%', animationDelay: '6s' }}>💮</span>
      </div>

      {/* Çerçeve ve kenar süsleri */}
      <div className="absolute inset-0 pointer-events-none z-[54]">
        <div className="absolute inset-6 rounded-3xl border border-white/25 shadow-[0_0_40px_rgba(255,182,193,0.28)]"></div>
        <div className="absolute inset-4 rounded-[28px] border border-rose-200/30"></div>
      </div>

      {/* Petal izleri (yan kenarlar) */}
      <div className="absolute inset-0 pointer-events-none z-[56]">
        {[...Array(10)].map((_, i) => (
          <span
            key={`petal-left-${i}`}
            className="absolute text-2xl opacity-55 animate-slowFloat"
            style={{
              top: `${8 + i * 8}%`,
              left: '3%',
              animationDelay: `${i * 0.6}s`
            }}
          >
            🌸
          </span>
        ))}
        {[...Array(10)].map((_, i) => (
          <span
            key={`petal-right-${i}`}
            className="absolute text-2xl opacity-55 animate-slowFloat"
            style={{
              top: `${5 + i * 9}%`,
              right: '3%',
              animationDelay: `${i * 0.5}s`
            }}
          >
            🌺
          </span>
        ))}
      </div>

      {/* Parıltı Tanecikleri */}
      <div className="absolute inset-0 pointer-events-none z-[56]">
        {[...Array(12)].map((_, i) => (
          <span
            key={`spark-${i}`}
            className="absolute text-lg text-rose-200 glow-pulse"
            style={{
              top: `${10 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Cam efekti kart */}
      <div className="relative z-40 w-full max-w-4xl mx-auto px-4 md:px-8">
        <div className="relative bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl px-4 md:px-8 py-6 md:py-10">
          {/* Müzik Butonu (kart köşesi) */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[70]">
            <button
              onClick={toggleMusic}
              className="bg-white/85 backdrop-blur p-3 rounded-full hover:bg-white transition shadow-md text-rose-400 border border-white/50"
            >
              {musicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </button>
          </div>

          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-white/5 to-rose-100/20 pointer-events-none"></div>
          <div className="absolute -inset-px rounded-3xl border border-white/50 mix-blend-screen pointer-events-none"></div>
          <div className="relative">
            {/* Gizli YouTube Player */}
            <div
              id="youtube-player"
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none',
                top: '-9999px'
              }}
            ></div>

            {/* Zarf ve içerik */}
            <div className={`relative transition-all duration-1000 ${isReadMode ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} z-10`}>
              <div
                className="relative w-[300px] h-[200px] md:w-[400px] md:h-[260px] cursor-pointer group mx-auto"
                onClick={handleOpen}
              >
                <div className="absolute inset-0 bg-[#e6d0b3] rounded-md shadow-2xl"></div>
                <div
                  className={`absolute left-2 right-2 top-2 h-[90%] bg-white rounded-sm shadow transition-all duration-1000 ${
                    isOpen ? '-translate-y-24' : 'translate-y-0'
                  }`}
                ></div>
                <div
                  className={`absolute top-0 left-0 w-full h-1/2 bg-[#f0e1cf] origin-top transition-all duration-700 z-20 rounded-t-md border-b border-white/20 ${
                    isOpen ? 'z-0 brightness-90' : 'z-30 shadow-sm'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)'
                  }}
                ></div>
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[150px] md:border-l-[200px] border-b-[100px] md:border-b-[130px] border-l-transparent border-b-[#dcbfa3] rounded-bl-md"></div>
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-r-[150px] md:border-r-[200px] border-b-[100px] md:border-b-[130px] border-r-transparent border-b-[#dcbfa3] rounded-br-md"></div>
                </div>
                <div
                  className={`absolute top-[40%] left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${
                    isOpen ? 'opacity-0 scale-150' : 'opacity-100'
                  }`}
                >
                  <div className="w-12 h-12 bg-rose-600 rounded-full border-2 border-rose-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Heart className="text-rose-100 w-6 h-6" fill="currentColor" />
                  </div>
                  <p className="text-center mt-8 text-rose-800/60 text-sm font-serif tracking-widest animate-pulse">
                    AÇ
                  </p>
                </div>
              </div>
            </div>

            {/* Mektup Okuma Ekranı */}
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm transition-all duration-1000 ease-in-out ${
                isReadMode && !showPhoto ? 'opacity-100 visible' : isReadMode && showPhoto ? 'opacity-0 invisible' : 'opacity-0 invisible pointer-events-none'
              }`}
            >
              <div
                className={`bg-[#fffdfa] w-full max-w-lg md:max-w-2xl min-h-[60vh] max-h-[85vh] shadow-2xl rounded-sm p-8 md:p-16 relative flex flex-col transform transition-all duration-1000 ${
                  isReadMode && !showPhoto ? 'translate-y-0 scale-100 rotate-0' : 'translate-y-40 scale-90 rotate-2'
                }`}
              >
                <div className="absolute inset-0 opacity-60 bg-paper-texture pointer-events-none rounded-sm"></div>

                {/* Köşe Süsleri */}
                <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-rose-200 opacity-60"></div>
                <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-rose-200 opacity-60"></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-rose-200 opacity-60"></div>
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-rose-200 opacity-60"></div>

                <button
                  onClick={handleCloseReadMode}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition z-50"
                >
                  <X size={24} />
                </button>

                <div className="text-center mb-10 relative z-10">
                  <div className="inline-flex items-center justify-center gap-3 border-b border-rose-100 pb-3 px-10">
                    <Stars className="text-yellow-600 w-4 h-4 opacity-70" />
                    <span
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      className="text-rose-900 tracking-[0.2em] text-lg font-semibold uppercase"
                    >
                      Petek Hanım
                    </span>
                    <Stars className="text-yellow-600 w-4 h-4 opacity-70" />
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth relative z-10 text-center px-4"
                >
                  <p
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    className="text-lg md:text-xl leading-8 text-slate-800 font-medium tracking-normal whitespace-pre-wrap"
                  >
                    {letterContent.slice(0, textIndex)}
                    <span className="animate-pulse text-rose-400 ml-1">|</span>
                  </p>
                </div>

                <div className="mt-10 flex justify-center relative z-10">
                  <Heart
                    className={`text-rose-500 w-6 h-6 transition-transform duration-500 ${
                      showConfetti ? 'scale-125 animate-bounce' : 'scale-100'
                    }`}
                    fill="currentColor"
                  />
                </div>
              </div>
            </div>
            
            {/* Fotoğraf Gösterimi (Finale) */}
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-1000 ease-in-out ${
                showPhoto ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
              }`}
              onClick={handleCloseReadMode}
            >
              <div 
                className={`relative max-w-2xl w-full transform transition-all duration-1000 ${
                  showPhoto ? 'scale-100 translate-y-0 rotate-0' : 'scale-90 translate-y-10 -rotate-2'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="bg-white p-4 rounded-sm shadow-2xl rotate-1">
                    <img 
                      src="/hurriyet_gazetesi.jpg" 
                      alt="Sürpriz" 
                      className="w-full h-auto rounded-sm border border-gray-200"
                    />
                    <div className="absolute -bottom-16 left-0 right-0 text-center">
                       <p className="text-white/90 text-2xl font-serif tracking-widest drop-shadow-md">Doğum Günün Kutlu Olsun</p>
                    </div>
                 </div>
                 
                 {/* Kapat Butonu */}
                 <button
                  onClick={handleCloseReadMode}
                  className="absolute -top-12 right-0 text-white/80 hover:text-white transition"
                >
                  <X size={32} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
