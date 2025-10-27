'use client'
import { useEffect, useState } from 'react'

export default function useDevice() {
    const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'unknown'>('unknown')

    useEffect(() => {
        const ua = navigator.userAgent
        console.log("User Agent:", ua)
        if (/iPad|Tablet|PlayBook|Silk/.test(ua)) setDevice('tablet')
        else if (/Mobile|Android|iPhone|iPod|IEMobile|Opera Mini/.test(ua)) setDevice('mobile')
        else setDevice('desktop')
    }, [])

    return device
}
