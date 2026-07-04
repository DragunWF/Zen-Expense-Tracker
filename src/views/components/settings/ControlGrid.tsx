import React from "react";
import { View, Text, Pressable } from "react-native";

interface ActionCardProps {
  emoji: string;
  label: string;
  status: string;
  onPress: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

function ActionCard({
  emoji,
  label,
  status,
  onPress,
  variant = "default",
  disabled = false,
}: ActionCardProps) {
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 aspect-square rounded-2xl p-4 justify-between items-start border ${
        isDanger
          ? "bg-rose-500/10 border-rose-500/30 active:bg-rose-500/20"
          : "bg-slate-800/60 border-slate-700/40 active:bg-slate-700/50"
      } ${disabled ? "opacity-50" : ""}`}
    >
      {/* Icon */}
      <Text className="text-2xl">{emoji}</Text>

      {/* Text */}
      <View className="mt-auto">
        <Text
          className={`text-sm font-bold ${
            isDanger ? "text-rose-400" : "text-slate-100"
          }`}
        >
          {label}
        </Text>
        <Text
          className={`text-[10px] font-medium mt-0.5 ${
            isDanger ? "text-rose-500/80" : "text-slate-500"
          }`}
        >
          {status}
        </Text>
      </View>
    </Pressable>
  );
}

interface ControlGridProps {
  onExport: () => void;
  onImport: () => void;
  onLinkedIn: () => void;
  onReset: () => void;
  isBusy: boolean;
}

export default function ControlGrid({
  onExport,
  onImport,
  onLinkedIn,
  onReset,
  isBusy,
}: ControlGridProps) {
  return (
    <View className="mx-5 mb-4">
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
        System Controls
      </Text>

      {/* Row 1 */}
      <View className="flex-row gap-3 mb-3">
        <ActionCard
          emoji="📤"
          label="Export Backup"
          status="Ready"
          onPress={onExport}
          disabled={isBusy}
        />
        <ActionCard
          emoji="📥"
          label="Restore Import"
          status="Paste JSON"
          onPress={onImport}
          disabled={isBusy}
        />
      </View>

      {/* Row 2 */}
      <View className="flex-row gap-3">
        <ActionCard
          emoji="💼"
          label="LinkedIn"
          status="Redirect"
          onPress={onLinkedIn}
        />
        <ActionCard
          emoji="⚠️"
          label="Reset Database"
          status="Danger"
          onPress={onReset}
          variant="danger"
          disabled={isBusy}
        />
      </View>
    </View>
  );
}
