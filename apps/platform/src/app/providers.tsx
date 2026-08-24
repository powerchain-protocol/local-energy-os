"use client";

import type { ReactNode } from "react";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { ThemeProvider } from "@/context/theme-context";
import { AppProvider } from "@/context/app-context";
import { AuthProvider } from "@/context/auth-context";
import { AccessProvider } from "@/context/access-context";
import { WalletProvider } from "@/components/provider/wallet-provider";
import { WalletConnectModal } from "@/components/wallet/wallet-connect-modal";
import { AIProvider } from "@/context/ai-provider";
import { PlatformStoreProvider } from "@/store/app-store";
import { PreferencesProvider } from "@/context/preferences-context";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <AccessProvider>
              <AppProvider>
                <PlatformStoreProvider>
                  <PreferencesProvider>
                    <AIProvider>
                      <WalletProvider>
                        {children}
                        <WalletConnectModal />
                      </WalletProvider>
                    </AIProvider>
                  </PreferencesProvider>
                </PlatformStoreProvider>
              </AppProvider>
            </AccessProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
      <CookieConsent />
    </ErrorBoundary>
  );
}
