import React from 'react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
const EventPage = () => {
  return (

    <article className='w-fit flex flex-col justify-center mx-auto mt-10 items-center'>
    
    <div className=''>
      <Image 
        src="/images.jpeg"
        alt="Event photo" 
        width={900} 
        height={350}
        className='rounded-md'
      />
    </div>  
    <div className='mt-16 '>
    <header className=''>
    <time  className="text-xl" dateTime="2024-01-15">{formatDate((new Date).toDateString())}</time> 
      <h1 className='text-5xl'>TSA's HANGOUT AND CHILL</h1>
      <p className='text-white-600'>by SEBASTIAN</p>
      <p>TESTING Category</p>
    </header>
    
    <div className=''>
    <h1 className='text-2xl'>Date and Time</h1>
    <div className='text-sm'>
        <time dateTime="2024-01-15">{formatDate((new Date).toDateString())}</time> 
        <br/>
        <p>RSVP'd: 20/125</p>
      </div>
      <br />
      <p className='text-sm text-white-600 max-w-3xl'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sagittis libero id vestibulum rhoncus. Integer dapibus cursus arcu. Aenean maximus lorem dui, id vehicula justo cursus lacinia. Ut sit amet libero quis velit mattis tincidunt et nec tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent luctus nulla vel quam mollis, rutrum vehicula sapien hendrerit. Phasellus at elit tortor. Morbi et lacus ut justo lobortis condimentum id quis metus. Ut libero turpis, interdum quis sodales non, ultrices ac augue. Nunc vel tellus purus. Pellentesque ac ligula a augue congue pharetra. Suspendisse ac sem pellentesque, pellentesque nulla nec, tempus quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas lectus arcu, commodo tempor egestas in, finibus non ipsum</p>
    </div>

    <div>
    </div>
    </div>  
    </article>
  )
}

export default EventPage
