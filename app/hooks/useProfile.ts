import { useState, useEffect } from 'react';

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Profile loading logic placeholder
    setLoading(false);
  }, []);

  return { profile, loading };
}
