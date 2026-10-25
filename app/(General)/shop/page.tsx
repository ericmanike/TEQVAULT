import React from 'react'
import BuySuspense from '@/components/buySuspense'
import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teqvault.app'

export const metadata: Metadata = {
  title: 'Shop Quality Phones, Laptops & Accessories | TEQVAULT',
  description: 'Browse and buy quality iPhones, Android smartphones, laptops, audio gadgets, and electronic accessories at affordable prices on TEQVAULT.',
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: 'Shop Quality Phones, Laptops & Accessories | TEQVAULT',
    description: 'Browse and buy quality iPhones, Android smartphones, laptops, audio gadgets, and electronic accessories at affordable prices on TEQVAULT.',
    url: `${siteUrl}/shop`,
    siteName: 'TEQVAULT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Quality Phones, Laptops & Accessories | TEQVAULT',
    description: 'Browse and buy quality iPhones, Android smartphones, laptops, audio gadgets, and electronic accessories at affordable prices on TEQVAULT.',
  },
}

function page() {
  return (
    <>
      <BuySuspense />
    </>
  )
}

export default page
