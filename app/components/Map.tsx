'use client'
import React from 'react'
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

const Map = () => {

const mapContainer = useRef<HTMLDivElement | null>(null);
const map = useRef<mapboxgl.Map | null>(null);

    useEffect( () => {
        console.log('Component Mounted')
        document.body.style.overflow = 'hidden';
        if (map.current || !mapContainer.current) return;
        
        map.current = new mapboxgl.Map( {
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-74.006, 40.7128], // NYC
            zoom: 12,
        });

        return () => {
            document.body.style.overflow = 'auto';
            console.log('Component Dismounted')
            map.current?.remove()
            map.current = null;

        };




    }, [])


  return (
    <div>
        <div 
        ref={mapContainer}
        className='map-container'
        style={{width:'100%', height: '100%'}}
        
        />
    </div>
  )
}

export default Map
