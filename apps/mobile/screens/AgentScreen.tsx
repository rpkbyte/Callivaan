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
import { AgentPersona } from '../types';
import { theme } from '../theme';
import { TabularText } from '../components/atoms/TabularText';

export interface AgentScreenProps {
  readonly agentPersona: AgentPersona;
  readonly onSave: (updatedPersona: AgentPersona) => void;
  readonly onTestCall: () => void;
}

type ToneOption = 'respectful' | 'friendly' | 'efficient';
type LangOption = 'hinglish' | 'hindi' | 'english';

const TONES: readonly { readonly id: ToneOption; readonly title: string; readonly subtitle: string; readonly isDefault?: boolean }[] = [
  {
    id: 'respectful',
    title: 'Respectful (Namaste ji)',
    subtitle: 'Courteous & formal Indian hospitality',
    isDefault: true,
  },
  {
    id: 'friendly',
    title: 'Warm & Friendly',
    subtitle: 'Approachable everyday tone',
  },
  {
    id: 'efficient',
    title: 'Direct & Rapid',
    subtitle: 'Fast transactional triage',
  },
];

const LANGUAGES: readonly { readonly id: LangOption; readonly label: string }[] = [
  { id: 'hinglish', label: 'Hinglish Natural' },
  { id: 'hindi', label: 'Pure Hindi' },
  { id: 'english', label: 'Indian English' },
];

