import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import useProducts from '../hooks/useProducts';

const itemsPerPage = 12;

const inputClass =
  'w-full h-10 px-3 text-sm bg-white border border-surface-border rounded-xl text-ink focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-shadow';

function ShopPage() {
  const { products, loading, error, pagination, fetchProducts } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    brand: '',
    condition: '',
    storage: '',
    maxPrice: '',
    search: '',
    sortBy: 'createdAt_desc',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const params = {
      brand: filters.brand || undefined,
      condition: filters.condition || undefined,
      storage: filters.storage || undefined,
      maxPrice: filters.maxPrice || undefined,
      search: filters.search || undefined,
      sort: filters.sortBy,
      page: currentPage,
      limit: itemsPerPage,
      append: currentPage > 1,
    };
    fetchProducts(params);
  }, [filters, currentPage, fetchProducts]);

  useEffect(() => {
    if (products.length === 0 && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [products, currentPage]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const totalPages = pagination.pages || 1;
  const canLoadMore = currentPage < totalPages;

  return (
    <>
      <Head>
        <title>Shop phones — AlphaiStore</title>
        <meta
          name="description"
          content="Browse new, UK-used, and Ghana-used smartphones."
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tightish text-ink">
            Shop phones
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {products.length} {products.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="hidden md:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="relative flex-1 max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
                <input
                  type="text"
                  placeholder="Search phones…"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-surface-border text-ink-muted hover:bg-surface-muted"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className={`${inputClass} w-auto`}
                >
                  <option value="createdAt_desc">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating_desc">Top rated</option>
                  <option value="sold_desc">Best selling</option>
                </select>
              </div>
            </div>

            {showMobileFilters && (
              <div className="md:hidden mb-6">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}

            {loading && products.length === 0 && (
              <div className="products-grid">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-surface-border bg-white p-4"
                  >
                    <SkeletonLoader height="208px" className="mb-4 rounded-lg" />
                    <SkeletonLoader width="80%" height="16px" className="mb-2" />
                    <SkeletonLoader width="50%" height="20px" />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="text-center text-sm text-status-danger py-10">
                Error loading products: {error}
              </p>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-ink-muted">
                  No products match your criteria.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      brand: '',
                      condition: '',
                      storage: '',
                      maxPrice: '',
                      search: '',
                      sortBy: 'createdAt_desc',
                    })
                  }
                  className="mt-4 text-sm font-medium text-ink hover:text-ink/70"
                >
                  Clear filters
                </button>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="products-grid">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      priority={currentPage === 1 && index < 4}
                    />
                  ))}
                </div>

                {canLoadMore && (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => page + 1)}
                      disabled={loading}
                      className="inline-flex h-11 min-w-40 items-center justify-center rounded-xl border-2 border-black bg-white px-6 text-sm font-bold text-ink shadow-[2px_2px_0_#000] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                    >
                      {loading ? 'Loading…' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default ShopPage;