import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';

export interface StatCardProps {
  featherName: React.ComponentProps<typeof Feather>['name'];
  value: string | number;
  label: string;
}

export default function StatCard({ featherName, value, label }: StatCardProps) {
  const { colors } = useTheme();
  const S = shadow(colors.isDark);

  return (
    <View style={[styles.card, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Feather name={featherName} size={22} color={colors.teal} style={styles.icon} />
      <Text style={[styles.value, { color: colors.textPrimary }]}>{String(value)}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: RADIUS.md, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  icon:  { marginBottom: 6 },
  value: { fontSize: 20, ...FONTS.heading, marginBottom: 2 },
  label: { fontSize: 12, ...FONTS.medium },
});