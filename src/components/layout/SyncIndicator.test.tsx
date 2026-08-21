import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncIndicator, OfflineBanner } from './SyncIndicator'

describe('SyncIndicator', () => {
  it('should render synced status when synced and online', () => {
    render(
      <SyncIndicator syncStatus="synced" networkStatus="online" pendingCount={0} />
    )
    expect(screen.getByText('Tersinkron')).toBeInTheDocument()
  })

  it('should show offline indicator when network is offline', () => {
    render(<SyncIndicator syncStatus="offline" networkStatus="offline" pendingCount={0} />)
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('should show syncing indicator when syncing', () => {
    render(<SyncIndicator syncStatus="syncing" networkStatus="online" pendingCount={0} />)
    expect(screen.getByText('Menyinkronkan...')).toBeInTheDocument()
  })

  it('should show error with retry button', () => {
    const onRetry = vi.fn()
    render(
      <SyncIndicator syncStatus="error" networkStatus="online" pendingCount={0} onRetry={onRetry} />
    )
    expect(screen.getByText('Gagal sinkron')).toBeInTheDocument()
    const retryBtn = screen.getByText('Coba')
    expect(retryBtn).toBeInTheDocument()
    retryBtn.click()
    expect(onRetry).toHaveBeenCalled()
  })

  it('should show pending count when status is pending', () => {
    render(<SyncIndicator syncStatus="pending" networkStatus="online" pendingCount={5} />)
    expect(screen.getByText('5 antrian')).toBeInTheDocument()
  })

  it('should show offline even when sync status is syncing', () => {
    render(<SyncIndicator syncStatus="syncing" networkStatus="offline" pendingCount={3} />)
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })
})

describe('OfflineBanner', () => {
  it('should render nothing when online', () => {
    const { container } = render(<OfflineBanner isOnline={true} />)
    expect(container.innerHTML).toBe('')
  })

  it('should render banner when offline', () => {
    render(<OfflineBanner isOnline={false} />)
    expect(
      screen.getByText('Offline — perubahan akan disinkronkan saat online.')
    ).toBeInTheDocument()
  })
})
