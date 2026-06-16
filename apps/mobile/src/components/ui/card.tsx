import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <View className={`w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
      {title && (
        <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
