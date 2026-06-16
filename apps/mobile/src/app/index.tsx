import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

interface MessageResponse {
  message: string;
  note: string;
  env: string;
}

interface InfoResponse {
  app: string;
  version: string;
  description: string;
  techStack: Record<string, string>;
}

export default function HomeScreen() {
  const [message, setMessage] = useState<MessageResponse | null>(null);
  const [info, setInfo] = useState<InfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/message`).then((r) => r.json()),
      fetch(`${API_URL}/api/info`).then((r) => r.json()),
    ])
      .then(([msg, inf]) => {
        setMessage(msg);
        setInfo(inf);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Acte</Text>
        <Text style={styles.subtitle}>Monorepo Demo</Text>
      </View>

      {/* API Connection Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>BACKEND BAĞLANTISI</Text>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#34d399" />
            <Text style={styles.loadingText}>API'ye bağlanıyor...</Text>
          </View>
        )}

        {error && (
          <View>
            <Text style={styles.errorText}>Bağlantı hatası</Text>
            <Text style={styles.errorDetail}>{error}</Text>
            <Text style={styles.hint}>Backend'in çalıştığından emin olun: {API_URL}</Text>
          </View>
        )}

        {message && !error && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{message.message}</Text>
            <Text style={styles.messageNote}>{message.note}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ortam: {message.env}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>v0.1.0</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Tech Stack */}
      {info && !error && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TEKNOLOJİ STACK</Text>
          {Object.entries(info.techStack).map(([key, val]) => (
            <View key={key} style={styles.techRow}>
              <Text style={styles.techKey}>{key}</Text>
              <Text style={styles.techValue}>{val}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f4f4f5",
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#71717a",
    marginBottom: 12,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#a1a1aa",
    fontSize: 14,
  },
  errorText: {
    color: "#f87171",
    fontWeight: "600",
    fontSize: 14,
  },
  errorDetail: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 4,
  },
  hint: {
    color: "#52525b",
    fontSize: 11,
    marginTop: 8,
  },
  messageContainer: {
    gap: 8,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#34d399",
  },
  messageNote: {
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    backgroundColor: "#27272a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  techRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  techKey: {
    fontSize: 12,
    color: "#71717a",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  techValue: {
    fontSize: 14,
    color: "#e4e4e7",
  },
});
