"use client";
import { useState } from 'react';
import Image from 'next/image';
import { X, MessageCircle } from 'lucide-react';

export type Product = {
    id: string;
    name: string;
    category: string;
    image: string;
    tags: string[];
};

export default function ProductCard({ product: initialProduct, priority = false }: { product: Product, priority?: boolean }) {
    const [product, setProduct] = useState(initialProduct);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [editId, setEditId] = useState(product.id);
    const [editName, setEditName] = useState(product.name);
    const [isSaving, setIsSaving] = useState(false);

    const handleWhatsApp = () => {
        // We assume the phone number is +33 6 XX XX XX XX or similar, here is a placeholder
        const phoneNumber = "33600000000";
        const message = `Bonjour, je souhaite commander l'article :\n\n*${product.name}*\nRéférence : ${product.id}\n\nPouvez-vous m'indiquer la disponibilité ?`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editId || !editName) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/update-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalId: product.id,
                    newId: editId,
                    newName: editName
                })
            });

            if (res.ok) {
                const data = await res.json();
                setProduct(data.product);
            } else {
                alert('Erreur lors de la sauvegarde');
            }
        } catch (err) {
            console.error(err);
            alert('Erreur réseau');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div
                onClick={() => { setIsModalOpen(true); }}
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    cursor: 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    overflow: 'hidden',
                    position: 'relative',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', backgroundColor: '#f6f7f8' }}>

                    {!imageLoaded && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'contain', opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                            value={editId}
                            onChange={e => setEditId(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ padding: '4px', fontSize: '12px', border: '1px solid #ccc' }}
                        />
                        <textarea
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ padding: '4px', fontSize: '14px', border: '1px solid #ccc', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || (editId === product.id && editName === product.name)}
                                style={{
                                    padding: '4px 12px',
                                    background: (editId !== product.id || editName !== product.name) ? '#0058a3' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: (editId !== product.id || editName !== product.name) && !isSaving ? 'pointer' : 'default'
                                }}
                            >
                                {isSaving ? 'Sauvegarde...' : '✓ Fix'}
                            </button>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {product.tags && product.tags.map((tag, i) => (
                                    <span key={i} style={{ fontSize: '11px', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '16px'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff', padding: '32px', maxWidth: '500px', width: '100%',
                            position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px'
                        }}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} color="#666" />
                        </button>
                        <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#f9f9f9' }}>
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>{product.id}</span>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0' }}>{product.name}</h2>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {product.tags && product.tags.map((tag, i) => (
                                    <span key={i} style={{ fontSize: '12px', background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleWhatsApp}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                backgroundColor: 'var(--whatsapp)', color: '#fff', border: 'none',
                                padding: '16px', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                                width: '100%'
                            }}
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
