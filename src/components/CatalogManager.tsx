"use client";
import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import ProductCard, { Product } from './ProductCard';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';

export default function CatalogManager({ initialData }: { initialData: Product[] }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Toutes');
    const [visibleCount, setVisibleCount] = useState(20);

    // Derive categories
    const categories = useMemo(() => {
        const cats = new Set(initialData.map(d => d.category));
        return Array.from(cats).sort();
    }, [initialData]);

    // Fuse configuration (id highly weighted)
    const fuse = useMemo(() => new Fuse(initialData, {
        keys: [
            { name: 'id', weight: 2 },
            { name: 'name', weight: 1 },
            { name: 'tags', weight: 0.5 }
        ],
        threshold: 0.3,
    }), [initialData]);

    // Filter logic
    const filteredData = useMemo(() => {
        let result = initialData;

        // Search filter
        if (search.trim()) {
            result = fuse.search(search).map(r => r.item);
        }

        // Category filter
        if (category !== 'Toutes') {
            result = result.filter(item => item.category === category);
        }

        return result;
    }, [initialData, search, category, fuse]);

    const visibleData = filteredData.slice(0, visibleCount);

    // Implement Infinite Scroll or Load More heuristic (for simplicity, infinite scroll via scroll listener)
    useEffect(() => {
        const handleScroll = () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                if (visibleCount < filteredData.length) {
                    setVisibleCount(prev => prev + 20);
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [visibleCount, filteredData.length]);

    return (
        <div style={{ display: 'flex', minHeight: '100%' }}>
            {/* Sidebar - hidden on mobile, or toggleable ideally, but inline for simple desktop view */}
            <div className="sidebar-container" style={{ display: 'none' }}>
                {/* Responsive CSS can handle this later, for now we keep it visible on larger screens */}
            </div>
            <Sidebar categories={categories} selected={category} onSelect={setCategory} />

            <div style={{ flex: 1, padding: '32px' }}>
                {/* Search Bar */}
                <div style={{ marginBottom: '32px', position: 'relative', maxWidth: '600px' }}>
                    <Search size={20} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Rechercher une référence ou un nom (ex: 00-2539)"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setVisibleCount(20); }}
                        style={{
                            width: '100%',
                            padding: '16px 16px 16px 48px',
                            fontSize: '16px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--card-bg)',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* Product Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {visibleData.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredData.length === 0 && (
                    <div style={{ padding: '48px 0', textAlign: 'center', color: '#666' }}>
                        Aucun résultat trouvé pour "{search}".
                    </div>
                )}
            </div>
        </div>
    );
}
