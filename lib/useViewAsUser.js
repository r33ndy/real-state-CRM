'use client';
import { useState, useEffect } from 'react';

/**
 * Hook for admin view-as-user feature.
 * Returns the current viewAsUserId from localStorage and
 * listens for changes from the sidebar selector.
 */
export function useViewAsUser() {
  const [viewAsUserId, setViewAsUserId] = useState('');

  useEffect(() => {
    // Read initial value
    const saved = localStorage.getItem('viewAsUserId');
    if (saved) setViewAsUserId(saved);

    // Listen for changes from the sidebar
    function handleChange(e) {
      setViewAsUserId(e.detail.userId || '');
    }
    window.addEventListener('viewAsChanged', handleChange);
    return () => window.removeEventListener('viewAsChanged', handleChange);
  }, []);

  return viewAsUserId;
}

/**
 * Build URL with optional user_id query param for admin filtering.
 */
export function buildApiUrl(base, userRole, viewAsUserId) {
  if (userRole === 'admin' && viewAsUserId) {
    return `${base}?user_id=${viewAsUserId}`;
  }
  return base;
}
