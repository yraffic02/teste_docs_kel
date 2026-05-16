import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useDocumentStore from "../store/documentStore";

const statusColors = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  completed: "#10b981",
  failed: "#ef4444",
};

async function downloadExportAll() {
  if (Platform.OS !== "web") return;
  try {
    const store = require("../store/authStore").default;
    const token = store.getState().token;
    const base = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    const res = await fetch(`${base}/documents/export/all`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exportacao_completa.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    /* silent */
  }
}

export default function DocumentsScreen() {
  const { documents, loading, total, list } = useDocumentStore();
  const [page, setPage] = useState(1);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      list({ page });
    }, [page])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("DocumentDetail", { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>{item.original_name}</Text>
        <View style={[styles.badge, { backgroundColor: statusColors[item.status] || "#6b7280" }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>{item.mime_type} - {new Date(item.created_at).toLocaleDateString("pt-BR")}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.exportBtn} onPress={downloadExportAll}>
          <Text style={styles.exportBtnText}>Exportar XLSX</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator style={{ padding: 20 }} />}
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={() => {
          if (documents.length < total) setPage((p) => p + 1);
        }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum documento encontrado</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  topBar: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16, paddingTop: 8 },
  exportBtn: { backgroundColor: "#10b981", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  exportBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  card: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { flex: 1, fontSize: 16, fontWeight: "500", marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  cardMeta: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  empty: { textAlign: "center", marginTop: 40, color: "#9ca3af" },
});
