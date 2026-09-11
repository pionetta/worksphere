import React, { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/currency'
import {
  THEME_OPTIONS,
  PATTERN_OPTIONS,
  CHIP_OPTIONS,
  type WalletCardTheme,
  type WalletCardPattern,
  type WalletChipStyle,
  type WalletCustomization,
  saveWalletCustomization,
  getThemeGradient,
} from '../services/cardCustomizationService'
import { CardPatternOverlay } from './CardPatternOverlay'

interface CardCustomizationModalProps {
  open: boolean
  onClose: () => void
  wallet: {
    id: string
    title: string
    balance: number
    icon: React.ElementType
    cardTheme?: WalletCardTheme | string
    cardPattern?: WalletCardPattern | string
    chipStyle?: WalletChipStyle
  } | null
  onSaveCustomization?: (walletId: string, custom: WalletCustomization) => void
}

export const CardCustomizationModal: React.FC<CardCustomizationModalProps> = ({
  open,
  onClose,
  wallet,
  onSaveCustomization,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<WalletCardTheme>('royal-blue')
  const [selectedPattern, setSelectedPattern] = useState<WalletCardPattern>('none')
  const [selectedChip, setSelectedChip] = useState<WalletChipStyle>('gold')

  useEffect(() => {
    if (wallet) {
      setSelectedTheme((wallet.cardTheme as WalletCardTheme) || 'royal-blue')
      setSelectedPattern((wallet.cardPattern as WalletCardPattern) || 'none')
      setSelectedChip(wallet.chipStyle || 'gold')
    }
  }, [wallet])

  if (!wallet) return null

  const WalletIcon = wallet.icon

  const handleSave = () => {
    const newCustomization: WalletCustomization = {
      cardTheme: selectedTheme,
      cardPattern: selectedPattern,
      chipStyle: selectedChip,
    }

    saveWalletCustomization(wallet.id, newCustomization)
    if (onSaveCustomization) {
      onSaveCustomization(wallet.id, newCustomization)
    }
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Kustomisasi Tampilan Kartu">
      <div className="space-y-5 pb-6">
        {/* 1. Live Preview Compact Card */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Live Preview
            </span>
            <span className="text-[11px] text-slate-400">
              {wallet.title}
            </span>
          </div>

          <div
            className={cn(
              "relative w-full h-36 rounded-2xl p-4 text-white shadow-lg overflow-hidden select-none border border-white/20 transition-all duration-300",
              getThemeGradient(selectedTheme)
            )}
          >
            {/* Pattern Overlay */}
            <CardPatternOverlay pattern={selectedPattern} />

            {/* Sheen effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-white/5 opacity-70" />
            <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/20 border border-white/20 text-white flex items-center justify-center shrink-0 relative overflow-hidden">
                  <WalletIcon className="w-3.5 h-3.5 text-white" />
                  {selectedChip === 'gold' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1 bg-amber-300 rounded-tl-sm border border-amber-200" />
                  )}
                  {selectedChip === 'silver' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1 bg-slate-200 rounded-tl-sm border border-white" />
                  )}
                </div>
                <span className="text-xs font-medium text-white/90 truncate max-w-[160px]">
                  {wallet.title}
                </span>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 font-medium">
                Aktif
              </span>
            </div>

            {/* Balance */}
            <div className="relative z-10 mt-4">
              <div className="text-xl font-bold tracking-tight text-white">
                {formatCurrency(wallet.balance)}
              </div>
              <div className="text-[10px] text-white/75 mt-0.5">
                Saldo Saat Ini
              </div>
            </div>
          </div>
        </div>

        {/* 2. Color Swatches (Deretan Lingkaran Gradien Horizontal) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
            Pilihan Warna / Gradien
          </label>
          <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-none">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = selectedTheme === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedTheme(theme.id)}
                  title={theme.name}
                  aria-label={`Pilih warna ${theme.name}`}
                  className={cn(
                    "w-10 h-10 rounded-full shrink-0 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm relative",
                    "bg-gradient-to-br",
                    theme.swatchGradient,
                    isSelected
                      ? "ring-3 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-105"
                      : "hover:scale-105 opacity-85 hover:opacity-100"
                  )}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Pattern Overlay (Pola Latar Belakang) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pola Latar (Pattern Overlay)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PATTERN_OPTIONS.map((p) => {
              const isSelected = selectedPattern === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPattern(p.id)}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer text-center border",
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                  )}
                >
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Chip Style Accent */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Aksen Chip Kartu
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CHIP_OPTIONS.map((c) => {
              const isSelected = selectedChip === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedChip(c.id)}
                  className={cn(
                    "py-2 px-2 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer text-center border flex items-center justify-center gap-1.5",
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                  )}
                >
                  {c.id === 'gold' && (
                    <span className="w-2.5 h-2 rounded-xs bg-amber-400 border border-amber-300 shrink-0" />
                  )}
                  {c.id === 'silver' && (
                    <span className="w-2.5 h-2 rounded-xs bg-slate-300 border border-slate-200 shrink-0" />
                  )}
                  <span>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 5. Tombol Simpan (Neumorphic Pill) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/30"
          >
            <Check className="w-4 h-4" />
            Terapkan Kustomisasi
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
