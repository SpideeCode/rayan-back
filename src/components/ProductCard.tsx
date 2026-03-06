"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ShoppingCart, Plus, Minus, Info } from 'lucide-react';
import { useCart } from './CartContext';

export type Product = {
    id: string;
    name: string;
    category: string;
    image: string;
};

export default function ProductCard({ product, priority = false }: { product: Product, priority?: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { items, addToCart, updateQuantity, removeFromCart, setIsCartOpen } = useCart();

    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Check if item is already in cart
    const cartItem = items.find(item => item.product.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        if (isQtyModalOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isQtyModalOpen]);

    const handleOpenQtyModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setInputValue(quantity > 0 ? quantity.toString() : "");
        setIsQtyModalOpen(true);
    };

    const handleConfirmQty = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const val = parseInt(inputValue, 10);
        if (!isNaN(val) && val > 0) {
            if (quantity === 0) {
                addToCart(product, val);
            } else {
                updateQuantity(product.id, val);
            }
        } else if (val === 0) {
            removeFromCart(product.id);
        }
        setIsQtyModalOpen(false);
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

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#888' }}>{product.id}</div>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4',
                        flex: 1,
                        marginBottom: '8px'
                    }}>
                        {product.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{product.category}</div>

                    <div className="add-to-cart-container">
                        {quantity === 0 ? (
                            <button className="add-cart-btn" onClick={handleOpenQtyModal}>
                                <ShoppingCart size={16} />
                                Ajouter
                            </button>
                        ) : (
                            <div className="in-cart-indicator" onClick={handleOpenQtyModal} style={{ cursor: 'pointer' }}>
                                <span className="in-cart-text">Dans le panier</span>
                                <div className="qty-selector" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                                    <span style={{ minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                                </div>
                            </div>
                        )}
                    </div>
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
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Catégorie : {product.category}</p>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            {quantity === 0 ? (
                                <button className="add-cart-btn" onClick={(e) => { setIsModalOpen(false); handleOpenQtyModal(e); }} style={{ padding: '16px', fontSize: '16px' }}>
                                    <ShoppingCart size={20} />
                                    Ajouter au panier
                                </button>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f5f5', padding: '12px', borderRadius: '8px', cursor: 'pointer' }} onClick={(e) => { setIsModalOpen(false); handleOpenQtyModal(e); }}>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Quantité dans le panier :</span>
                                    <div className="qty-selector" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '16px', minWidth: '24px', padding: '0 8px' }}>{quantity}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quantity Modal */}
            {isQtyModalOpen && (
                <div className="modal-backdrop" onClick={(e) => { e.stopPropagation(); setIsQtyModalOpen(false); }} style={{ zIndex: 1100 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', padding: '24px', alignItems: 'center' }}>
                        <button onClick={() => setIsQtyModalOpen(false)} className="modal-close-btn">
                            <X size={20} color="#666" />
                        </button>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Saisir la quantité</h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>
                            {product.name}
                        </p>

                        <input
                            ref={inputRef}
                            type="number"
                            min="0"
                            placeholder="Ex: 50"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmQty(); }}
                            style={{
                                padding: '16px',
                                fontSize: '20px',
                                textAlign: 'center',
                                marginBottom: '16px',
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                appearance: 'textfield',
                                outline: 'none'
                            }}
                        />

                        <button className="add-cart-btn" onClick={handleConfirmQty} style={{ padding: '16px', fontSize: '16px' }}>
                            Valider
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
