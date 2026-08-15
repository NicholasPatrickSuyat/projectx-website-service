"use client";

import { createContext, useContext, type ReactNode } from "react";

type WebsiteMediaContextValue = {
  websiteId: string;
};

const WebsiteMediaContext = createContext<WebsiteMediaContextValue | null>(
  null,
);

export function WebsiteMediaProvider({
  websiteId,
  children,
}: {
  websiteId: string;
  children: ReactNode;
}) {
  return (
    <WebsiteMediaContext.Provider value={{ websiteId }}>
      {children}
    </WebsiteMediaContext.Provider>
  );
}

export function useWebsiteMediaContext() {
  return useContext(WebsiteMediaContext);
}
