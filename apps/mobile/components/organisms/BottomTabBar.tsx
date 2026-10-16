import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TabName } from '../../types';
import { theme } from '../../theme';
import { TabIcon } from '../atoms/TabIcons';

export interface BottomTabBarProps {
  readonly currentTab: TabName;
  readonly onSelectTab: (tab: TabName) => void;
  readonly leadsBadgeCount?: number;
}

interface TabItem {
  readonly id: TabName;
  readonly label: string;
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
        const iconColor = isActive ? theme.colors.primary : theme.colors.muted;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelectTab(tab.id)}
            style={({ pressed }) => [
              styles.tabButton,
              pressed && { opacity: 0.75 },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} tab`}
          >
            <View style={styles.iconContainer}>
              <TabIcon
                name={tab.id}
                color={iconColor}
                size={22}
                isActive={isActive}
              />

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

            {isActive ? <View style={styles.activeDot} /> : null}
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
    paddingTop: 8,
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
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
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
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
  },
});
