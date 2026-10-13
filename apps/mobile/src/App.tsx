/**
 * Main Mobile Application Container
 * Light mode, cobalt & white, zero emojis.
 * Built with React Native primitives (SafeAreaView, View, Text, Pressable, StyleSheet).
 */
import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet } from './primitives.js';
import { mobileColors, mobileSpacing } from './theme/tokens.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { OverviewScreen } from './screens/OverviewScreen.js';

export const MobileApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'agent' | 'whatsapp' | 'usage'>('overview');
  const [selectedCall, setSelectedCall] = useState<any>(null);

  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={(u, t) => {
          setUser(u);
          setTenant(t);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Mobile App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.tenantTitle}>{tenant?.name || 'Callivaan'}</Text>
          <Text style={styles.appSubtitle}>AI Call Assistant</Text>
        </View>

        <Pressable onPress={() => setUser(null)} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && (
          <OverviewScreen
            onNavigateTab={(t) => setActiveTab(t as any)}
            onSelectCall={(c) => setSelectedCall(c)}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'calls', label: 'Calls' },
          { id: 'agent', label: 'Agent' },
          { id: 'whatsapp', label: 'WhatsApp' },
          { id: 'usage', label: 'Usage' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mobileColors.white,
    minHeight: '100vh',
  },
  appBar: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: mobileColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: mobileSpacing.md,
    backgroundColor: mobileColors.white,
  },
  tenantTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: mobileColors.textPrimary,
  },
  appSubtitle: {
    fontSize: 11,
    color: mobileColors.textSecondary,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: mobileColors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  signOutText: {
    fontSize: 12,
    color: mobileColors.textSecondary,
  },
  content: {
    flex: 1,
    paddingBottom: 60,
  },
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    borderTopWidth: 1,
    borderTopColor: mobileColors.border,
    backgroundColor: mobileColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
  },
  tabLabelActive: {
    color: mobileColors.cobalt,
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: mobileColors.textSecondary,
    fontWeight: '500',
  },
});
