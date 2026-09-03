import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Minimal geometric mark placeholder (Logo)
export function GeometricLogoMark({ size = 20, color = theme.colors.primary, style }: IconProps) {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: (size * 0.4) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

// Clean line icon for Affirmations (Quotation / Document lines)
export function AffirmationIcon({ size = 18, color = theme.colors.primary }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'space-between', paddingVertical: 2 }}>
      <View style={{ width: size * 0.9, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: size * 0.6, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: size * 0.75, height: 2, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

// Clean line icon for Visualization (Eye / Reflection circle)
export function VisualizationIcon({ size = 18, color = theme.colors.primary }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size,
          height: size * 0.65,
          borderRadius: size * 0.35,
          borderWidth: 1.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

// Clean line icon for Challenge (Compass / Direction mark)
export function ChallengeIcon({ size = 18, color = theme.colors.primary }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 2,
            height: size * 0.5,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
}
