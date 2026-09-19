// frontend/hooks/useProducts.js
import { useState, useCallback } from 'react';
import {
  getProducts as fetchProductsAPI,
  getProduct as fetchProductAPI,
  getHomeProducts,
} from '../lib/api';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [product, setProduct] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    const { append = false, ...requestParams } = params;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsAPI(requestParams);
      const results = data.products || [];
      setProducts((current) => append ? [...current, ...results] : results);
      if (data.pagination) setPagination(data.pagination);

      if (requestParams.featured === true) setFeaturedProducts(results);
      if (requestParams.hotDeal === true) setHotDeals(results);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Could not load products.');
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductAPI(id);
      setProduct(data.product || data);
    } catch (err) {
      console.error(`Failed to fetch product ${id}:`, err);
      setError(`Could not load product details for ID ${id}.`);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHomeProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHomeProducts();
      setFeaturedProducts(data.featured || []);
      setHotDeals(data.hotDeals || []);
      setProducts(data.latest || []);
    } catch (err) {
      console.error('Failed to fetch home products:', err);
      setError(err.message || 'Could not load home products.');
      setFeaturedProducts([]);
      setHotDeals([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    pagination,
    featuredProducts,
    hotDeals,
    product,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    fetchHomeProducts,
    setProduct, // Allow manual setting if needed (e.g., for product detail page updates)
  };
};

export default useProducts;