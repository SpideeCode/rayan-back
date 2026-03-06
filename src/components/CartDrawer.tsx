"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { CartItem } from './CartContext';

function CartItemRow({ item }: { item: CartItem }) {
    const { updateQuantity, removeFromCart } = useCart();
    const [inputValue, setInputValue] = useState(item.quantity.toString());

    // Sync input when global state changes from elsewhere
    useEffect(() => {
        setInputValue(item.quantity.toString());
    }, [item.quantity]);

    const handleBlur = () => {
        const val = parseInt(inputValue, 10);
        if (isNaN(val) || val <= 0) {
            setInputValue(item.quantity.toString()); // Revert if invalid without deleting immediately
        } else {
            updateQuantity(item.product.id, val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className="cart-item">
            <div className="cart-item-image">
                <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
            <div className="cart-item-details">
                <div className="cart-item-ref">{item.product.id}</div>
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-actions">
                    <div className="qty-selector">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                            <Minus size={14} />
                        </button>
                        <input
                            type="number"
                            min="1"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="cart-qty-input"
                        />
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                            <Plus size={14} />
                        </button>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="cart-remove-btn"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CartDrawer() {
    const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalItems } = useCart();

    const handleWhatsApp = () => {
        if (items.length === 0) return;

        const phoneNumber = "32488432633"; // Rayan Back phone number

        let message = `Bonjour, je souhaite commander les articles suivants :\n\n`;

        items.forEach(item => {
            message += `- *${item.product.name}*\n`;
            message += `  Ref : ${item.product.id}\n`;
            message += `  Quantite : ${item.quantity}\n\n`;
        });

        message += `Merci de m'indiquer la disponibilite.`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (!isCartOpen) return null;

    return (
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
            <div className="cart-drawer" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>Mon Panier ({totalItems})</h2>
                    <button onClick={() => setIsCartOpen(false)} className="cart-close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="cart-content">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <p>Votre panier est vide.</p>
                            <button onClick={() => setIsCartOpen(false)} className="cart-continue-btn">
                                Continuer les achats
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items-list">
                            {items.map(item => (
                                <CartItemRow key={item.product.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        <button onClick={handleWhatsApp} className="whatsapp-btn">
                            <MessageCircle size={20} />
                            Envoyer la commande sur WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
