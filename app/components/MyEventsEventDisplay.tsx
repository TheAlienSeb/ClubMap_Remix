import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const MyEventsEventDisplay = ( {event} : {event:EventType}) => {

    const {_dayOfEvent, eventTitle, rsvp, organizer: {_id: organizerID, name}, _id, description, image, category} = event

  return (
    <>
<Link href="MyEvents/1" >
<article className='event-card w-fit px-5'>
<header>
  <h3 className='text-xl font-bold'>{eventTitle}</h3>
  <p className='text-white-600'>by {name}</p>
  <p>{category}</p>
</header>

<div className='my-4'>
  <Image 
    src={image}
    alt="Event photo" 
    width={300} 
    height={200}
    className='rounded'
  />
</div>

<div className='space-y-2'>
  <p className='text-sm text-white-600'>{description}</p>
  
  <div className='flex justify-between items-center text-sm'>
    <time dateTime="2024-01-15">{formatDate(_dayOfEvent)}</time>
    <span>RSVP'd: {rsvp}/125</span>
  </div>
</div>
</article>
</Link>
</>
  )
  
}

export default MyEventsEventDisplay
