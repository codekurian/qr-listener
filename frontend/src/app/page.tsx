'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoginPage from './login/page'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // For demo purposes, redirect to login
    router.push('/login')
  }, [router])

  return <LoginPage />
}