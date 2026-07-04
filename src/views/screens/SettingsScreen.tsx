import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useSettingsController } from "../../controllers/useSettingsController";
import DevBioCard from "../components/settings/DevBioCard";
import ControlGrid from "../components/settings/ControlGrid";
import ExportModal from "../components/settings/ExportModal";
import ImportModal from "../components/settings/ImportModal";

export default function SettingsScreen() {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isStatsExpanded,
    setIsStatsExpanded,
    isBusy,
    lastError,
    setLastError,
    lastSuccess,
    dbStats,
    exportJson,
    buildExport,
    copyToClipboard,
    importFromJson,
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
            Configuration
          </Text>
          <Text className="text-slate-100 text-2xl font-bold mt-0.5">
            System Config
          </Text>
        </View>

        {/* 2×2 Control Grid */}
        <ControlGrid
          onExport={buildExport}
          onImport={() => setIsImportModalOpen(true)}
          onLinkedIn={openLinkedIn}
          onReset={resetDatabase}
          isBusy={isBusy}
        />

        {/* Developer bio card */}
        <DevBioCard
          isExpanded={isStatsExpanded}
          onToggle={() => setIsStatsExpanded((p) => !p)}
          dbStats={dbStats}
        />

        {/* Global success banner */}
        {lastSuccess && (
          <View className="mx-5 mt-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3 items-center">
            <Text className="text-emerald-400 text-xs font-semibold">
              ✓ {lastSuccess}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Export modal */}
      <ExportModal
        visible={isExportModalOpen}
        exportJson={exportJson}
        onCopy={copyToClipboard}
        onClose={() => setIsExportModalOpen(false)}
        lastSuccess={lastSuccess}
      />

      {/* Import modal */}
      <ImportModal
        visible={isImportModalOpen}
        isBusy={isBusy}
        lastError={lastError}
        onClearError={() => setLastError(null)}
        onImport={importFromJson}
        onClose={() => setIsImportModalOpen(false)}
      />
    </SafeAreaView>
  );
}
