"use client";
import { useState } from 'react';
import Image from 'next/image';
import { X, MessageCircle } from 'lucide-react';

export type Product = {
    id: string;
    name: string;
    category: string;
    image: string;
};

export default function ProductCard({ product, priority = false }: { product: Product, priority?: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleWhatsApp = () => {
        // We assume the phone number is +33 6 XX XX XX XX or similar, here is a placeholder
        const phoneNumber = "33600000000";
        const message = `Bonjour, je souhaite commander l'article :\n\n*${product.name}*\nRéférence : ${product.id}\n\nPouvez-vous m'indiquer la disponibilité ?`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <div
                onClick={() => { setIsModalOpen(true); }}
                className="product-card"
            >
                <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f6f7f8' }}>
                    {!(priority || imageLoaded) && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'contain', opacity: (priority || imageLoaded) ? 1 : 0, transition: 'opacity 0.3s ease' }}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#888' }}>{product.id}</div>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4'
                    }}>
                        {product.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{product.category}</div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    className="modal-backdrop"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="modal-content"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="modal-close-btn"
                        >
                            <X size={24} color="#666" />
                        </button>
                        <div className="modal-image-wrapper">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>{product.id}</span>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '8px 0', lineHeight: 1.2 }}>{product.name}</h2>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Catégorie : {product.category}</p>
                        </div>
                        <button
                            onClick={handleWhatsApp}
                            className="whatsapp-btn"
                        >
                            <MessageCircle size={20} />
                            Commander sur WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
