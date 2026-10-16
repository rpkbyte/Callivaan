import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { TabName } from '../../types';

export interface TabIconProps {
  readonly name: TabName;
  readonly color: string;
  readonly size?: number;
  readonly isActive?: boolean;
}

/**
 * 1. Calls Icon: Sleek Telephony Handset
 */
export const CallsIcon: React.FC<{ readonly color: string; readonly size?: number }> = ({
  color,
  size = 22,
}) => {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]} accessibilityRole="none">
      <View style={[styles.phoneHandset, { borderColor: color }]}>
        <View style={[styles.phoneEar, { backgroundColor: color }]} />
        <View style={[styles.phoneBody, { borderColor: color }]} />
        <View style={[styles.phoneMic, { backgroundColor: color }]} />
      </View>
    </View>
  );
};

/**
 * 2. Leads Icon: 3-column High-yield Pipeline Bento Chart
 */
export const LeadsIcon: React.FC<{ readonly color: string; readonly size?: number }> = ({
  color,
  size = 22,
}) => {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]} accessibilityRole="none">
      <View style={styles.chartContainer}>
        <View style={[styles.chartBar, { height: 7, backgroundColor: color }]} />
        <View style={[styles.chartBar, { height: 12, backgroundColor: color }]} />
        <View style={[styles.chartBar, { height: 17, backgroundColor: color }]} />
      </View>
      <View style={[styles.chartBaseline, { backgroundColor: color }]} />
    </View>
  );
};

/**
 * 3. Forwarding (Telephony) Icon: Handset with Routing Redirect Arrow
 */
export const ForwardingIcon: React.FC<{ readonly color: string; readonly size?: number }> = ({
  color,
  size = 22,
}) => {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]} accessibilityRole="none">
      {/* Handset base */}
      <View style={[styles.fwdHandset, { borderColor: color }]}>
        <View style={[styles.fwdEar, { backgroundColor: color }]} />
        <View style={[styles.fwdMic, { backgroundColor: color }]} />
      </View>
      {/* Curved Forward Arrow */}
      <View style={styles.fwdArrowBox}>
        <View style={[styles.fwdLine, { borderColor: color }]} />
        <View style={[styles.fwdArrowHead, { borderLeftColor: color }]} />
      </View>
    </View>
  );
};

/**
 * 4. Agent Icon: Callivaan 5-Bar Precision Voice Audio Soundwave
 */
export const AgentIcon: React.FC<{ readonly color: string; readonly size?: number }> = ({
  color,
  size = 22,
}) => {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]} accessibilityRole="none">
      <View style={styles.soundwaveBox}>
        <View style={[styles.waveBar, { height: 6, backgroundColor: color }]} />
        <View style={[styles.waveBar, { height: 13, backgroundColor: color }]} />
        <View style={[styles.waveBar, { height: 18, backgroundColor: color }]} />
        <View style={[styles.waveBar, { height: 11, backgroundColor: color }]} />
        <View style={[styles.waveBar, { height: 7, backgroundColor: color }]} />
      </View>
    </View>
  );
};

/**
 * 5. Settings Icon: Dual Precision Sliders / Toggles
 */
export const SettingsIcon: React.FC<{ readonly color: string; readonly size?: number }> = ({
  color,
  size = 22,
}) => {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]} accessibilityRole="none">
      {/* Track 1 */}
      <View style={styles.sliderRow}>
        <View style={[styles.sliderTrack, { backgroundColor: color }]} />
        <View style={[styles.sliderThumb, { borderColor: color, left: 4 }]} />
      </View>
      {/* Track 2 */}
      <View style={styles.sliderRow}>
        <View style={[styles.sliderTrack, { backgroundColor: color }]} />
        <View style={[styles.sliderThumb, { borderColor: color, left: 12 }]} />
      </View>
    </View>
  );
};

/**
 * Unified TabIcon Selector
 */
export const TabIcon: React.FC<TabIconProps> = ({
  name,
  color,
  size = 22,
}) => {
  switch (name) {
    case 'calls':
      return <CallsIcon color={color} size={size} />;
    case 'leads':
      return <LeadsIcon color={color} size={size} />;
    case 'telephony':
      return <ForwardingIcon color={color} size={size} />;
    case 'agent':
      return <AgentIcon color={color} size={size} />;
    case 'settings':
      return <SettingsIcon color={color} size={size} />;
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Calls Handset
  phoneHandset: {
    width: 17,
    height: 17,
    borderWidth: 2,
    borderRadius: 5,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneEar: {
    width: 9,
    height: 3,
    borderRadius: 1.5,
  },
  phoneBody: {
    width: 5,
    height: 5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
  },
  phoneMic: {
    width: 9,
    height: 3,
    borderRadius: 1.5,
  },
  // Leads Bento
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    width: 18,
    height: 17,
  },
  chartBar: {
    width: 3.5,
    borderRadius: 1.5,
  },
  chartBaseline: {
    width: 18,
    height: 1.5,
    borderRadius: 1,
    marginTop: 1,
  },
  // Forwarding Handset + Arrow
  fwdHandset: {
    position: 'absolute',
    left: 0,
    bottom: 1,
    width: 13,
    height: 13,
    borderWidth: 1.8,
    borderRadius: 3.5,
    transform: [{ rotate: '-35deg' }],
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fwdEar: {
    width: 6,
    height: 2,
    borderRadius: 1,
  },
  fwdMic: {
    width: 6,
    height: 2,
    borderRadius: 1,
  },
  fwdArrowBox: {
    position: 'absolute',
    right: 0,
    top: 1,
    width: 12,
    height: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fwdLine: {
    width: 7,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 3,
  },
  fwdArrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 4,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: -1,
    marginTop: -4,
  },
  // Agent Soundwave
  soundwaveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.2,
    width: 20,
    height: 20,
  },
  waveBar: {
    width: 2.2,
    borderRadius: 1.5,
  },
  // Settings Sliders
  sliderRow: {
    width: 18,
    height: 9,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    width: '100%',
    height: 2,
    borderRadius: 1,
  },
  sliderThumb: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.8,
  },
});
