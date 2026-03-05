export default function Sidebar({ categories, selected, onSelect }: { categories: string[], selected: string, onSelect: (c: string) => void }) {
    return (
        <aside style={{ width: '250px', padding: '32px 24px', flexShrink: 0, borderRight: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', color: '#666' }}>
                Catégories
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>
                    <button
                        onClick={() => onSelect('Toutes')}
                        style={{
                            background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                            fontSize: '16px', display: 'block', width: '100%',
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
                            style={{
                                background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                                fontSize: '16px', display: 'block', width: '100%',
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
    );
}
