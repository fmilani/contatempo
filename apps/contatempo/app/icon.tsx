import React from 'react'
import { ImageResponse } from '@vercel/og'
 
export const runtime = 'edge'
 
const imageSize = {
  width: 192,
  height: 192,
}

export function generateImageMetadata() {
  return [
    {
      contentType: 'image/png',
      size: { width: 48, height: 48 },
      id: 'small',
    },
    {
      contentType: 'image/png',
      size: { width: 72, height: 72 },
      id: 'medium',
    },
    {
      contentType: 'image/png',
      size: imageSize,
      id: 'large',
    },
  ]
}

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 164,
        background: 'black',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9999,
        color: 'white',
      }}
    >
      ct
    </div>, {...imageSize}
  )
}
