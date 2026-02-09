import { useState, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection, query, where, orderBy, getDocs, limit,
  startAt, endAt, QueryDocumentSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

export interface PricingRecord {
  id: string;
  storeId: string;
  sku: string;
  productName: string;
  price: number;
  date: string;
  currency?: string;
  updatedBy?: string;
  notes?: string;
}

export interface SearchFilters {
  storeId?: string;
  sku?: string;
  productName?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const usePricingRecords = () => {
  const [records, setRecords] = useState<PricingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const countryPrefixQuery = (country: string) => {
    const prefix = `${country.toUpperCase()}-`;
    const endPrefix = `${country.toUpperCase()}-\uf8ff`;
    
    return query(
      collection(db, 'pricing-records'),
      orderBy('storeId'),
      startAt(prefix),
      endAt(endPrefix)
    );
  };

  const fetchRecords = useCallback(async (pageSize = 20) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'pricing-records'),
        orderBy('updatedAt', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PricingRecord[];
      
      setRecords(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchRecords = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const queries = [
        query(collection(db, 'pricing-records'), where('storeId', '==', searchTerm), limit(20)),
        query(collection(db, 'pricing-records'), where('sku', '==', searchTerm), limit(20))
      ];

      const [storeResults, skuResults] = await Promise.all(
        queries.map(q => getDocs(q))
      );

      const allRecords = [
        ...storeResults.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...skuResults.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];

      const uniqueRecords = allRecords.filter((record, index, self) =>
        index === self.findIndex(r => r.id === record.id)
      ) as PricingRecord[];

      setRecords(uniqueRecords);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterRecords = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    try {
      let q = query(collection(db, 'pricing-records'), limit(50));

      if (filters.country) {
        q = countryPrefixQuery(filters.country);
      }

      if (filters.storeId) {
        q = query(q, where('storeId', '==', filters.storeId));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PricingRecord[];

      setRecords(data);
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProductName = useCallback(async (productName: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'pricing-records'), limit(100));
      const snapshot = await getDocs(q);
      
      const allRecords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PricingRecord[];

      const filtered = allRecords.filter(record =>
        record.productName.toLowerCase().includes(productName.toLowerCase())
      );

      setRecords(filtered);
    } catch (error) {
      console.error('Product search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecordById = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, 'pricing-records', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PricingRecord;
      }
      return null;
    } catch (error) {
      console.error('Get record error:', error);
      return null;
    }
  }, []);

  const updateRecord = useCallback(async (id: string, updatedData: Partial<PricingRecord>) => {
    try {
      const docRef = doc(db, 'pricing-records', id);
      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Update error:', error);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setRecords([]);
    fetchRecords(20); 
  }, [fetchRecords]);

  const refetch = useCallback(() => {
    fetchRecords(20); 
  }, [fetchRecords]);

  return {
    records,
    loading,
    fetchRecords,
    searchRecords,
    filterRecords,
    searchProductName,
    reset,
    getRecordById,  
    updateRecord,
    refetch
  };
};
