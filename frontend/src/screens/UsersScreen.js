import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

const roleLabels = { operator: "Operador", manager: "Gestor", admin: "Administrador" };

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      (async () => {
        try {
          const { data } = await api.get("/users");
          setUsers(data);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{roleLabels[item.role] || item.role}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "500" },
  email: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  badge: { alignSelf: "flex-start", backgroundColor: "#e5e7eb", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 6 },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#374151" },
});
