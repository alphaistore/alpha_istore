import React from 'react';
import { useRouter } from 'next/router';
import { useSettings } from '../hooks/useSettings';

const inputClass =
  'w-full h-10 px-3 text-sm bg-white border border-surface-border rounded-xl text-ink focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-shadow';

export default function FilterSidebar({ filters, onFilterChange }) {
  const router = useRouter();
  const { settings } = useSettings();

  const handleChange = (key, value) => {
    onFilterChange(key, value);
    const next = { ...router.query, [key]: value || undefined };
    router.replace({ pathname: router.pathname, query: next }, undefined, {
      shallow: true,
    });
  };

  const normalizeBrandOptions = (value) => {
    if (!Array.isArray(value) || value.length === 0) return [];

    return [...new Set(
     value
       .map((brand) => {
         if (!brand) return null;
         if (typeof brand === 'string') return brand.trim();
         if (brand && typeof brand === 'object') {
           const name = String(brand.name || '').trim();
           if (brand.enabled === false) return null;
           return name || null;
         }
         return null;
       })
       .filter(Boolean)
    )];
  };

  // Filter options - prefer uploaded custom brands, then the saved enabled brand list.
  const configuredBrands = [
    ...(Array.isArray(settings?.brands) ? settings.brands : []),
    ...(Array.isArray(settings?.filters?.brands) ? settings.filters.brands : []),
  ];
  const brandOptions = normalizeBrandOptions(configuredBrands).length > 0
    ? normalizeBrandOptions(configuredBrands)
    : ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Redmi', 'OnePlus', 'Huawei', 'Tecno', 'Infinix', 'Oppo', 'Vivo', 'Nokia', 'Anker', 'Oraimo', 'Sony', 'Lenovo', 'HP', 'Dell', 'Asus'];

  const conditionOptions = settings?.conditions?.filter(c => c.enabled)?.map(c => c.name) || 
    ['Brand New', 'UK Used', 'Ghana Used'];
  
  const storageOptions = settings?.storage?.filter(s => s.enabled)?.map(s => s.name) ||
    ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

  return (
    <aside className="w-full md:w-64 bg-white border border-surface-border rounded-2xl p-5 space-y-5">
      <h3 className="text-sm font-semibold tracking-tightish text-ink">
        Filters
      </h3>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-ink-subtle mb-1.5">
          Brand
        </label>
        <select
          value={filters.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          className={inputClass}
        >
          <option value="">All brands</option>
          {brandOptions.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-ink-subtle mb-1.5">
          Condition
        </label>
        <select
          value={filters.condition || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          className={inputClass}
        >
          <option value="">All conditions</option>
          {conditionOptions.map(condition => (
            <option key={condition} value={condition}>{condition}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-ink-subtle mb-1.5">
          Storage
        </label>
        <select
          value={filters.storage || ''}
          onChange={(e) => handleChange('storage', e.target.value)}
          className={inputClass}
        >
          <option value="">All storage</option>
          {storageOptions.map(storage => (
            <option key={storage} value={storage}>{storage}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-ink-subtle mb-1.5">
          Max price ({'₵'})
        </label>
        <input
          type="number"
          min="0"
          value={filters.maxPrice || ''}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
          placeholder="e.g. 5000"
          className={inputClass}
        />
      </div>
    </aside>
  );
}