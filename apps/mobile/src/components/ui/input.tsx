import { forwardRef } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className = "", style, ...props }, ref) => {
    return (
      <View className="flex flex-col gap-1.5">
        {label && <Text className="text-sm font-medium text-zinc-300">{label}</Text>}
        <TextInput
          ref={ref}
          placeholderTextColor="#71717a"
          className={`rounded-lg border bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 ${
            error ? "border-red-500" : "border-zinc-700"
          } ${className}`}
          style={style}
          {...props}
        />
        {error && (
          <Text className="text-xs text-red-400" role="alert">
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
