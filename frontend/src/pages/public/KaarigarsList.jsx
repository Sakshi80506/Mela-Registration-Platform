import React, { useState, useEffect, useMemo } from 'react';
import { kaarigarService } from '../../services/kaarigarService';
import KaarigarCard from '../../components/cards/KaarigarCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import FilterBar from '../../components/common/FilterBar';

const KaarigarsList = () => {
  const [kaarigars, setKaarigars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('all');

  useEffect(() => {
    document.title = "Master Kaarigars | Kaarigar Expo";
    loadKaarigars();
  }, []);

  const loadKaarigars = async () => {
    try {
      setLoading(true);
      const data = await kaarigarService.getAllKaarigars();
      setKaarigars(data);
    } catch (err) {
      console.error('Error fetching kaarigars:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute craft types
  const craftOptions = useMemo(() => {
    const crafts = new Set();
    kaarigars.forEach(k => {
      if (k.craftType) crafts.add(k.craftType);
    });
    const opts = [{ label: 'All Crafts', value: 'all' }];
    Array.from(crafts).sort().forEach(c => {
      const count = kaarigars.filter(k => k.craftType === c).length;
      opts.push({ label: c, value: c, count });
    });
    return opts;
  }, [kaarigars]);

  // Filter kaarigars
  const filteredKaarigars = useMemo(() => {
    return kaarigars.filter(k => {
      const matchesSearch = searchQuery === '' ||
        k.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.craftType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCraft = selectedCraft === 'all' || k.craftType?.toLowerCase() === selectedCraft.toLowerCase();

      return matchesSearch && matchesCraft;
    });
  }, [kaarigars, searchQuery, selectedCraft]);

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Heritage Masters
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.25rem' }}>Meet India’s Talented Kaarigars</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '0.4rem', maxWidth: '650px' }}>
          Discover master weavers, terracotta sculptors, wood carvers, and brass inlay artisans preserving generational craftsmanship.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search kaarigars by name, craft, or city..."
        />

        {craftOptions.length > 1 && (
          <FilterBar
            options={craftOptions}
            activeValue={selectedCraft}
            onSelect={setSelectedCraft}
            label="Filter Craft:"
          />
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading artisans..." />
      ) : filteredKaarigars.length === 0 ? (
        <EmptyState
          title="No Kaarigars Found"
          message={searchQuery || selectedCraft !== 'all' ? "Try clearing your filters or search terms." : "No artisan profiles registered yet."}
          actionText={searchQuery || selectedCraft !== 'all' ? "Reset Filters" : null}
          onActionClick={() => { setSearchQuery(''); setSelectedCraft('all'); }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredKaarigars.map(k => (
            <KaarigarCard key={k.id} kaarigar={k} />
          ))}
        </div>
      )}
    </div>
  );
};

export default KaarigarsList;
