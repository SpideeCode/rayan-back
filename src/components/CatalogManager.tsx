"use client";
import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import ProductCard, { Product } from './ProductCard';
import Sidebar from './Sidebar';
import { Search, Filter } from 'lucide-react';

export default function CatalogManager({ initialData }: { initialData: Product[] }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Toutes');
    const [visibleCount, setVisibleCount] = useState(20);
    const [sortBy, setSortBy] = useState('id-asc');

    // Derive categories
    const categories = useMemo(() => {
        const cats = new Set(initialData.map(d => d.category));
        return Array.from(cats).sort();
    }, [initialData]);

    // Fuse configuration (id highly weighted)
    const fuse = useMemo(() => new Fuse(initialData, {
        keys: [
            { name: 'id', weight: 2 },
            { name: 'name', weight: 1 }
        ],
        threshold: 0.2, // Stricter threshold to avoid garbage matches
        ignoreLocation: true, // Don't penalize words at the end of the name
    }), [initialData]);

    // Filter logic
    const filteredData = useMemo(() => {
        let result = initialData;

        // Search filter
        if (search.trim()) {
            const term = search.trim();
            // If the search looks exactly like part of an ID (e.g., '00-2711', '2501')
            if (/^[0-9-]+$/.test(term)) {
                const idMatches = initialData.filter(item => item.id.includes(term));
                if (idMatches.length > 0) {
                    result = idMatches;
                } else {
                    // Fallback to searching names / exact numbers inside names
                    result = fuse.search(term).map(r => r.item);
                }
            } else {
                result = fuse.search(term).map(r => r.item);
            }
        }

        // Category filter
        if (category !== 'Toutes') {
            result = result.filter(item => item.category === category);
        }

        // Copy array before sorting to avoid mutating read-only state
        result = [...result];

        // Sort logic
        result.sort((a, b) => {
            if (sortBy === 'name-asc') {
                return a.name.localeCompare(b.name, 'fr', { numeric: true });
            } else if (sortBy === 'name-desc') {
                return b.name.localeCompare(a.name, 'fr', { numeric: true });
            } else if (sortBy === 'id-asc') {
                return a.id.localeCompare(b.id, 'fr', { numeric: true });
            } else if (sortBy === 'id-desc') {
                return b.id.localeCompare(a.id, 'fr', { numeric: true });
            }
            return 0;
        });

        return result;
    }, [initialData, search, category, sortBy, fuse]);

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
        <div className="layout-container">
            <Sidebar categories={categories} selected={category} onSelect={setCategory} />

            <div className="catalog-main">
                {/* Search Bar and Filters */}
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <Search size={20} color="#999" className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher une référence ou un nom (ex: 00-2539)"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setVisibleCount(20); }}
                            className="search-input"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Sort and Category Filters */}
                    <div className="filter-row">
                        <div className="filter-select-wrapper">
                            <select
                                value={category}
                                onChange={(e) => { setCategory(e.target.value); setVisibleCount(20); }}
                                className="filter-select mobile-only"
                            >
                                <option value="Toutes">Toutes les catégories</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-select-wrapper">
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setVisibleCount(20); }}
                                className="filter-select"
                            >
                                <option value="id-asc">Référence (0 - 9)</option>
                                <option value="id-desc">Référence (9 - 0)</option>
                                <option value="name-asc">Nom (A - Z)</option>
                                <option value="name-desc">Nom (Z - A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid-container">
                    {visibleData.map((product, index) => (
                        <ProductCard key={product.id} product={product} priority={index < 12} />
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
