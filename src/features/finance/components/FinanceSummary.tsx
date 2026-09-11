import { useState, useRef, useMemo, useEffect } from 'react'
import { formatCurrency } from '@/utils/currency'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Landmark,
  CreditCard,
  Banknote,
  Palette,
} from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { cn } from '@/lib/utils'
import type { WalletType } from '@/types'
import { CardPatternOverlay } from './CardPatternOverlay'
import { CardCustomizationModal } from './CardCustomizationModal'
import {
  getWalletCustomization,
  getThemeGradient,
  CUSTOMIZATION_EVENT,
  type WalletCustomization,
} from '../services/cardCustomizationService'

export interface WalletSummaryItem {
  id: string
  name: string
  type: WalletType | 'cash' | 'bank' | 'e_wallet' | 'other'
  balance: number
  income?: number
  expense?: number
  cardTheme?: string
  cardPattern?: string
  chipStyle?: 'gold' | 'silver' | 'none'
}

interface FinanceSummaryProps {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  netIncome: number
  month?: number
  year?: number
  onMonthChange?: (month: number, year: number) => void
  activeTypeFilter?: 'all' | 'income' | 'expense'
  onTypeFilterChange?: (filter: 'all' | 'income' | 'expense') => void
  wallets?: WalletSummaryItem[]
  onSaveCustomization?: (walletId: string, custom: WalletCustomization) => void
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const getWalletIcon = (type: string) => {
  switch (type) {
    case 'bank':
      return Landmark
    case 'e_wallet':
      return CreditCard
    case 'cash':
      return Banknote
    default:
      return Wallet
  }
}

export function FinanceSummary({
  totalBalance,
  totalIncome,
  totalExpense,
  netIncome,
  month,
  year,
  onMonthChange,
  activeTypeFilter = 'all',
  onTypeFilterChange,
  wallets = [],
  onSaveCustomization,
}: FinanceSummaryProps) {
  const now = new Date()

  // Local storage persisted balance visibility toggle
  const [showBalance, setShowBalance] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('worksphere:show-balance')
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })

  // Quick Month Selector Picker state
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState<number>(year || now.getFullYear())

  // Card Customization Modal state & version
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [customizationVersion, setCustomizationVersion] = useState(0)

  useEffect(() => {
    const handleCustomizationChange = () => {
      setCustomizationVersion(v => v + 1)
    }
    window.addEventListener(CUSTOMIZATION_EVENT, handleCustomizationChange)
    return () => window.removeEventListener(CUSTOMIZATION_EVENT, handleCustomizationChange)
  }, [])

  // Wallet Stack active card index
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // Compile slides: Slide 0 is Total Saldo Kas, Slide 1..N are individual wallets
  const slides = useMemo(() => {
    const totalCustom = getWalletCustomization('total', 'all', 0)
    const totalSlide = {
      id: 'total',
      isTotal: true,
      type: 'all',
      title: 'Total Saldo Kas',
      icon: Wallet,
      balance: totalBalance ?? 0,
      income: totalIncome ?? 0,
      expense: totalExpense ?? 0,
      net: netIncome ?? 0,
      cardTheme: totalCustom.cardTheme,
      cardPattern: totalCustom.cardPattern,
      chipStyle: totalCustom.chipStyle,
      gradient: getThemeGradient(totalCustom.cardTheme),
    }

    if (!wallets || wallets.length === 0) {
      return [totalSlide]
    }

    const walletSlides = wallets.map((w, idx) => {
      const custom = getWalletCustomization(w.id, w.type, idx + 1)
      const theme = (w.cardTheme as any) || custom.cardTheme
      const pattern = (w.cardPattern as any) || custom.cardPattern
      const chip = w.chipStyle || custom.chipStyle

      return {
        id: w.id,
        isTotal: false,
        type: w.type,
        title: w.name,
        icon: getWalletIcon(w.type),
        balance: w.balance ?? 0,
        income: w.income ?? 0,
        expense: w.expense ?? 0,
        net: (w.income ?? 0) - (w.expense ?? 0),
        cardTheme: theme,
        cardPattern: pattern,
        chipStyle: chip,
        gradient: getThemeGradient(theme),
      }
    })

    return [totalSlide, ...walletSlides]
  }, [totalBalance, totalIncome, totalExpense, netIncome, wallets, customizationVersion])

  const totalSlides = slides.length
  const safeActiveIndex = activeCardIndex < totalSlides ? activeCardIndex : 0
  const activeSlide = slides[safeActiveIndex] || slides[0]

  const toggleShowBalance = () => {
    setShowBalance(prev => {
      const next = !prev
      try {
        localStorage.setItem('worksphere:show-balance', JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleToggleFilter = (filterType: 'income' | 'expense') => {
    if (!onTypeFilterChange) return
    if (activeTypeFilter === filterType) {
      onTypeFilterChange('all')
    } else {
      onTypeFilterChange(filterType)
    }
  }

  // Drag & multi-directional swipe gesture states
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [animatingExit, setAnimatingExit] = useState<'up' | 'left' | 'right' | null>(null)

  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isPointerDownRef = useRef(false)
  const hasExceededDragThresholdRef = useRef(false)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (totalSlides <= 1 || animatingExit) return

    // If clicking a button, allow direct click without dragging
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
    isPointerDownRef.current = true
    hasExceededDragThresholdRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !dragStartRef.current || animatingExit) return

    const rawDx = e.clientX - dragStartRef.current.x
    const rawDy = e.clientY - dragStartRef.current.y

    if (!hasExceededDragThresholdRef.current) {
      if (Math.abs(rawDx) > 7 || Math.abs(rawDy) > 7) {
        hasExceededDragThresholdRef.current = true
        setIsDragging(true)
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // ignore
        }
      }
    }

    if (hasExceededDragThresholdRef.current) {
      // Elastic drag constraints (elastic = 0.2 downward resistance, 0.75 for active swipe directions)
      const x = rawDx * 0.75
      const y = rawDy < 0 ? rawDy * 0.75 : rawDy * 0.2
      setDragOffset({ x, y })
    }
  }

  const triggerExit = (direction: 'up' | 'left' | 'right') => {
    setAnimatingExit(direction)
    setIsDragging(false)

    if (direction === 'up') {
      setDragOffset({ x: 0, y: -120 })
    } else if (direction === 'left') {
      setDragOffset({ x: -140, y: 0 })
    } else {
      setDragOffset({ x: 140, y: 0 })
    }

    setTimeout(() => {
      if (direction === 'up' || direction === 'left') {
        setActiveCardIndex(prev => (prev + 1) % totalSlides)
      } else {
        setActiveCardIndex(prev => (prev - 1 + totalSlides) % totalSlides)
      }
      setDragOffset({ x: 0, y: 0 })
      setAnimatingExit(null)
      dragStartRef.current = null
      setTimeout(() => {
        hasExceededDragThresholdRef.current = false
      }, 50)
    }, 200)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }

    if (hasExceededDragThresholdRef.current && dragStartRef.current) {
      const rawDx = e.clientX - dragStartRef.current.x
      const rawDy = e.clientY - dragStartRef.current.y
      const elapsed = Math.max(1, Date.now() - dragStartRef.current.time)
      const velocityX = (rawDx / elapsed) * 1000
      const velocityY = (rawDy / elapsed) * 1000

      const isVertical = Math.abs(rawDy) > Math.abs(rawDx)

      // 1. Swipe ke Atas (Swipe Up): rawDy < -70 atau velocity.y < -300
      if (isVertical) {
        if (rawDy < -70 || velocityY < -300) {
          triggerExit('up')
          return
        }
      } else {
        // 2. Swipe ke Samping (Swipe Left / Swipe Right): |rawDx| > 70 atau |velocityX| > 300
        if (rawDx < -70 || velocityX < -300) {
          triggerExit('left')
          return
        }
        if (rawDx > 70 || velocityX > 300) {
          triggerExit('right')
          return
        }
      }
    }

    // Snap-Back jika tidak melewati ambang batas (spring damping 30, stiffness 400)
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
    dragStartRef.current = null
    setTimeout(() => {
      hasExceededDragThresholdRef.current = false
    }, 50)
  }

  // Visual feedback for back cards during drag
  const dragDist = Math.sqrt(dragOffset.x * dragOffset.x + dragOffset.y * dragOffset.y)
  const dragProgress = Math.min(1, dragDist / 60)

  // Dynamic rotation for horizontal dragging
  const activeRotation = dragOffset.x * 0.05

  return (
    <>
      {/* Wallet Stack Container (Interactive Stacked Cards ala Apple Wallet) */}
      <div className="relative w-full h-[225px] mt-6 mb-3">
        {slides.map((slide, idx) => {
          // Calculate depth relative to active card
          const depth = (idx - safeActiveIndex + totalSlides) % totalSlides
          const isFrontCard = depth === 0
          const isBackCard1 = depth === 1
          const isBackCard2 = depth === 2
          const isHiddenCard = depth > 2
          const SlideIcon = slide.icon
          const isSlideNetPositive = slide.net >= 0

          let top = '0px'
          let transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
          let filter = 'brightness(1)'
          let opacity = 1
          let zIndex = 30
          let transition = isDragging
            ? 'none'
            : animatingExit
            ? 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'

          if (isFrontCard) {
            zIndex = animatingExit ? 35 : 30
            opacity = animatingExit ? 0.4 : 1
            filter = 'brightness(1)'
            top = '0px'
            if (animatingExit === 'up') {
              transform = 'translate3d(0, -120px, 0) scale(0.9)'
            } else if (animatingExit === 'left') {
              transform = 'translate3d(-140px, 0, 0) rotate(-8deg) scale(0.92)'
            } else if (animatingExit === 'right') {
              transform = 'translate3d(140px, 0, 0) rotate(8deg) scale(0.92)'
            } else if (isDragging) {
              transform = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${activeRotation}deg)`
              transition = 'none'
            } else {
              transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
            }
          } else if (isBackCard1) {
            if (animatingExit) {
              top = '0px'
              transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
              filter = 'brightness(1)'
              zIndex = 30
              opacity = 1
            } else if (isDragging) {
              top = `${-12 + dragProgress * 12}px`
              transform = `scale(${0.95 + dragProgress * 0.05})`
              filter = `brightness(${0.88 + dragProgress * 0.12})`
              zIndex = 20
              opacity = 1
              transition = 'none'
            } else {
              top = '-12px'
              transform = 'scale(0.95)'
              filter = 'brightness(0.88)'
              zIndex = 20
              opacity = 1
            }
          } else if (isBackCard2) {
            if (animatingExit) {
              top = '-12px'
              transform = 'scale(0.95)'
              filter = 'brightness(0.88)'
              zIndex = 20
              opacity = 1
            } else if (isDragging) {
              top = `${-22 + dragProgress * 10}px`
              transform = `scale(${0.90 + dragProgress * 0.05})`
              filter = `brightness(${0.75 + dragProgress * 0.13})`
              zIndex = 10
              opacity = 1
              transition = 'none'
            } else {
              top = '-22px'
              transform = 'scale(0.90)'
              filter = 'brightness(0.75)'
              zIndex = 10
              opacity = 1
            }
          } else {
            top = '-22px'
            transform = 'scale(0.85)'
            filter = 'brightness(0.60)'
            zIndex = 0
            opacity = 0
            transition = 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }

          const cardStyle = {
            top,
            transform,
            filter,
            opacity,
            zIndex,
            transition,
            touchAction: isFrontCard ? ('none' as const) : undefined,
            cursor: isFrontCard
              ? totalSlides > 1
                ? isDragging
                  ? 'grabbing'
                  : 'grab'
                : 'default'
              : isHiddenCard
              ? 'default'
              : 'pointer',
          }

          return (
            <div
              key={slide.id}
              data-active-card={isFrontCard ? "true" : undefined}
              data-depth={depth}
              {...(isFrontCard
                ? {
                    onPointerDown: handlePointerDown,
                    onPointerMove: handlePointerMove,
                    onPointerUp: handlePointerUp,
                    onPointerCancel: handlePointerUp,
                    onClickCapture: (e: React.MouseEvent) => {
                      if (hasExceededDragThresholdRef.current) {
                        e.stopPropagation()
                        e.preventDefault()
                      }
                    },
                  }
                : {
                    role: "button",
                    tabIndex: isHiddenCard ? -1 : 0,
                    onClick: () => {
                      if (!isHiddenCard) setActiveCardIndex(idx)
                    },
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (!isHiddenCard && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        setActiveCardIndex(idx)
                      }
                    },
                    title: `Ketuk untuk beralih ke ${slide.title}`,
                    'aria-label': `Pilih kartu ${slide.title}`,
                  })}
              style={cardStyle}
              className={cn(
                "absolute inset-0 w-full h-full min-h-[210px] rounded-3xl p-4 sm:p-5 text-white flex flex-col justify-between",
                "select-none overflow-hidden border border-white/15 transform",
                slide.gradient,
                isFrontCard
                  ? "shadow-xl shadow-blue-500/20 z-30"
                  : isBackCard1
                  ? "shadow-md shadow-slate-950/20 cursor-pointer z-20 hover:brightness-[0.92]"
                  : isBackCard2
                  ? "shadow-sm shadow-slate-950/25 cursor-pointer z-10 hover:brightness-[0.80]"
                  : "pointer-events-none opacity-0 z-0"
              )}
            >
              {/* Specular Sheen & Foil Accents */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-white/5 opacity-70" />
              <div className="pointer-events-none absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              {/* Pattern Overlay */}
              <CardPatternOverlay pattern={slide.cardPattern} />

              {/* 1. Baris Atas (Header): Ikon Dompet/Chip, Judul, Palette Button & Dropdown Bulan */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center min-w-0 gap-2">
                  <div
                    className="w-7 h-7 rounded-lg bg-white/20 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden"
                    title={isFrontCard ? "Kartu Aktif" : slide.title}
                  >
                    <SlideIcon className="w-4 h-4 text-white" />
                    {slide.chipStyle === 'gold' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-1.5 bg-amber-300/90 rounded-tl-sm border border-amber-200/70 shadow-2xs" />
                    )}
                    {slide.chipStyle === 'silver' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-1.5 bg-slate-200/95 rounded-tl-sm border border-white/90 shadow-2xs" />
                    )}
                  </div>

                  <span className="text-xs sm:text-sm font-medium tracking-tight text-white/95 whitespace-nowrap truncate max-w-[130px] sm:max-w-[200px]">
                    {slide.title}
                  </span>

                  {/* Tombol Kustomisasi Tampilan Kartu di Kartu Aktif */}
                  {isFrontCard && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowCustomizationModal(true)
                      }}
                      title="Kustomisasi Tampilan Kartu"
                      aria-label="Kustomisasi Tampilan Kartu"
                      className="p-1 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white/90 hover:text-white transition-all cursor-pointer border border-white/10 shrink-0"
                    >
                      <Palette className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Bulan pada Kartu Aktif atau Pill Bulan Statis pada Kartu Belakang */}
                {month !== undefined && year !== undefined && (
                  isFrontCard && onMonthChange ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPickerYear(year || now.getFullYear())
                        setShowMonthPicker(true)
                      }}
                      title="Pilih Periode Bulan & Tahun"
                      aria-label="Pilih Periode Bulan & Tahun"
                      className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 backdrop-blur-sm cursor-pointer active:scale-95 transition-all shrink-0 border border-white/10"
                    >
                      <span>
                        {MONTH_NAMES[month - 1]} {year}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    </button>
                  ) : (
                    <div className="bg-white/15 px-2.5 py-1 rounded-full text-xs font-medium text-white/90 flex items-center gap-1 backdrop-blur-sm shrink-0 border border-white/10">
                      <span>
                        {MONTH_NAMES[month - 1]} {year}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* 2. Baris Tengah (Nominal Saldo & Trend Growth) */}
              <div
                {...(isFrontCard
                  ? {
                      role: 'button',
                      tabIndex: 0,
                      onClick: toggleShowBalance,
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleShowBalance()
                        }
                      },
                      className:
                        'my-2 sm:my-3 select-none group active:scale-[0.99] transition-transform cursor-pointer rounded-2xl p-1 -m-1 hover:bg-white/5 relative z-10',
                      title: showBalance
                        ? 'Klik untuk sembunyikan saldo'
                        : 'Klik untuk tampilkan saldo',
                      'aria-label': showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo',
                    }
                  : {
                      className: 'my-2 sm:my-3 select-none relative z-10 pointer-events-none',
                    })}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "text-3xl font-extrabold text-white tracking-tight transition-all duration-300",
                      showBalance ? "opacity-100 blur-none" : "opacity-90 blur-[1px]"
                    )}
                  >
                    {showBalance ? formatCurrency(slide.balance) : '••••••••'}
                  </div>
                  <div className="text-white/75 group-hover:text-white transition-colors p-0.5">
                    {showBalance ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-white/80 font-medium">
                  {isSlideNetPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                  )}
                  <span>
                    <span
                      className={cn(
                        "font-bold transition-all duration-300",
                        isSlideNetPositive ? "text-emerald-300" : "text-rose-300",
                        showBalance ? "opacity-100 blur-none" : "opacity-80 blur-[1px]"
                      )}
                    >
                      {showBalance
                        ? `${isSlideNetPositive ? '+' : ''}${formatCurrency(slide.net)}`
                        : '••••••'}
                    </span>{' '}
                    {month ? `${MONTH_NAMES[month - 1]} ${year}` : 'bulan ini'}
                  </span>
                </div>
              </div>

              {/* 3. Baris Bawah (Pemasukan & Pengeluaran) */}
              <div className="border-t border-white/15 pt-2.5 mt-2 flex justify-between items-center gap-2 relative z-10">
                {/* Pemasukan */}
                {isFrontCard ? (
                  <button
                    type="button"
                    onClick={() => handleToggleFilter('income')}
                    className={cn(
                      "flex-1 text-left p-1.5 sm:p-2 rounded-2xl transition-all duration-200 hover:bg-white/10 active:scale-95 cursor-pointer",
                      activeTypeFilter === 'income'
                        ? "ring-2 ring-emerald-300/60 bg-white/10 shadow-xs"
                        : "border border-transparent"
                    )}
                    title={
                      activeTypeFilter === 'income'
                        ? 'Klik untuk tampilkan semua transaksi'
                        : 'Klik untuk memfilter transaksi pemasukan saja'
                    }
                    aria-pressed={activeTypeFilter === 'income'}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white/75 text-xs font-medium flex items-center gap-1.5">
                        <span>Pemasukan</span>
                        {activeTypeFilter === 'income' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 font-bold">
                            Aktif
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-emerald-300 font-bold text-base tracking-tight mt-0.5 transition-all duration-300",
                        showBalance ? "opacity-100 blur-none" : "opacity-80 blur-[1px]"
                      )}
                    >
                      {showBalance ? `+${formatCurrency(slide.income)}` : '+••••'}
                    </div>
                  </button>
                ) : (
                  <div className="flex-1 text-left p-1.5 sm:p-2 rounded-2xl border border-transparent pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span className="text-white/75 text-xs font-medium">Pemasukan</span>
                    </div>
                    <div
                      className={cn(
                        "text-emerald-300 font-bold text-base tracking-tight mt-0.5 transition-all duration-300",
                        showBalance ? "opacity-100 blur-none" : "opacity-80 blur-[1px]"
                      )}
                    >
                      {showBalance ? `+${formatCurrency(slide.income)}` : '+••••'}
                    </div>
                  </div>
                )}

                {/* Pengeluaran */}
                {isFrontCard ? (
                  <button
                    type="button"
                    onClick={() => handleToggleFilter('expense')}
                    className={cn(
                      "flex-1 text-right p-1.5 sm:p-2 rounded-2xl transition-all duration-200 hover:bg-white/10 active:scale-95 cursor-pointer",
                      activeTypeFilter === 'expense'
                        ? "ring-2 ring-rose-300/60 bg-white/10 shadow-xs"
                        : "border border-transparent"
                    )}
                    title={
                      activeTypeFilter === 'expense'
                        ? 'Klik untuk tampilkan semua transaksi'
                        : 'Klik untuk memfilter transaksi pengeluaran saja'
                    }
                    aria-pressed={activeTypeFilter === 'expense'}
                  >
                    <div className="flex items-center justify-end">
                      <span className="text-white/75 text-xs font-medium flex items-center gap-1.5">
                        {activeTypeFilter === 'expense' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-400/20 text-rose-300 font-bold">
                            Aktif
                          </span>
                        )}
                        <span>Pengeluaran</span>
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-rose-300 font-bold text-base tracking-tight mt-0.5 transition-all duration-300",
                        showBalance ? "opacity-100 blur-none" : "opacity-80 blur-[1px]"
                      )}
                    >
                      {showBalance ? `-${formatCurrency(slide.expense)}` : '-••••'}
                    </div>
                  </button>
                ) : (
                  <div className="flex-1 text-right p-1.5 sm:p-2 rounded-2xl border border-transparent pointer-events-none">
                    <div className="flex items-center justify-end">
                      <span className="text-white/75 text-xs font-medium">Pengeluaran</span>
                    </div>
                    <div
                      className={cn(
                        "text-rose-300 font-bold text-base tracking-tight mt-0.5 transition-all duration-300",
                        showBalance ? "opacity-100 blur-none" : "opacity-80 blur-[1px]"
                      )}
                    >
                      {showBalance ? `-${formatCurrency(slide.expense)}` : '-••••'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Baris Status Kartu: Kiri Badge Pill Nama Dompet + Counter (1/4), Kanan Pagination Dots */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-between px-1 mt-3 mb-1 select-none">
          {/* Kiri: Badge pill semi-transparan nama dompet yang aktif + info counter (1/4) */}
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center gap-1.5">
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {activeSlide.isTotal ? 'Semua Kas' : activeSlide.title}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">
              ({safeActiveIndex + 1}/{totalSlides})
            </span>
          </div>

          {/* Kanan: Titik pagination dots halus */}
          <div className="flex items-center gap-1.5 shrink-0">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveCardIndex(idx)}
                className={cn(
                  "cursor-pointer transition-all duration-300",
                  safeActiveIndex === idx
                    ? "w-4 h-1.5 bg-indigo-600 rounded-full"
                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full hover:bg-slate-400"
                )}
                aria-label={`Slide ${idx + 1}`}
                title={`Pilih kartu ${s.title}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Month Selector Picker Modal / BottomSheet */}
      {month !== undefined && year !== undefined && onMonthChange && (
        <BottomSheet
          open={showMonthPicker}
          onClose={() => setShowMonthPicker(false)}
          title="Pilih Periode Bulan & Tahun"
        >
          <div className="space-y-4 pb-4">
            {/* Year navigator */}
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setPickerYear(prev => prev - 1)}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer"
                title="Tahun sebelumnya"
                aria-label="Tahun sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {pickerYear}
              </span>
              <button
                type="button"
                onClick={() => setPickerYear(prev => prev + 1)}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer"
                title="Tahun berikutnya"
                aria-label="Tahun berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 12 Months Grid */}
            <div className="grid grid-cols-3 gap-2">
              {MONTH_NAMES.map((name, index) => {
                const monthNum = index + 1
                const isSelected = month === monthNum && year === pickerYear
                const isCurrent = (now.getMonth() + 1) === monthNum && now.getFullYear() === pickerYear

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      if (onMonthChange) {
                        onMonthChange(monthNum, pickerYear)
                      }
                      setShowMonthPicker(false)
                    }}
                    className={cn(
                      "py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1",
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                        : isCurrent
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60"
                        : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <span>{name}</span>
                    {isCurrent && !isSelected && (
                      <span className="text-[10px] text-indigo-500 font-normal">Sekarang</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Modal Kustomisasi Tampilan Kartu */}
      <CardCustomizationModal
        open={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        wallet={
          activeSlide
            ? {
                id: activeSlide.id,
                title: activeSlide.title,
                balance: activeSlide.balance,
                icon: activeSlide.icon,
                cardTheme: activeSlide.cardTheme,
                cardPattern: activeSlide.cardPattern,
                chipStyle: activeSlide.chipStyle,
              }
            : null
        }
        onSaveCustomization={(walletId, custom) => {
          setCustomizationVersion((v) => v + 1)
          if (onSaveCustomization) {
            onSaveCustomization(walletId, custom)
          }
        }}
      />
    </>
  )
}
