import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 20,
                    background: '#111827', // Gray 900
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981', // Emerald 500
                    borderRadius: '8px',
                    position: 'relative',
                }}
            >
                {/* Minimalist Wallet Representation with pure CSS/Divs since raw SVG path needs proper encoding or simple shapes */}
                <div style={{
                    width: '20px',
                    height: '16px',
                    backgroundColor: '#F1F5F9', // Slate 100 (Off-white)
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '2px',
                    border: '1.5px solid #F1F5F9'
                }}>
                    <div style={{
                        width: '6px',
                        height: '4px',
                        backgroundColor: '#10B981', // Green detail (Money/Card)
                        borderRadius: '1px'
                    }} />
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
