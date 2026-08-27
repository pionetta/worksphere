import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { BottomNavigation, SidebarNavigation } from './Navigation'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthProvider>
  )
}

describe('BottomNavigation', () => {
  it('should render all navigation items', () => {
    renderWithProviders(<BottomNavigation />)
    expect(screen.getByText('Beranda')).toBeInTheDocument()
    expect(screen.getByText('Absensi')).toBeInTheDocument()
    expect(screen.getByText('Keuangan')).toBeInTheDocument()
    expect(screen.getByText('To-Do')).toBeInTheDocument()
  })

  it('should have correct links', () => {
    renderWithProviders(<BottomNavigation />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/app')
    expect(hrefs).toContain('/app/attendance')
    expect(hrefs).toContain('/app/finance')
    expect(hrefs).toContain('/app/todo')
  })

  it('should have aria-label for navigation', () => {
    renderWithProviders(<BottomNavigation />)
    expect(screen.getByLabelText('Navigasi utama')).toBeInTheDocument()
  })

  it('should be hidden on md+ screens', () => {
    const { container } = renderWithProviders(<BottomNavigation />)
    const nav = container.querySelector('nav')
    expect(nav?.className).toContain('md:hidden')
  })
})

describe('SidebarNavigation', () => {
  it('should render all navigation items', () => {
    renderWithProviders(<SidebarNavigation />)
    expect(screen.getByText('Beranda')).toBeInTheDocument()
    expect(screen.getByText('Absensi')).toBeInTheDocument()
    expect(screen.getByText('Keuangan')).toBeInTheDocument()
    expect(screen.getByText('To-Do')).toBeInTheDocument()
  })

  it('should render brand logo', () => {
    renderWithProviders(<SidebarNavigation />)
    expect(screen.getByText('Worksphere')).toBeInTheDocument()
    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('should be hidden on small screens', () => {
    const { container } = renderWithProviders(<SidebarNavigation />)
    const nav = container.querySelector('nav')
    expect(nav?.className).toContain('hidden')
    expect(nav?.className).toContain('md:flex')
  })
})
