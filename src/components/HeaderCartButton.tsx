"use client";

import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import CartDrawer from './CartDrawer';

export default function HeaderCartButton() {
    const { totalItems, setIsCartOpen } = useCart();

    return (
        <>
            <button
                onClick={() => setIsCartOpen(true)}
                className="header-cart-btn"
                aria-label="Ouvrir le panier"
            >
                <div style={{ position: 'relative' }}>
                    <ShoppingCart size={24} color="var(--primary-foreground)" />
                    {totalItems > 0 && (
                        <span className="cart-badge">
                            {totalItems > 99 ? '99+' : totalItems}
                        </span>
                    )}
                </div>
                <span className="header-cart-text">Panier</span>
            </button>
            <CartDrawer />
        </>
    );
}
