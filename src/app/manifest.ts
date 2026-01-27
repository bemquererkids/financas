
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'MyWallet',
        short_name: 'MyWallet',
        description: 'Seu controle financeiro pessoal',
        start_url: '/',
        display: 'standalone',
        background_color: '#032A1C',
        theme_color: '#06402B',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon?id=favicon',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/icon?id=icon-192',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon?id=icon-512',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
