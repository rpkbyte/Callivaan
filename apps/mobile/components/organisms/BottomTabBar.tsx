import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TabName } from '../../types';
import { theme } from '../../theme';

export interface BottomTabBarProps {
  readonly currentTab: TabName;
  readonly onSelectTab: (tab: TabName) => void;
  readonly leadsBadgeCount?: number;
}

interface TabItem {
  id: TabName;
  label: string;
}

const TABS: readonly TabItem[] = [
  { id: 'calls', label: 'Calls' },
  { id: 'leads', label: 'Leads' },
  { id: 'telephony', label: 'Forwarding' },
  { id: 'agent', label: 'Agent' },
  { id: 'settings', label: 'Settings' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  leadsBadgeCount = 8,
}) => {
  return (
    <View style={styles.tabBar} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        const showBadge = tab.id === 'leads' && leadsBadgeCount > 0;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelectTab(tab.id)}
            style={styles.tabButton}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
          >
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.tabIconPlaceholder,
                  isActive && styles.tabIconActive,
                ]}
              >
                <View
                  style={[
                    styles.innerIndicator,
                    isActive && styles.innerIndicatorActive,
                  ]}
                />
              </View>

              {showBadge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{leadsBadgeCount}</Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingVertical: 8,
    paddingBottom: 16,
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabIconPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.xs,
    borderWidth: 1.5,
    borderColor: theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryFixed,
  },
  innerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: theme.colors.muted,
  },
  innerIndicatorActive: {
    backgroundColor: theme.colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.onPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
