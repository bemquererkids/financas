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
                    background: 'linear-gradient(180deg, #06402B 0%, #032A1C 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Approved MyWallet Logo Symbol (White) */}
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M14.5 5.5C14.5 5.5 13.5 2 9.5 3.5C9.5 3.5 8 11 8 11L5.5 11C4.11929 11 3 12.1193 3 13.5V14.5C3 15.8807 4.11929 17 5.5 17H6.08579L5.29289 17.7929C4.90237 18.1834 4.90237 18.8166 5.29289 19.2071L6.79289 20.7071C7.18342 21.0976 7.81658 21.0976 8.20711 20.7071L10 19H14L15.7929 20.7071C16.1834 21.0976 16.8166 21.0976 17.2071 20.7071L18.7071 19.2071C19.0976 18.8166 19.0976 18.1834 18.7071 17.7929L18 17.0858V14C18 13.7956 18.0266 13.5966 18.077 13.4079C19.2032 12.8251 20 11.5997 20 10.165V10.125C20.5959 10.0384 21.084 9.61053 21.2335 9.02705C21.7826 6.88414 19.4674 5.38541 18.2505 7.15243C17.6186 6.13677 16.6343 5.37893 15.4646 5.09334C15.1786 5.29653 14.8516 5.43283 14.5 5.5ZM7 13C7 12.4477 7.44772 12 8 12C8.55228 12 9 12.4477 9 13C9 13.5523 8.55228 14 8 14C7.44772 14 7 13.5523 7 13ZM11 7C10.4477 7 10 7.44772 10 8C10 8.55228 10.4477 9 11 9H15C15.5523 9 16 8.55228 16 8C16 7.44772 15.5523 7 15 7H11Z"
                        fill="white" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
