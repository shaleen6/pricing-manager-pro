// src/hooks/useCsvUpload.ts - FIREBASE CSV SERVICE
import { useCallback, useState } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, addDoc, writeBatch, doc, serverTimestamp, 
  query, where, getDocs 
} from 'firebase/firestore';
import Papa from 'papaparse';

export interface PricingRecord {
  storeId: string;
  sku: string;
  productName: string;
  price: number;
  date: string;
  currency?: string;
  updatedBy?: string;
  notes?: string;
}

interface UploadResult {
  total: number;
  valid: number;
  invalid: number;
  uploaded: number;
  errors: string[];
}

export const useCsvUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const uploadCSV = useCallback(async (file: File, mode: 'append' | 'overwrite' = 'append') => {
    setUploading(true);
    
    try {      
      // Parse CSV
      const parsed = await new Promise<any[]>((resolve) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          }
        });
      });

      const validRecords: PricingRecord[] = [];
      parsed.slice(0, 3).forEach((row, i) => { // Test first 3 rows
        const record: PricingRecord = {
          storeId: row['Store ID']?.trim() || '',
          sku: row['SKU']?.trim() || '',
          productName: row['Product Name']?.trim() || '',
          price: parseFloat(row['Price']) || 0,
          date: row['Date']?.trim() || '',
          currency: 'USD',
          updatedBy: auth.currentUser?.uid || 'test-user'
        };
        
        validRecords.push(record);
      });

      // ✅ SIMPLE DIRECT UPLOAD - NO QUERIES
      const batch = writeBatch(db);
      const pricingRef = collection(db, 'pricing-records');
      
      validRecords.forEach((record, i) => {
        const docRef = doc(pricingRef);
        batch.set(docRef, {
          ...record,
          id: docRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();

      return {
        total: validRecords.length,
        valid: validRecords.length,
        uploaded: validRecords.length,
        errors: []
      };
    } catch (error) {
      console.error('💥 UPLOAD ERROR:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  // Append mode - skip existing records
  const handleAppendMode = async (records: PricingRecord[]) => {
    const batch = writeBatch(db);
    const pricingRef = collection(db, 'pricing-records');

    for (const record of records) {
      const q = query(
        pricingRef,
        where('storeId', '==', record.storeId),
        where('sku', '==', record.sku)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const newDoc = doc(pricingRef);
        batch.set(newDoc, {
          ...record,
          id: newDoc.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();
  };

  // Overwrite mode - update or create
  const handleOverwriteMode = async (records: PricingRecord[]) => {
    const batch = writeBatch(db);
    const pricingRef = collection(db, 'pricing-records');

    for (const record of records) {
      const q = query(
        pricingRef,
        where('storeId', '==', record.storeId),
        where('sku', '==', record.sku)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Create new
        const newDoc = doc(pricingRef);
        batch.set(newDoc, {
          ...record,
          id: newDoc.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing
        const existingDoc = snapshot.docs[0];
        batch.update(existingDoc.ref, {
          ...record,
          updatedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();
  };

  return {
    uploadCSV,
    uploading,
    result,
    resetResult: () => setResult(null)
  };
};

