"use client"
import QR from '@/app/components/QR'
import React from 'react'

const page = () => {
  const texts:string ="Sebastian Ramos"
  return (
    <div className='flex flex-col items-center gap-10 m-20'>
      <h1 className='text-4xl'>Your QR Code</h1>
      <QR text={texts}/>
      <h3 className='text-xl'>This will help the host's check you in with no hastle</h3>
    </div>
  )
}

export default page
