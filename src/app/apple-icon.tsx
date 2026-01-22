import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 180,
    height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'linear-gradient(135deg, #5EEAD4 0%, #34D399 100%)', // Brighter Teal/Emerald gradient
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Scaled Piggy Bank SVG */}
                <svg
                    width="108"
                    height="108"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#022c22" // Very dark teal/black
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2.5V5z" />
                    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                    <path d="M16 11h.01" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
