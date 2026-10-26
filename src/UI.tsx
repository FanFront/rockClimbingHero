import React from "react";
export const ReducedMotionContext = React.createContext(false);
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "./theme";
export type ActionTone =
  "primary" | "secondary" | "quiet" | "danger" | "choice";
export function Action({
  label,
  onPress,
  selected = false,
  disabled = false,
  tone = "secondary",
  compact = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  tone?: ActionTone;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.action,
        tone === "primary" && s.primary,
        tone === "quiet" && s.quiet,
        tone === "danger" && s.danger,
        tone === "choice" && s.choice,
        selected && s.selected,
        compact && { paddingHorizontal: 12 },
        pressed && !disabled && { opacity: 0.72 },
        disabled && { opacity: 0.42 },
      ]}
    >
      <Text
        style={[
          s.label,
          tone === "primary" && { color: C.bg },
          tone === "danger" && { color: C.danger },
          selected && { color: C.mint },
        ]}
      >
        {selected ? "✓  " : ""}
        {label}
      </Text>
    </Pressable>
  );
}
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={s.segment}>
      {options.map((o) => (
        <Pressable
          key={o.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: o.id === value }}
          aria-selected={o.id === value}
          onPress={() => onChange(o.id)}
          style={({ pressed }) => [
            s.segmentItem,
            o.id === value && s.segmentOn,
            pressed && { opacity: 0.72 },
          ]}
        >
          <Text style={[s.segmentLabel, o.id === value && { color: C.cream }]}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function PageHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.heading}>
      {eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    </View>
  );
}
export function SectionHeading({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <View style={{ gap: 4, marginTop: 8 }}>
      <Text accessibilityRole="header" style={s.sectionTitle}>
        {title}
      </Text>
      {note && <Text style={s.subtitle}>{note}</Text>}
    </View>
  );
}
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyMark}>
        <Text style={{ fontSize: 24, color: C.gold }}>＋</Text>
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={[s.subtitle, { textAlign: "center" }]}>{description}</Text>
    </View>
  );
}
export function SettingRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.setting,
        pressed && { backgroundColor: C.panel2 },
      ]}
    >
      <Text style={[s.label, { flex: 1, textAlign: "left" }]}>{label}</Text>
      <Text style={s.subtitle}>{value}</Text>
      <Text style={{ fontSize: 22, color: C.muted }}>›</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  action: {
    minHeight: 50,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel2,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { minHeight: 54, backgroundColor: C.gold, borderColor: C.gold },
  quiet: { backgroundColor: "transparent", borderColor: "transparent" },
  danger: { backgroundColor: "transparent", borderColor: "#754A42" },
  choice: { backgroundColor: C.panel, borderRadius: 10 },
  selected: { backgroundColor: "#244438", borderColor: C.mint },
  label: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: C.cream,
    textAlign: "center",
    flexShrink: 1,
  },
  segment: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    gap: 4,
    backgroundColor: C.shadow,
    borderRadius: 14,
  },
  segmentItem: {
    flex: 1,
    minWidth: 54,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentOn: { backgroundColor: C.panel2 },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: C.muted,
    textAlign: "center",
  },
  heading: { gap: 8, paddingTop: 8, paddingBottom: 8 },
  eyebrow: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    lineHeight: 18,
  },
  title: { fontSize: 30, lineHeight: 40, fontWeight: "700", color: C.cream },
  subtitle: { fontSize: 14, lineHeight: 22, color: C.muted },
  sectionTitle: {
    fontSize: 19,
    lineHeight: 28,
    fontWeight: "600",
    color: C.cream,
  },
  empty: {
    backgroundColor: C.panel,
    padding: 28,
    borderRadius: 16,
    gap: 10,
    alignItems: "center",
  },
  emptyMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.panel2,
    alignItems: "center",
    justifyContent: "center",
  },
  setting: {
    minHeight: 60,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
});
