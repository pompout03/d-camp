"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Account {
  id: string;
  email: string;
  google_id: string;
  is_primary: boolean;
}

interface AccountContextType {
  accounts: Account[];
  activeAccountId: string | null;
  setActiveAccountId: (id: string) => void;
  loading: boolean;
  user: any | null;
  setUser: (user: any) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({
  children,
  initialAccounts = [],
  initialUser = null
}: {
  children: React.ReactNode,
  initialAccounts?: Account[],
  initialUser?: any
}) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(initialUser);

  useEffect(() => {
    // Sync accounts if they change (e.g. from layout fetch)
    if (initialAccounts.length > 0) {
      setAccounts(initialAccounts);
    }
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialAccounts, initialUser]);

  useEffect(() => {
    // Force selection of the primary or first available account to ensure single-account behavior
    if (accounts.length > 0) {
      const primary = accounts.find(a => a.is_primary) || accounts[0];
      if (primary) {
        setActiveAccountIdState(primary.id);
        localStorage.setItem("activeAccountId", primary.id);
      }
    }
    setLoading(false);
  }, [accounts]);

  const setActiveAccountId = (id: string) => {
    localStorage.setItem("activeAccountId", id);
    setActiveAccountIdState(id);
    // Reload to ensure all AI and data contexts are refreshed
    window.location.reload();
  };

  return (
    <AccountContext.Provider value={{
      accounts,
      activeAccountId,
      setActiveAccountId,
      loading,
      user,
      setUser
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
