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

        </>
    );
}
