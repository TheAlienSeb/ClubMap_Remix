import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

const NavBar = () => {
  return (
    <div>
        <header className='sidebar'>
            <nav className='flex flex-col justify-between ml-1'>
                    <Image className="cursor-default" src="/generated-image.png" alt="logo" width={180} height={180}></Image>
                <div className='flex flex-col'>
                      <Link href="/user/1/MyMap">
                      <span className='sidebar-item'>My Map</span>
                     </Link>
                      <Link href="/user/1/MyEvents">
                        <span className='sidebar-item'>My Events</span>
                      </Link>
                      <Link href="/user/1/GroupChats">
                        <span className='sidebar-item'>GroupChats</span>
                      </Link>
                      <Link href="/user/1/QR">
                        <span className='sidebar-item'>QR</span>
                      </Link>
                      <Link href="/user/1/Profile">
                        <span className='sidebar-item'>My Profile</span>
                      </Link>
                </div>
            </nav>
        </header>
    </div>
  )
}

export default NavBar
