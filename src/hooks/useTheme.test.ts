import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('should default to system theme when nothing stored', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })

  it('should read stored theme from localStorage', () => {
    localStorage.setItem('worksphere-theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('should persist theme to localStorage when changed', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(localStorage.getItem('worksphere-theme')).toBe('dark')
    expect(result.current.theme).toBe('dark')
  })

  it('should apply dark class to html when theme is dark', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('should remove dark class from html when theme is light', () => {
    localStorage.setItem('worksphere-theme', 'dark')
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should cycle themes: light -> dark -> system', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.setTheme('system')
    })
    expect(result.current.theme).toBe('system')
  })

  it('should return resolved value matching actual appearance', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.resolved).toBe('light')

    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.resolved).toBe('dark')
  })

  it('should handle localStorage errors gracefully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const { result } = renderHook(() => useTheme())

    expect(() => {
      act(() => {
        result.current.setTheme('dark')
      })
    }).not.toThrow()

    setItemSpy.mockRestore()
  })
})

describe('Theme persistence across refresh', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('should maintain theme after re-reading from localStorage', () => {
    localStorage.setItem('worksphere-theme', 'dark')

    const stored = localStorage.getItem('worksphere-theme')
    expect(stored).toBe('dark')

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.resolved).toBe('dark')
  })

  it('should default to system when no stored value', () => {
    const stored = localStorage.getItem('worksphere-theme')
    expect(stored).toBeNull()

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })
})
