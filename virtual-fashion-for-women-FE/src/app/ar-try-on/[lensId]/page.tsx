'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { messageToast } from '@/helpers/toastHelper'
import { api } from '@/api/instance'
import { ResponseProductColorDTO } from '@/models/ResponseProductColorDTO '

// 👉 DYNAMIC IMPORT: đảm bảo @snap/camera-kit chỉ load trên client
const loadCameraKit = async () => {
    const { bootstrapCameraKit } = await import('@snap/camera-kit')
    return bootstrapCameraKit
}

export default function ArTryOnPage() {
    const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'unknown'>('unknown')
    const router = useRouter()
    const params = useParams() as { lensId: string }
    const [productColor, setProductColor] = useState<ResponseProductColorDTO>()
    const snapKitAPIKey = process.env.SNAP_KIT_API_KEY

    const fetchProductColors = async (lensId: string) => {
        try {
            const response = await api.get(`/product-color/by-lens-id/${lensId}`)
            if (response.status === 200) {
                const data = response.data
                setProductColor(data)
                return data
            } else {
                console.error('❌ Failed to fetch product colors:', response.statusText)
            }
        } catch (error: any) {
            console.error('❌ Error fetching product colors:', error.response?.data?.message)
        }
    }

    useEffect(() => {
        // 🔍 Xác định loại thiết bị
        if (typeof navigator !== 'undefined') {
            const ua = navigator.userAgent
            if (/iPad|Tablet|PlayBook|Silk/.test(ua)) setDevice('tablet')
            else if (/Mobile|Android|iPhone|iPod|IEMobile|Opera Mini/.test(ua)) setDevice('mobile')
            else setDevice('desktop')
        }
    }, [])

    useEffect(() => {
        console.log("Api key:", snapKitAPIKey)
        if (device === 'unknown') return

        if (device === 'desktop') {
            messageToast.error('Chức năng thử đồ AR chỉ khả dụng trên thiết bị di động và máy tính bảng.')
            router.push('/')
            return
        }

        if (device === 'mobile' || device === 'tablet') {
            fetchProductColors(params.lensId).then(async (data: ResponseProductColorDTO) => {
                const bootstrapCameraKit = await loadCameraKit()
                startCameraAR(bootstrapCameraKit, data.lensId, data.packageLens)
            })
        }
    }, [device])

    async function startCameraAR(bootstrapCameraKit: any, lensId: string, packageLens: string) {
        try {
            console.log('📷 Starting AR camera...')
            const cameraKit = await bootstrapCameraKit({
                apiToken: process.env.NEXT_PUBLIC_SNAP_KIT_API_KEY,
            })

            const liveRenderTarget = document.getElementById('camera-view') as HTMLCanvasElement
            const session = await cameraKit.createSession({ liveRenderTarget })

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            })

            await session.setSource(mediaStream)
            await session.play()
            console.log('✅ Camera started successfully')

            console.log('🎨 Loading lens...')
            const lens = await cameraKit.lensRepository.loadLens(lensId, packageLens)

            await session.applyLens(lens)
            console.log('✨ Lens applied successfully')
        } catch (error) {
            console.error('❌ Error starting AR:', error)
        }
    }

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden">
            {(device === 'mobile' || device === 'tablet') && (
                <canvas id="camera-view" className="absolute top-0 left-0 w-full h-full object-cover" />
            )}

            {device === 'unknown' && (
                <div className="flex items-center justify-center w-full h-full text-white text-lg">
                    Đang kiểm tra thiết bị...
                </div>
            )}
        </div>
    )
}
