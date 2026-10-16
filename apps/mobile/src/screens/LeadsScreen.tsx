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
import { LeadRecord, LeadStatus } from '../types';
import { theme } from '../theme';
import { LeadCard } from '../components/molecules/LeadCard';
import { TabularText } from '../components/atoms/TabularText';

export interface LeadsScreenProps {
  readonly leads: readonly LeadRecord[];
  readonly onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  readonly onCall: (phone: string) => void;
  readonly onWhatsApp: (phone: string) => void;
}

type LeadFilterTab = 'ALL' | 'HIGH_INTENT' | 'PENDING' | 'CONVERTED';

const FILTER_TABS: readonly { readonly id: LeadFilterTab; readonly label: string; readonly count: number }[] = [
  { id: 'ALL', label: 'All Leads', count: 8 },
  { id: 'HIGH_INTENT', label: 'High Intent', count: 4 },
  { id: 'PENDING', label: 'Pending Callback', count: 3 },
  { id: 'CONVERTED', label: 'Converted', count: 1 },
];

export const LeadsScreen: React.FC<LeadsScreenProps> = ({
  leads,
  onStatusChange,
  onCall,
  onWhatsApp,
}) => {
  const [activeTab, setActiveTab] = useState<LeadFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportCsv = () => {
    Alert.alert(
      'Export Lead Pipeline',
      'Leads dataset exported to CSV (UTF-8 format with phone numbers, timestamps, and AI transcripts).',
      [{ text: 'OK' }]
    );
  };

  const filteredLeads = leads.filter((lead) => {
    let matchesTab = true;
    if (activeTab === 'HIGH_INTENT') {
      matchesTab = lead.priority === 'HIGH';
    } else if (activeTab === 'PENDING') {
      matchesTab = lead.status === 'NEW' || lead.status === 'CONTACTED';
    } else if (activeTab === 'CONVERTED') {
      matchesTab = lead.status === 'CONVERTED';
    }

    const matchesSearch =
      searchQuery.trim().length === 0 ||
      lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.requirement.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Search & CSV Export Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customer name, requirement, or phone..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <Pressable
          onPress={handleExportCsv}
          style={({ pressed }) => [
            styles.exportBtn,
            pressed && { opacity: 0.75 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Export leads to CSV"
        >
          <Text style={styles.exportBtnText}>CSV</Text>
        </Pressable>
      </View>

      {/* 2. KPI Metrics Bento Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Hot Leads Today</Text>
          <View style={styles.kpiValueRow}>
            <TabularText style={styles.kpiValue}>8</TabularText>
            <TabularText style={styles.kpiTrendSuccess}>+3</TabularText>
          </View>
          <Text style={styles.kpiSubtext}>vs yesterday</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Est. Pipeline</Text>
          <View style={styles.kpiValueRow}>
            <TabularText style={styles.kpiValue}>₹4.2L</TabularText>
          </View>
          <Text style={styles.kpiTagPrimary}>High Intent</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>WhatsApp Sync</Text>
          <View style={styles.kpiValueRow}>
            <TabularText style={[styles.kpiValue, styles.kpiValuePrimary]}>
              100%
            </TabularText>
          </View>
          <View style={styles.syncRow}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>&lt;3s latency</Text>
          </View>
        </View>
      </View>

      {/* 3. Pipeline Horizontal Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsRow}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabChip,
                isActive && styles.tabChipActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filter by ${tab.label}`}
            >
              <Text
                style={[
                  styles.tabChipText,
                  isActive && styles.tabChipTextActive,
                ]}
              >
                {tab.label} ({tab.count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 4. Stream of Leads */}
      <View style={styles.leadStreamHeader}>
        <Text style={styles.leadStreamTitle}>Lead Dispatch Stream</Text>
        <TabularText style={styles.leadStreamCount}>
          {filteredLeads.length} leads
        </TabularText>
      </View>

      {filteredLeads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No matching leads found</Text>
          <Text style={styles.emptySubtext}>
            Try clearing the search query or selecting a different tab.
          </Text>
        </View>
      ) : (
        filteredLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onStatusChange={onStatusChange}
            onCall={onCall}
            onWhatsApp={onWhatsApp}
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
  searchRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  searchBar: {
    flex: 1,
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
  exportBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.tertiary,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.tertiary,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  kpiValuePrimary: {
    color: theme.colors.primary,
  },
  kpiTrendSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  kpiTagPrimary: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  kpiSubtext: {
    fontSize: 9,
    color: theme.colors.muted,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.success,
  },
  syncText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.success,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },
  tabChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  tabChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  tabChipTextActive: {
    color: theme.colors.onPrimary,
  },
  leadStreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  leadStreamTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  leadStreamCount: {
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
