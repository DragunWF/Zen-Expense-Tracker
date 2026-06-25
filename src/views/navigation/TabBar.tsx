import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Home, Receipt, PieChart, Settings } from "lucide-react-native";

export interface TabBarProps {
  state?: {
    routes: Array<{ key: string; name: string }>;
    index: number;
  };
  descriptors?: any;
  navigation?: {
    navigate: (options: { name: string; merge?: boolean }) => void;
    emit: (options: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
  };
  // Optional props for standalone/mock use (when routing isn't wired up)
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
}

export default function TabBar({
  state,
  descriptors,
  navigation,
  activeTab: customActiveTab,
  onTabChange,
}: TabBarProps) {
  // Local state fallback for standalone/prototyping mode
  const [localActiveTab, setLocalActiveTab] = useState<string>("Home");

  // Determine if component is driven by React Navigation
  const isNavigationMode = !!(state && navigation);

  // Get active tab name based on mode
  const activeTabName = isNavigationMode
    ? state.routes[state.index].name
    : customActiveTab || localActiveTab;

  // Hardcoded tabs configuration to match the specifications
  const tabs = [
    { name: "Home", icon: Home, label: "Home" },
    { name: "Ledger", icon: Receipt, label: "Ledger" },
    { name: "Stats", icon: PieChart, label: "Stats" },
    { name: "Settings", icon: Settings, label: "Settings" },
  ];

  const handleTabPress = (tabName: string, index: number) => {
    if (isNavigationMode) {
      const route = state.routes[index];
      const isFocused = state.index === index;

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate({ name: route.name, merge: true });
      }
    } else {
      if (onTabChange) {
        onTabChange(tabName);
      } else {
        setLocalActiveTab(tabName);
      }
    }
  };

  return (
    <View className="absolute bottom-6 left-4 right-4 bg-slate-950/95 border border-slate-900 rounded-full py-3 px-4 flex-row items-center justify-around shadow-2xl shadow-black/50">
      {tabs.map((tab, index) => {
        const isActive = activeTabName === tab.name;
        const IconComponent = tab.icon;

        // Colors strictly matching standard Tailwind and theme specifications
        const iconColor = isActive ? "#10b981" : "#94a3b8"; // text-emerald-500 vs text-slate-400
        const textStyle = isActive
          ? "text-emerald-500 font-semibold"
          : "text-slate-400 font-medium";

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => handleTabPress(tab.name, index)}
            activeOpacity={0.7}
            className="flex-1 items-center justify-center py-1.5"
            accessibilityRole="button"
            accessibilityState={isActive ? { selected: true } : {}}
            accessibilityLabel={`${tab.label} tab`}
          >
            <View className="items-center justify-center space-y-1">
              <IconComponent
                size={22}
                color={iconColor}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                className={`text-[10px] uppercase tracking-wider ${textStyle}`}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
