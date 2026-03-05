import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Sidebar({ categories, selected, onSelect }: { categories: string[], selected: string, onSelect: (c: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (c: string) => {
        onSelect(c);
        setIsOpen(false);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar-desktop">
                <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', color: '#666' }}>
                    Catégories
                </h2>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li>
                        <button
                            onClick={() => onSelect('Toutes')}
                            className="cat-btn cat-btn-desktop"
                            style={{
                                fontWeight: selected === 'Toutes' ? 700 : 400,
                                textDecoration: selected === 'Toutes' ? 'underline' : 'none'
                            }}
                        >
                            Toutes
                        </button>
                    </li>
                    {categories.map(c => (
                        <li key={c}>
                            <button
                                onClick={() => onSelect(c)}
                                className="cat-btn cat-btn-desktop"
                                style={{
                                    fontWeight: selected === c ? 700 : 400,
                                    textDecoration: selected === c ? 'underline' : 'none'
                                }}
                            >
                                {c}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Mobile Sidebar (Hamburger Menu) */}
            <div className="sidebar-mobile-toggle">
                <button
                    onClick={() => setIsOpen(true)}
                    className="hamburger-btn"
                >
                    <Menu size={20} />
                    <span>Catégories ({selected})</span>
                </button>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="mobile-drawer-backdrop" onClick={() => setIsOpen(false)}>
                    <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
                        <div className="mobile-drawer-header">
                            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Catégories</h2>
                            <button onClick={() => setIsOpen(false)} className="close-drawer-btn">
                                <X size={24} color="#666" />
                            </button>
                        </div>
                        <div className="mobile-drawer-content">
                            <button
                                onClick={() => handleSelect('Toutes')}
                                className={`drawer-cat-btn ${selected === 'Toutes' ? 'active' : ''}`}
                            >
                                Toutes
                            </button>
                            {categories.map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleSelect(c)}
                                    className={`drawer-cat-btn ${selected === c ? 'active' : ''}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
