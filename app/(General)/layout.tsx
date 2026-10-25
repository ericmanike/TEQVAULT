import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { metadata } from '../layout'


export const pageMetadata: Metadata = {
  title: 'TEQVAULT - Your #1 Plug For Reliable Computers, Smart Phones & Accesories ',
  description: 'Buy quality and reliable computers, smart phones and accessories on TEQVAULT - your #1 plug for all your tech needs.',
  ...metadata,
}


export default function layout({ children }: { children: React.ReactNode }) {
 
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-[90vh] w-full">
        {children}
      </div>
      <Footer />
    </div>
  )
}
