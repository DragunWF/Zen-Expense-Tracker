import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Home, Receipt, PieChart, Settings } from "lucide-react-native";

export interface TabBarProps {
  state?: any;
  descriptors?: any;
  navigation?: any;
  // Optional props for standalone/mock use (when routing isn't wired up)
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
  onAddPress?: () => void;
}

export default function TabBar({
  state,
  descriptors,
  navigation,
  activeTab: customActiveTab,
  onTabChange,
  onAddPress,
}: TabBarProps) {
  // Local state fallback for standalone/prototyping mode
  const [localActiveTab, setLocalActiveTab] = useState<string>("Home");

  // Determine if component is driven by React Navigation
  const isNavigationMode = !!(state && navigation);

  // Get active tab name based on mode
  const activeTabName = isNavigationMode
    ? state.routes[state.index].name
    : customActiveTab || localActiveTab;

  // Split tabs symmetrically
  const leftTabs = [
    { name: "Home", icon: Home, label: "Home" },
    { name: "Ledger", icon: Receipt, label: "Ledger" },
  ];

  const rightTabs = [
    { name: "Stats", icon: PieChart, label: "Stats" },
    { name: "Settings", icon: Settings, label: "Settings" },
  ];

  // Check if center FAB should be disabled (active ONLY for Home and Ledger)
  const isFabDisabled =
    activeTabName === "Stats" || activeTabName === "Settings";

  const handleTabPress = (tabName: string) => {
    if (isNavigationMode) {
      const index = state.routes.findIndex((r: any) => r.name === tabName);
      if (index === -1) return;
      const route = state.routes[index];
      const isFocused = state.index === index;

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, { merge: true });
      }
    } else {
      if (onTabChange) {
        onTabChange(tabName);
      } else {
        setLocalActiveTab(tabName);
      }
    }
  };

  const renderTabButton = (tab: { name: string; icon: any; label: string }) => {
    const isActive = activeTabName === tab.name;
    const IconComponent = tab.icon;

    // Colors matching theme specifications
    const iconColor = isActive ? "#10b981" : "#94a3b8"; // text-emerald-500 vs text-slate-400
    const textStyle = isActive
      ? "text-emerald-500 font-semibold"
      : "text-slate-400 font-medium";

    return (
      <TouchableOpacity
        key={tab.name}
        onPress={() => handleTabPress(tab.name)}
        activeOpacity={0.7}
        className="items-center justify-center py-1 px-3 min-w-[64px]"
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
          <Text className={`text-[10px] uppercase tracking-wider ${textStyle}`}>
            {tab.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 w-full bg-transparent z-40 h-[110px]"
    >
      {/* Tab Bar Background & Row */}
      <View className="w-full rounded-t-3xl bg-slate-950 border-t border-slate-900 px-6 pt-3 pb-6 flex-row items-center justify-between shadow-2xl shadow-black/50">
        {/* Left side navigation items */}
        <View className="flex-1 flex-row justify-around">
          {leftTabs.map(renderTabButton)}
        </View>

        {/* Center placeholder to preserve space for the FAB */}
        <View className="w-14 h-14" />

        {/* Right side navigation items */}
        <View className="flex-1 flex-row justify-around">
          {rightTabs.map(renderTabButton)}
        </View>
      </View>

      {/* Center Floating Action Button (FAB) positioned absolutely */}
      <View
        pointerEvents="box-none"
        className="absolute bottom-18 left-1/2 -ml-7 z-50"
        style={{ left: "50%" }}
      >
        <TouchableOpacity
          onPress={onAddPress}
          disabled={isFabDisabled}
          activeOpacity={0.8}
          className={`h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-black/40 transition-all duration-300 ${
            isFabDisabled
              ? "bg-slate-800 border border-slate-700/50"
              : "bg-emerald-500 active:bg-emerald-600 border border-emerald-400/20"
          }`}
        >
          <Text
            className={`text-3xl font-light leading-none mt-[-2px] ${
              isFabDisabled ? "text-slate-500" : "text-slate-955"
            }`}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