export const AgentScreen: React.FC<AgentScreenProps> = ({
  agentPersona,
  onSave,
  onTestCall,
}) => {
  const [tone, setTone] = useState<ToneOption>(agentPersona.tone);
  const [languageMode, setLanguageMode] = useState<LangOption>(agentPersona.languageMode);
  const [greeting, setGreeting] = useState(agentPersona.greeting);
  const [escalationNumber, setEscalationNumber] = useState(agentPersona.escalationNumber);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  const handleSave = () => {
    onSave({
      ...agentPersona,
      tone,
      languageMode,
      greeting,
      escalationNumber,
    });
    Alert.alert('Configuration Saved', 'Voice Agent persona and telephony greeting updated successfully.');
  };

  const handlePlaySample = () => {
    setIsPlayingSample(!isPlayingSample);
  };

  const handleAddFaq = () => {
    Alert.alert(
      'Add Service / FAQ',
      'Enter new service name and rate for the AI Knowledge Catalog:',
      [{ text: 'Close' }]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header with Save Action */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>Voice Agent Setup</Text>
          <Text style={styles.pageSubtitle}>{agentPersona.businessName}</Text>
        </View>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save agent configuration"
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </Pressable>
      </View>

      {/* 2. Voice Agent Status & Speech Persona Tone Card */}
      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <View style={styles.statusRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusLabel}>Voice Agent Status: Active &amp; Listening</Text>
          </View>
          <View style={styles.versionBadge}>
            <TabularText style={styles.versionText}>v1.4 Deployed</TabularText>
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Speech Persona Tone</Text>
          <Text style={styles.fieldSublabel}>
            Determines conversational cadence and politeness level
          </Text>
        </View>

        <View style={styles.tonesList}>
          {TONES.map((t) => {
            const isSelected = tone === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTone(t.id)}
                style={[
                  styles.toneItem,
                  isSelected && styles.toneItemActive,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={t.title}
              >
                <View style={styles.toneLeft}>
                  <View style={styles.toneTitleRow}>
                    <Text style={styles.toneTitle}>{t.title}</Text>
                    {t.isDefault ? (
                      <View style={styles.defaultPill}>
                        <Text style={styles.defaultText}>DEFAULT</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.toneSubtitle}>{t.subtitle}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleActive,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Language Segmentation */}
        <View style={styles.languageSection}>
          <Text style={styles.fieldLabel}>Spoken Language Flow</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map((l) => {
              const isSelected = languageMode === l.id;
              return (
                <Pressable
                  key={l.id}
                  onPress={() => setLanguageMode(l.id)}
                  style={[
                    styles.langPill,
                    isSelected && styles.langPillActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Language ${l.label}`}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      isSelected && styles.langPillTextActive,
                    ]}
                  >
                    {l.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* 3. Inbound Welcome Greeting Card */}
      <View style={styles.card}>
        <View style={styles.greetingHeader}>
          <Text style={styles.fieldLabel}>Spoken Greeting</Text>
          <TabularText style={styles.charCount}>
            {greeting.length} / 300 chars
          </TabularText>
        </View>
        <Text style={styles.fieldSublabel}>
          Played immediately following mandatory TRAI beep tone
        </Text>

        <TextInput
          value={greeting}
          onChangeText={setGreeting}
          maxLength={300}
          multiline
          numberOfLines={3}
          style={styles.greetingInput}
          placeholder="Enter agent spoken greeting..."
          placeholderTextColor={theme.colors.muted}
        />

        <View style={styles.greetingActionsRow}>
          <Pressable
            onPress={handlePlaySample}
            style={({ pressed }) => [
              styles.sampleBtn,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Listen to voice sample"
          >
            <Text style={styles.sampleBtnText}>
              {isPlayingSample ? 'Pause Voice Sample' : 'Listen to Voice Sample'}
            </Text>
          </Pressable>
          <View style={styles.traiTag}>
            <Text style={styles.traiTagText}>TRAI AI tag active</Text>
          </View>
        </View>
      </View>

      {/* 4. Operating Hours & Service Catalog Section */}
      <View style={styles.card}>
        <View style={styles.hoursHeader}>
          <Text style={styles.fieldLabel}>Operating Hours</Text>
          <Text style={styles.linkText}>Edit Timings</Text>
        </View>
        <View style={styles.hoursBox}>
          <TabularText style={styles.hoursText}>Mon - Sat: 9:00 AM to 8:00 PM</TabularText>
          <Text style={styles.hoursClosed}>Sun: Closed</Text>
        </View>

        <View style={styles.catalogSection}>
          <View style={styles.catalogHeader}>
            <Text style={styles.fieldLabel}>Knowledge Catalog</Text>
            <TabularText style={styles.catalogCount}>14 Services Loaded</TabularText>
          </View>

          <View style={styles.catalogChips}>
            <View style={styles.catalogChip}>
              <Text style={styles.catalogName}>General Car Service: </Text>
              <TabularText style={styles.catalogPrice}>₹1,999</TabularText>
            </View>
            <View style={styles.catalogChip}>
              <Text style={styles.catalogName}>Doorstep Pickup: </Text>
              <Text style={styles.catalogFree}>Free</Text>
            </View>
            <View style={styles.catalogChip}>
              <Text style={styles.catalogName}>AC Diagnostic: </Text>
              <TabularText style={styles.catalogPrice}>₹499</TabularText>
            </View>
          </View>

          <Pressable
            onPress={handleAddFaq}
            style={({ pressed }) => [
              styles.addFaqBtn,
              pressed && { opacity: 0.75 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add price or FAQ entry"
          >
            <Text style={styles.addFaqText}>+ Add Price / FAQ</Text>
          </Pressable>
        </View>
      </View>

      {/* 5. Human Escalation Transfer Fallback Card */}
      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Human Escalation Transfer Fallback</Text>
        <Text style={styles.fieldSublabel}>
          Auto-transfers when caller requests human staff or detects complex dispute
        </Text>

        <View style={styles.escalationInputBox}>
          <Text style={styles.escalationPrefix}>Desk:</Text>
          <TextInput
            value={escalationNumber}
            onChangeText={setEscalationNumber}
            keyboardType="phone-pad"
            style={styles.escalationInput}
            placeholder="+91..."
            placeholderTextColor={theme.colors.muted}
          />
        </View>
      </View>

      {/* 6. Test Call Sandbox Button */}
      <Pressable
        onPress={onTestCall}
        style={({ pressed }) => [
          styles.testSandboxBtn,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Simulate inbound test call"
      >
        <Text style={styles.testSandboxText}>Simulate Inbound Test Call</Text>
      </Pressable>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.onSurface,
  },
  pageSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radii.pill,
  },
  saveBtnText: {
    color: theme.colors.onPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.success,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  versionBadge: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  fieldSection: {
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  fieldSublabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  tonesList: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  toneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.sm,
  },
  toneItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 2,
  },
  toneLeft: {
    flex: 1,
  },
  toneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  defaultPill: {
    backgroundColor: theme.colors.primaryFixed,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: theme.radii.pill,
  },
  defaultText: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  toneSubtitle: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 2,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  languageSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: theme.spacing.sm,
  },
  langGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radii.md,
    padding: 3,
    marginTop: theme.spacing.xs,
    gap: 3,
  },
  langPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.sm,
  },
  langPillActive: {
    backgroundColor: theme.colors.primary,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
  },
  langPillTextActive: {
    color: theme.colors.onPrimary,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 10,
    color: theme.colors.muted,
  },
  greetingInput: {
    backgroundColor: theme.colors.surfaceDim,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.onSurface,
    lineHeight: 18,
    marginTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  greetingActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  sampleBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.md,
  },
  sampleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  traiTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.xs,
    backgroundColor: theme.colors.successContainer,
  },
  traiTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },
  hoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  hoursBox: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  hoursText: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  hoursClosed: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.error,
  },
  catalogSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: theme.spacing.sm,
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  catalogCount: {
    fontSize: 10,
    color: theme.colors.muted,
  },
  catalogChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  catalogChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
  },
  catalogName: {
    fontSize: 11,
    color: theme.colors.onSurface,
  },
  catalogPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  catalogFree: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
  addFaqBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  addFaqText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  escalationInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDim,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    marginTop: theme.spacing.sm,
  },
  escalationPrefix: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
    marginRight: 6,
  },
  escalationInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onSurface,
    padding: 0,
  },
  testSandboxBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
  testSandboxText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.onPrimary,
  },
});
