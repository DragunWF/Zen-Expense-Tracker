import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useSettingsController } from "../../controllers/useSettingsController";
import DevBioCard from "../components/settings/DevBioCard";
import ControlGrid from "../components/settings/ControlGrid";

export default function SettingsScreen() {
  const {
    isBusy,
    lastSuccess,
    exportToFile,
    importFromFile,
    resetDatabase,
    openLinkedIn,
  } = useSettingsController();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Screen header */}
        <View className="px-5 pt-4 pb-5">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
            Settings Menu
          </Text>
          <Text className="text-slate-100 text-2xl font-bold mt-0.5">
            App Config
          </Text>
        </View>

        {/* 2×2 Control Grid */}
        <ControlGrid
          onExport={exportToFile}
          onImport={importFromFile}
          onLinkedIn={openLinkedIn}
          onReset={resetDatabase}
          isBusy={isBusy}
        />

        {/* Developer bio card */}
        <DevBioCard />

        {/* Global success banner */}
        {lastSuccess && (
          <View className="mx-5 mt-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3 items-center">
            <Text className="text-emerald-400 text-xs font-semibold">
              ✓ {lastSuccess}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
