"use client";

import { useCart } from './CartContext';

export default function FloatingWhatsApp() {
    const { isCartOpen } = useCart();

    if (isCartOpen) return null;

    return (
        <a
            href="https://wa.me/33600000000?text=Bonjour,%20j'ai%20une%20question%20sur%20le%20catalogue."
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                backgroundColor: 'var(--whatsapp)',
                color: 'white',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        </a>
    );
}
