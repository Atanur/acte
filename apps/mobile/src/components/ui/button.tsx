import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  title: string;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: string }> = {
  primary: {
    container: { backgroundColor: "#f4f4f5" },
    text: "text-zinc-900",
  },
  secondary: {
    container: { backgroundColor: "#27272a", borderWidth: 1, borderColor: "#3f3f46" },
    text: "text-zinc-100",
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: "text-zinc-400",
  },
  danger: {
    container: { backgroundColor: "#dc2626" },
    text: "text-white",
  },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingHorizontal: 12, paddingVertical: 6 },
  md: { paddingHorizontal: 16, paddingVertical: 10 },
  lg: { paddingHorizontal: 24, paddingVertical: 14 },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  title,
  style,
  ...props
}: ButtonProps) {
  const variantStyle = variantStyles[variant];

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          opacity: disabled || loading ? 0.5 : 1,
        },
        variantStyle.container,
        sizeStyles[size],
        style,
      ]}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#18181b" : "#f4f4f5"}
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={`font-medium text-sm ${variantStyle.text}`}>{title}</Text>
    </TouchableOpacity>
  );
}
