"use client"
import React from 'react'
import { useState } from 'react'
import MyEventsEventDisplay from './MyEventsEventDisplay'
const MyEvents = () => {
  console.log('MyEvents component is rendering!')

  const [whichEvent,setWhichEvent] = useState('YourEvents')

  const events = [{
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
  {
    _dayOfEvent: new Date(),
    rsvp: 100,
    organizer: {
                _id: 1,
                name: "TSA"
    },
    _id:1,
    description: "Knot making arts and crafts and Hang out and chill",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC1mSGEwwsVbbaLHKTPydNWwTRyjR_KdZqgw&s",
    category: "Hangout/Chill",
    eventTitle: "Knot Making hangout"
  },
];



  return (
    <div className=" bg-dark-gray min-h-screen">
        <nav className="ml-5 pt-3 relative mb-28">  {/* Add relative positioning */}
        <div className="flex gap-3 relative">
            <button className={`tab-button ${whichEvent === 'YourEvents' ? 'active' : ''}`}
                    onClick={() => setWhichEvent('YourEvents')}
            >
                Your Events
            </button>
                <span className="text-white-100"> | </span>
            <button 
              className={`tab-button ${whichEvent === 'PastEvents' ? 'active' : ''}`}
              onClick={() => setWhichEvent('PastEvents')}
            >
                Past Events
            </button>
        <div 
            className={`absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                whichEvent === 'YourEvents' 
                ? 'left-0 w-[87px]' 
                : 'left-[110px] w-[90px]' 
                }`}
          />
          </div>
        </nav>
          <div className=' px-5 grid md:grid-cols-4 sm:grid-cols-2 gap-5'>
            {
              events?.length > 0 ? (
                events.map( (event: EventType, index:number) => (
                  <MyEventsEventDisplay key={event?._id} event={event}/>
                ))
              ) : (
                <p className='text-sm font-normal text-white-100'>No Events RSVP'd</p>
              )} 
          </div>

    </div>
  )
}

export default MyEvents
