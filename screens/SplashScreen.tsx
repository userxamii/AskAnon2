import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      {/* Glow */}
      <View style={styles.glowWrapper}>
        <View style={styles.glow} />
      </View>

      {/* Icon */}
      <View style={styles.iconBox}>
        <Feather name="eye" size={48} color="#fff" />
      </View>

      {/* Title */}
      <Text style={styles.title}>AskAnon</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Speak freely. Stay hidden.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 180, 160, 0.12)',
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#00b4a0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00b4a0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    color: '#00b4a0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
});