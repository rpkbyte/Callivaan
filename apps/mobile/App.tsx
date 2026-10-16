import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Alert,
  Linking,
} from 'react-native';
import { registerRootComponent } from 'expo';
import {
  TabName,
  CallRecord,
  LeadRecord,
  LeadStatus,
  AgentPersona,
} from './types';
import {
  initialCalls,
  initialLeads,
  carrierConfigs,
  defaultAgentPersona,
  virtualGatewayNumber,
} from './data/mockData';
import { theme } from './theme';
import { AppHeader } from './components/organisms/AppHeader';
import { BottomTabBar } from './components/organisms/BottomTabBar';
import { CallsScreen } from './screens/CallsScreen';
import { LeadsScreen } from './screens/LeadsScreen';
import { TelephonyScreen } from './screens/TelephonyScreen';
import { AgentScreen } from './screens/AgentScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CallDetailScreen } from './screens/CallDetailScreen';

export default function App(): React.JSX.Element {
  const [currentTab, setCurrentTab] = useState<TabName>('calls');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [calls] = useState<readonly CallRecord[]>(initialCalls);
  const [leads, setLeads] = useState<readonly LeadRecord[]>(initialLeads);
  const [agentPersona, setAgentPersona] = useState<AgentPersona>(defaultAgentPersona);
  const [isLive] = useState(true);

  // Call Handlers
  const handleSelectCall = (call: CallRecord) => {
    setSelectedCall(call);
  };

  const handleBackFromCallDetail = () => {
    setSelectedCall(null);
  };

  const handleCallback = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const telUrl = `tel:${cleanNumber}`;
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(telUrl);
        }
        Alert.alert(
          'Direct Handset Call',
          `Dialing customer ${phoneNumber} from primary SIM.`,
          [{ text: 'OK' }]
        );
      })
      .catch(() => {
        Alert.alert('Calling', phoneNumber);
      });
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}`;
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(waUrl);
        }
        Alert.alert(
          'WhatsApp Lead Dispatch',
          `Automated call summary & quotation dispatched to ${phoneNumber}.`,
          [{ text: 'OK' }]
        );
      })
      .catch(() => {
        Alert.alert('WhatsApp', phoneNumber);
      });
  };

  const handleLeadStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
    Alert.alert(
      'Status Updated',
      `Lead marked as ${newStatus}. Synced with WhatsApp bot CRM.`
    );
  };

  // Telephony & Agent Handlers
  const handleDialCarrierCode = (ussdCode: string) => {
    Alert.alert(
      'Carrier USSD Forwarding',
      `Execute ${ussdCode} on your mobile dialer to bind unanswered calls to Callivaan AI.`,
      [
        { text: 'Copy Code', onPress: () => handleCopyCode(ussdCode) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCopyCode = (code: string) => {
    Alert.alert('Copied to Clipboard', code);
  };

  const handleTestCall = () => {
    Alert.alert(
      'Test Call Sandbox',
      `Simulating test call to Virtual Gateway (${virtualGatewayNumber}). Check speaker audio for 320ms latency conversational loop.`,
      [{ text: 'Start Audio Loop' }]
    );
  };

  const handleSaveAgentPersona = (updatedPersona: AgentPersona) => {
    setAgentPersona(updatedPersona);
  };

  const handleUpgradePlan = () => {
    Alert.alert(
      'Upgrade Subscription',
      'Team Plan: 2,000 conversational minutes/mo, multi-agent concurrency, and custom CRM webhook triggers.\n\n₹4,999/mo via UPI AutoPay.',
      [{ text: 'Proceed to UPI Checkout' }, { text: 'Later', style: 'cancel' }]
    );
  };

  const handleChangeWhatsApp = () => {
    Alert.alert(
      'Designated WhatsApp Number',
      'Enter new owner phone number with country code (+91) to receive instant lead summaries and transcripts.',
      [{ text: 'Update' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {selectedCall ? (
        <CallDetailScreen
          call={selectedCall}
          onBack={handleBackFromCallDetail}
          onCallback={handleCallback}
          onWhatsApp={handleWhatsApp}
        />
      ) : (
        <View style={styles.appContainer}>
          {/* Top Header */}
          <AppHeader
            businessName={agentPersona.businessName}
            isLive={isLive}
            onTestCall={handleTestCall}
          />

          {/* Active Screen Tab */}
          <View style={styles.screenWrapper}>
            {currentTab === 'calls' && (
              <CallsScreen
                calls={calls}
                onSelectCall={handleSelectCall}
                onCallback={handleCallback}
              />
            )}
            {currentTab === 'leads' && (
              <LeadsScreen
                leads={leads}
                onStatusChange={handleLeadStatusChange}
                onCall={handleCallback}
                onWhatsApp={handleWhatsApp}
              />
            )}
            {currentTab === 'telephony' && (
              <TelephonyScreen
                gatewayNumber={virtualGatewayNumber}
                carrierConfigs={carrierConfigs}
                onDialCode={handleDialCarrierCode}
                onCopyCode={handleCopyCode}
                onTestCall={handleTestCall}
              />
            )}
            {currentTab === 'agent' && (
              <AgentScreen
                agentPersona={agentPersona}
                onSave={handleSaveAgentPersona}
                onTestCall={handleTestCall}
              />
            )}
            {currentTab === 'settings' && (
              <SettingsScreen
                onUpgradePlan={handleUpgradePlan}
                onChangeWhatsAppNumber={handleChangeWhatsApp}
              />
            )}
          </View>

          {/* Persistent Bottom Tab Bar */}
          <BottomTabBar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            leadsBadgeCount={leads.filter((l) => l.status === 'NEW').length}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDim,
  },
  screenWrapper: {
    flex: 1,
  },
});

registerRootComponent(App);

