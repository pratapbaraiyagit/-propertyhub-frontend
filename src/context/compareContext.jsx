// PropertyHub-Frontend/frontend/src/context/CompareContext.jsxAdd commentMore actions
import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

const COMPARE_STORAGE_KEY = 'propertyCompareList_v2'; // Changed key to avoid old data conflicts

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    const storedList = localStorage.getItem(COMPARE_STORAGE_KEY);
    // Ensure we always start with a max of 2 items from localStorage
    const initialList = storedList ? JSON.parse(storedList) : [];
    return initialList.slice(0, 2);
  });

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareList));
  }, [compareList]);

  // Returns: 'added_first', 'added_second', 'already_exists_first', 'already_exists_second', 'list_full'
  const addToCompare = (propertyId) => {
    if (compareList.includes(propertyId)) {
      return compareList.indexOf(propertyId) === 0 ? 'already_exists_first' : 'already_exists_second';
    }

    if (compareList.length === 0) {
      setCompareList([propertyId]);
      return 'added_first';
    } else if (compareList.length === 1) {
      setCompareList((prevList) => [...prevList, propertyId]);
      return 'added_second';
    }
    return 'list_full'; // Should ideally not be hit if UI controls it
  };

  const removeFromCompare = (propertyId) => {
    setCompareList((prevList) => prevList.filter((id) => id !== propertyId));
  };

  const isPropertyInCompare = (propertyId) => {
    return compareList.includes(propertyId);
  };

  // Clears the list, useful for starting a new comparison
  const clearCompare = () => {
    setCompareList([]);
  };

  const value = {
    compareList,
    addToCompare,
    removeFromCompare,
    isPropertyInCompare,
    clearCompare,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};