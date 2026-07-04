import React from "react";
import { View, Text } from "react-native";

export default function DevBioCard() {
  return (
    <View className="mx-5 mb-4 rounded-2xl border border-emerald-500/30 bg-slate-800/60 overflow-hidden">
      {/* Emerald top accent line */}
      <View className="h-0.5 bg-emerald-500/60 w-full" />

      <View className="px-4 pt-4 pb-4">
        {/* Badge + version row */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
            <Text className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
              Developer
            </Text>
          </View>
          <Text className="text-slate-500 text-[10px]">v1.0.0</Text>
        </View>

        {/* Developer Info */}
        <Text className="text-slate-100 text-lg font-bold tracking-wide mb-0.5">
          Marc Plarisan
        </Text>
        <Text className="text-slate-400 text-xs font-semibold">
          Software Engineer
        </Text>
      </View>
    </View>
  );
}
