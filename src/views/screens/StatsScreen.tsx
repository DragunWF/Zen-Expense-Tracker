import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center px-6">
      <View className="items-center max-w-sm">
        <Text className="text-emerald-400 text-4xl mb-4 font-bold">📈</Text>
        <Text className="text-slate-100 text-2xl font-bold mb-2">
          Stats & Analytics
        </Text>
        <Text className="text-slate-400 text-center leading-6">
          Visualizing expense distribution and cash flow trends with line and
          pie charts.
        </Text>
      </View>
    </SafeAreaView>
  );
}
