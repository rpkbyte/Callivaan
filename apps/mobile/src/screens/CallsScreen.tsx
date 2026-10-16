import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { CallRecord, CallStatus } from '../types';
import { theme } from '../theme';
import { CallCard } from '../components/molecules/CallCard';
import { TabularText } from '../components/atoms/TabularText';

export interface CallsScreenProps {
  readonly calls: readonly CallRecord[];
  readonly onSelectCall: (call: CallRecord) => void;
  readonly onCallback: (phoneNumber: string) => void;
}

type FilterOption = 'ALL' | CallStatus;

const FILTER_ITEMS: readonly { readonly id: FilterOption; readonly label: string; readonly count: number }[] = [
  { id: 'ALL', label: 'All', count: 24 },
  { id: 'QUALIFIED', label: 'Qualified', count: 8 },
  { id: 'INQUIRY', label: 'Inquiry', count: 11 },
  { id: 'ESCALATED', label: 'Escalated', count: 3 },
  { id: 'MISSED', label: 'Missed', count: 2 },
];

export const CallsScreen: React.FC<CallsScreenProps> = ({
  calls,
  onSelectCall,
  onCallback,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalls = calls.filter((call) => {
    const matchesFilter =
      activeFilter === 'ALL' || call.status === activeFilter;
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.callerNumber.includes(searchQuery) ||
      call.intent.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Quick Summary Metrics Row (3-column Bento grid) */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Calls Today</Text>
          <View style={styles.metricValueRow}>
            <TabularText style={styles.metricValue}>24</TabularText>
            <TabularText style={styles.metricTrendSuccess}>+18%</TabularText>
          </View>
          <Text style={styles.metricSubtext}>vs avg weekday</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Talk Time</Text>
          <View style={styles.metricValueRow}>
            <TabularText style={styles.metricValue}>
              58<Text style={styles.metricUnit}>m</Text>
            </TabularText>
            <TabularText style={styles.metricTrendNeutral}>avg 2.4m</TabularText>
          </View>
          <Text style={styles.metricSubtext}>across all calls</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>New Leads</Text>
          <View style={styles.metricValueRow}>
            <TabularText style={[styles.metricValue, styles.metricValuePrimary]}>
              8
            </TabularText>
            <Text style={styles.metricTagPrimary}>High Qual</Text>
          </View>
          <Text style={styles.metricSubtext}>auto-qualified</Text>
        </View>
      </View>

      {/* 2. Search Bar Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search caller phone or name..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* 3. Filter Chips Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_ITEMS.map((item) => {
          const isActive = activeFilter === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setActiveFilter(item.id)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter by ${item.label}`}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {item.label} ({item.count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 4. Stream Header */}
      <View style={styles.streamHeader}>
        <Text style={styles.streamTitle}>Today's Inbound Stream</Text>
        <TabularText style={styles.streamMeta}>Auto-synced just now</TabularText>
      </View>

      {/* 5. Inbound Call Activity List */}
      {filteredCalls.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No matching calls found</Text>
          <Text style={styles.emptySubtext}>
            Try clearing the search query or changing the filter chip.
          </Text>
        </View>
      ) : (
        filteredCalls.map((call) => (
          <CallCard
            key={call.id}
            call={call}
            onPress={onSelectCall}
            onCallback={onCallback}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDim,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 96,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tertiary,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  metricValuePrimary: {
    color: theme.colors.primary,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.muted,
  },
  metricTrendSuccess: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },
  metricTrendNeutral: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.muted,
  },
  metricTagPrimary: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  metricSubtext: {
    fontSize: 9,
    color: theme.colors.muted,
  },
  searchContainer: {
    marginBottom: theme.spacing.sm,
  },
  searchBar: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 13,
    color: theme.colors.onSurface,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: theme.colors.onPrimary,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  streamTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  streamMeta: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  emptyState: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
