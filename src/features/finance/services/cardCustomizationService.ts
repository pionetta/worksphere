export type WalletCardTheme =
  | 'royal-blue'
  | 'midnight-dark'
  | 'emerald-mint'
  | 'sunset-orange'
  | 'amethyst-purple'

export type WalletCardPattern = 'none' | 'waves' | 'mesh' | 'dots'

export type WalletChipStyle = 'gold' | 'silver' | 'none'

export interface WalletCustomization {
  cardTheme: WalletCardTheme
  cardPattern: WalletCardPattern
  chipStyle: WalletChipStyle
}

export interface ThemeOption {
  id: WalletCardTheme
  name: string
  gradient: string
  ringColor: string
  swatchGradient: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    gradient: 'bg-gradient-to-br from-blue-600 to-indigo-600',
    ringColor: 'ring-blue-400',
    swatchGradient: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Slate',
    gradient: 'bg-gradient-to-br from-slate-900 to-slate-800',
    ringColor: 'ring-slate-400',
    swatchGradient: 'from-slate-900 to-slate-800',
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Mint',
    gradient: 'bg-gradient-to-br from-teal-600 to-emerald-600',
    ringColor: 'ring-emerald-400',
    swatchGradient: 'from-teal-600 to-emerald-600',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Peach',
    gradient: 'bg-gradient-to-br from-rose-500 to-amber-500',
    ringColor: 'ring-rose-400',
    swatchGradient: 'from-rose-500 to-amber-500',
  },
  {
    id: 'amethyst-purple',
    name: 'Amethyst Purple',
    gradient: 'bg-gradient-to-br from-violet-600 to-purple-700',
    ringColor: 'ring-purple-400',
    swatchGradient: 'from-violet-600 to-purple-700',
  },
]

export interface PatternOption {
  id: WalletCardPattern
  name: string
}

export const PATTERN_OPTIONS: PatternOption[] = [
  { id: 'none', name: 'Polos' },
  { id: 'waves', name: 'Gelombang (Waves)' },
  { id: 'dots', name: 'Bintik (Dots)' },
  { id: 'mesh', name: 'Jaring (Mesh)' },
]

export interface ChipOption {
  id: WalletChipStyle
  name: string
}

export const CHIP_OPTIONS: ChipOption[] = [
  { id: 'gold', name: 'Emas (Gold)' },
  { id: 'silver', name: 'Perak (Silver)' },
  { id: 'none', name: 'Tanpa Chip' },
]

export const STORAGE_KEY = 'worksphere:wallet-customizations'
export const CUSTOMIZATION_EVENT = 'worksphere-card-customization-changed'

export function getThemeGradient(themeId?: string): string {
  const match = THEME_OPTIONS.find(t => t.id === themeId)
  return match ? match.gradient : THEME_OPTIONS[0].gradient
}

export function getDefaultCustomization(walletId: string, type?: string, index = 0): WalletCustomization {
  if (walletId === 'total') {
    return {
      cardTheme: 'royal-blue',
      cardPattern: 'none',
      chipStyle: 'gold',
    }
  }

  // Fallbacks by wallet type
  let defaultTheme: WalletCardTheme = 'royal-blue'
  if (type === 'bank') {
    defaultTheme = 'midnight-dark'
  } else if (type === 'cash') {
    defaultTheme = 'emerald-mint'
  } else if (type === 'e_wallet') {
    defaultTheme = 'amethyst-purple'
  } else {
    const list: WalletCardTheme[] = [
      'royal-blue',
      'midnight-dark',
      'emerald-mint',
      'sunset-orange',
      'amethyst-purple',
    ]
    defaultTheme = list[index % list.length]
  }

  return {
    cardTheme: defaultTheme,
    cardPattern: 'none',
    chipStyle: 'gold',
  }
}

export function getWalletCustomizations(): Record<string, WalletCustomization> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, WalletCustomization>
  } catch {
    return {}
  }
}

export function getWalletCustomization(
  walletId: string,
  type?: string,
  index = 0
): WalletCustomization {
  const all = getWalletCustomizations()
  if (all[walletId]) {
    return all[walletId]
  }
  return getDefaultCustomization(walletId, type, index)
}

export function saveWalletCustomization(
  walletId: string,
  customization: WalletCustomization
): void {
  try {
    const all = getWalletCustomizations()
    all[walletId] = customization
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    window.dispatchEvent(
      new CustomEvent(CUSTOMIZATION_EVENT, {
        detail: { walletId, customization },
      })
    )
  } catch {
    // ignore
  }
}
