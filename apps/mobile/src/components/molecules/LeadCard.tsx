import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LeadRecord, LeadStatus } from '../../types';
import { theme } from '../../theme';
import { StatusChip } from '../atoms/StatusChip';
import { TabularText } from '../atoms/TabularText';

export interface LeadCardProps {
  readonly lead: LeadRecord;
  readonly onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  readonly onCall: (phone: string) => void;
  readonly onWhatsApp: (phone: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onStatusChange,
  onCall,
  onWhatsApp,
}) => {
  return (
    <View style={styles.card} accessibilityRole="none">
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.customerCol}>
          <View style={styles.nameBadgeRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {lead.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.customerName}>{lead.customerName}</Text>
              <TabularText style={styles.phoneText}>{lead.phone}</TabularText>
            </View>
          </View>
        </View>

        <View style={styles.badgeCol}>
          <StatusChip
            label={lead.priority === 'HIGH' ? 'HIGH INTENT' : 'QUALIFIED'}
            variant={lead.priority === 'HIGH' ? 'success' : 'primary'}
          />
          <TabularText style={styles.timestamp}>{lead.timestamp}</TabularText>
        </View>
      </View>

      {/* Extracted Requirement Box */}
      <View style={styles.requirementBox}>
        <View style={styles.reqHeader}>
          <Text style={styles.reqLabel}>AI EXTRACTED REQUIREMENT</Text>
          <TabularText style={styles.budgetText}>{lead.budget}</TabularText>
        </View>
        <Text style={styles.reqContent}>{lead.requirement}</Text>
        <View style={styles.nextActionRow}>
          <Text style={styles.nextActionText}>Next: {lead.nextAction}</Text>
        </View>
      </View>

      {/* Delivery Telemetry */}
      <View style={styles.telemetryRow}>
        <View style={styles.greenDot} />
        <Text style={styles.telemetryText}>
          Delivered to WhatsApp in &lt; 3s • Verified
        </Text>
      </View>

      {/* Status Toggle Pills */}
      <View style={styles.statusToggleRow}>
        {(['NEW', 'CONTACTED', 'CONVERTED'] as const).map((st) => {
          const isActive = lead.status === st;
          return (
            <Pressable
              key={st}
              onPress={() => onStatusChange(lead.id, st)}
              style={[
                styles.statusPill,
                isActive && styles.statusPillActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Mark status as ${st}`}
            >
              <Text
                style={[
                  styles.statusPillText,
                  isActive && styles.statusPillTextActive,
                ]}
              >
                {st}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => onCall(lead.phone)}
          style={({ pressed }) => [
            styles.callBtn,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Call ${lead.customerName}`}
        >
          <Text style={styles.callBtnText}>Call Now</Text>
        </Pressable>

        <Pressable
          onPress={() => onWhatsApp(lead.phone)}
          style={({ pressed }) => [
            styles.whatsAppBtn,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Chat on WhatsApp with ${lead.customerName}`}
        >
          <Text style={styles.whatsAppBtnText}>Chat on WhatsApp</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  customerCol: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  phoneText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  badgeCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  requirementBox: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reqLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.success,
  },
  reqContent: {
    fontSize: 12,
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
  nextActionRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  nextActionText: {
    fontSize: 11,
    color: theme.colors.tertiary,
    fontWeight: '500',
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  telemetryText: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 6,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  statusPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.tertiary,
  },
  statusPillTextActive: {
    color: theme.colors.onPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 6,
  },
  callBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
  },
  callBtnText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  whatsAppBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
  },
  whatsAppBtnText: {
    color: theme.colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
});
