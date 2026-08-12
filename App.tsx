import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screen imports
import AuthScreen from './app/screens/AuthScreen';
import OnboardingIdentityScreen from './app/screens/OnboardingIdentityScreen';
import OnboardingBeliefScreen from './app/screens/OnboardingBeliefScreen';
import HomeScreen from './app/screens/HomeScreen';
import CheckinScreen from './app/screens/CheckinScreen';
import ProgressScreen from './app/screens/ProgressScreen';
import PaywallScreen from './app/screens/PaywallScreen';

// Types for navigation
export type RootStackParamList = {
  Auth: undefined;
  OnboardingIdentity: undefined;
  OnboardingBelief: undefined;
  Home: undefined;
  Checkin: { dayNumber: number };
  Progress: undefined;
  Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0F172A',
          },
        }}
      >
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingIdentity"
          component={OnboardingIdentityScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingBelief"
          component={OnboardingBeliefScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="Checkin"
          component={CheckinScreen}
          options={{ title: 'Daily Check-in' }}
        />
        <Stack.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ title: 'Your Progress' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ title: 'Premium Upgrade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
