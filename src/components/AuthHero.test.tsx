import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthHero } from './AuthHero'

describe('AuthHero', () => {
  it('renderiza o título principal', () => {
    render(<AuthHero />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza os três cards de benefício', () => {
    render(<AuthHero />)
    expect(screen.getByText(/Conexão Segura/i)).toBeInTheDocument()
    expect(screen.getByText(/Acesso Rápido/i)).toBeInTheDocument()
    expect(screen.getByText(/Sempre Disponível/i)).toBeInTheDocument()
  })

  it('renderiza a tag da marca Little Minds', () => {
    render(<AuthHero />)
    expect(screen.getAllByText(/Little Minds/i).length).toBeGreaterThan(0)
  })
})