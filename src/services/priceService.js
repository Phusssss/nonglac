import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchLatestPrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/prices`);
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching prices from API:', error);
    return [];
  }
};

export const refreshPrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/prices/refresh`, {
      method: 'POST'
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error refreshing prices:', error);
    throw error;
  }
};

export const updatePricesInFirestore = async () => {
  const prices = await fetchLatestPrices();
  
  if (prices.length > 0) {
    for (const price of prices) {
      await addDoc(collection(db, 'prices'), price);
    }
  }
  
  return prices;
};

export const getPricesFromFirestore = async () => {
  const q = query(
    collection(db, 'prices'),
    orderBy('updatedAt', 'desc'),
    limit(50)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};