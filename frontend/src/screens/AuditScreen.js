import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

export default function AuditScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      (async () => {
        try {
          const { data } = await api.get("/audit");
          setLogs(data.data);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.action}>{item.action}</Text>
      <Text style={styles.entity}>{item.entity} #{item.entity_id?.slice(0, 8)}</Text>
      {item.user && <Text style={styles.user}>por {item.user.name}</Text>}
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString("pt-BR")}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 8, marginBottom: 8 },
  action: { fontSize: 15, fontWeight: "600" },
  entity: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  user: { fontSize: 13, color: "#374151" },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
});
