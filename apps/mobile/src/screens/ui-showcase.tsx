import { ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

export function UIShowcase() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Typography</Text>
      <Text style={styles.h1}>Heading 1</Text>
      <Text style={styles.h2}>Heading 2</Text>
      <Text style={styles.h3}>Heading 3</Text>
      <Text style={styles.body}>Body text with regular weight for paragraphs.</Text>
      <Text style={styles.caption}>Caption text for labels and hints.</Text>

      <View style={styles.section}>
        <Text style={styles.h2}>Colors</Text>
        <View style={styles.colorRow}>
          {Object.entries(theme.colors)
            .slice(0, 6)
            .map(([name, color]) => (
              <View key={name} style={[styles.colorSwatch, { backgroundColor: color }]}>
                <Text style={styles.colorLabel}>{name}</Text>
              </View>
            ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Cards</Text>
        <View style={styles.card}>
          <Text style={styles.h3}>Default Card</Text>
          <Text style={styles.body}>Card with surface background and border.</Text>
        </View>
        <View style={[styles.card, styles.cardElevated]}>
          <Text style={styles.h3}>Elevated Card</Text>
          <Text style={styles.body}>Card with subtle shadow effect.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  section: { gap: theme.spacing.md },
  h1: { ...theme.typography.h1, color: theme.colors.text },
  h2: { ...theme.typography.h2, color: theme.colors.text },
  h3: { ...theme.typography.h3, color: theme.colors.text },
  body: { ...theme.typography.body, color: theme.colors.textSecondary },
  caption: { ...theme.typography.caption, color: theme.colors.textMuted },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
  colorLabel: { fontSize: 9, color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  cardElevated: {
    borderColor: "transparent",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
