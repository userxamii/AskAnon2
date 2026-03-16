import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, FONTS, RADIUS, shadow } from '../context/ThemeContext';

interface Props {
  icon:  string;
  value: string | number;
  label: string;
}

export default function StatCard({ icon, value, label }: Props) {
  const { colors } = useTheme();
  const S = shadow(colors.isDark);

  return (
    <View style={[styles.card, S.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[styles.icon, { color: colors.teal }]}>{icon}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, borderRadius: RADIUS.md,
    paddingVertical: 16, paddingHorizontal: 10,
    alignItems: 'center', marginHorizontal: 4,
    borderWidth: 1,
  },
  icon:  { fontSize: 22, marginBottom: 6 },
  value: { fontSize: 20, ...FONTS.heading, marginBottom: 2 },
  label: { fontSize: 12, ...FONTS.medium },
});