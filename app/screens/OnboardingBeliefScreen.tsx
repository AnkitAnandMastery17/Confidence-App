import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OnboardingBeliefScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Onboarding Belief Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
});
