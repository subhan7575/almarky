
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { products as staticProducts } from '../data/products';
import { getSecureToken, getSecureRepo, getCloudinaryDefaults } from '../utils/security';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  isSyncing: boolean;
  syncStatus: string;
  addProduct: (product: Product, files: FileList | null) => Promise<{ success: boolean, error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>, files: FileList | null) => Promise<{ success: boolean, error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean, error?: string }>;
  toggleStock: (id: string) => Promise<{ success: boolean, error?: string }>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helper: Base64 encoding for GitHub API
const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
const fromBase64 = (str: string) => decodeURIComponent(escape(atob(str)));

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  
  const GH_TOKEN = getSecureToken();
  const GH_REPO = getSecureRepo();
  const CLD_DEFAULTS = getCloudinaryDefaults();
  const GITHUB_API_URL = `https://api.github.com/repos/${GH_REPO}/contents/data/products.json`;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${GITHUB_API_URL}?t=${Date.now()}`, {
        headers: { 'Authorization': `token ${GH_TOKEN}`, 'Accept': 'application/vnd.github.v3.raw' },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        localStorage.setItem('almarky_inventory', JSON.stringify(data));
      } else {
        throw new Error("GitHub inventory sync failed.");
      }
    } catch (error) {
      console.warn("Sync failed, using local vault:", error);
      const saved = localStorage.getItem('almarky_inventory');
      setProducts(saved ? JSON.parse(saved) : staticProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const uploadToCloudinary = async (file: File) => {
    const url = `https://api.cloudinary.com/v1_1/${CLD_DEFAULTS.cloudName}/image/upload`;
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLD_DEFAULTS.uploadPreset);
    const response = await fetch(url, { method: 'POST', body: data });
    if (!response.ok) throw new Error("Cloudinary Asset Optimization Failed");
    const resData = await response.json();
    return resData.secure_url;
  };

  const commitToGitHub = async (updatedData: Product[], message: string) => {
    const getRes = await fetch(GITHUB_API_URL, { headers: { 'Authorization': `token ${GH_TOKEN}` } });
    const fileInfo = await getRes.json();
    const sha = getRes.ok ? fileInfo.sha : undefined;

    const pushRes = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: { 'Authorization': `token ${GH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content: toBase64(JSON.stringify(updatedData, null, 2)),
        sha
      })
    });
    if (!pushRes.ok) throw new Error("GitHub Repository Sync Failed");
  };

  const handleSync = async (operation: (currentProducts: Product[]) => Product[], message: string) => {
    setIsSyncing(true);
    setSyncStatus('Executing secure deployment...');
    try {
      const updatedProducts = operation(products);
      setSyncStatus('Committing to global inventory...');
      await commitToGitHub(updatedProducts, message);
      setSyncStatus('Refreshing local cache...');
      await loadProducts();
      setSyncStatus('Deployment successful!');
      return { success: true };
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Deployment failed: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  const addProduct = async (productData: Product, files: FileList | null) => {
    setIsSyncing(true);
    try {
      setSyncStatus('Optimizing media assets...');
      const finalImageUrls = [...(productData.images || [])];
      if (files) {
        for (const file of Array.from(files)) {
          finalImageUrls.push(await uploadToCloudinary(file));
        }
      }
      const newProduct = { ...productData, images: finalImageUrls };
      return await handleSync(
        (current) => [newProduct, ...current], 
        `feat: Add new product "${newProduct.name}"`
      );
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Deployment failed: ${err.message}`);
      setIsSyncing(false);
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>, files: FileList | null) => {
     setIsSyncing(true);
    try {
      setSyncStatus('Optimizing media assets...');
      const finalImageUrls = [...(updates.images || [])];
      if (files) {
        for (const file of Array.from(files)) {
          finalImageUrls.push(await uploadToCloudinary(file));
        }
      }
      const finalUpdates = { ...updates, images: finalImageUrls };
      return await handleSync(
        (current) => current.map(p => p.id === id ? { ...p, ...finalUpdates } : p),
        `fix: Update product ID ${id}`
      );
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Deployment failed: ${err.message}`);
      setIsSyncing(false);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = (id: string) => handleSync(
    (current) => current.filter(p => p.id !== id),
    `refactor: Remove product ID ${id}`
  );

  const toggleStock = (id: string) => handleSync(
    (current) => current.map(p => p.id === id ? { ...p, stock: !p.stock } : p),
    `refactor: Toggle stock for product ID ${id}`
  );

  return (
    <ProductContext.Provider value={{ 
      products, loading, addProduct, updateProduct, deleteProduct, toggleStock,
      refreshProducts: loadProducts, isSyncing, syncStatus
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within a ProductProvider");
  return context;
};
