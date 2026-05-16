import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

function downloadBlob(blob, filename) {
  if (Platform.OS !== "web") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadReport(path, format) {
  if (Platform.OS !== "web") return;
  try {
    const store = require("../store/authStore").default;
    const token = store.getState().token;
    const base = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    const res = await fetch(`${base}${path}?format=${format}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const ext = format === "xlsx" ? "xlsx" : "csv";
    downloadBlob(blob, `report.${ext}`);
  } catch {
    /* silent */
  }
}

export default function ReportsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      (async () => {
        try {
          const [period, status, mime, patterns] = await Promise.all([
            api.get("/reports/by-period"),
            api.get("/reports/by-status"),
            api.get("/reports/by-mime-type"),
            api.get("/reports/patterns"),
          ]);
          setData({ period: period.data, status: status.data, mime: mime.data, patterns: patterns.data });
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const DownloadBtn = ({ path, label }) => (
    <View style={styles.btnRow}>
      <TouchableOpacity style={styles.dlBtn} onPress={() => downloadReport(path, "csv")}>
        <Text style={styles.dlBtnText}>CSV</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dlBtn} onPress={() => downloadReport(path, "xlsx")}>
        <Text style={styles.dlBtnText}>XLSX</Text>
      </TouchableOpacity>
      <Text style={styles.dlLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <DownloadBtn path="/reports/by-period" label="Quantidade por Per\u00edodo" />
      <DownloadBtn path="/reports/by-status" label="Quantidade por Status" />
      <DownloadBtn path="/reports/by-mime-type" label="Quantidade por Tipo" />
      <DownloadBtn path="/reports/patterns" label="Padr\u00f5es Extra\u00eddos" />

      <Text style={styles.sectionTitle}>Por Status</Text>
      {(data?.status || []).map((s) => (
        <View key={s.status} style={styles.row}>
          <Text>{s.status}</Text>
          <Text style={styles.count}>{s.count}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Por Tipo</Text>
      {(data?.mime || []).map((m) => (
        <View key={m.mime_type} style={styles.row}>
          <Text>{m.mime_type}</Text>
          <Text style={styles.count}>{m.count}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Padr\u00f5es Extra\u00eddos</Text>
      {(data?.patterns || []).map((p) => (
        <View key={p.type} style={styles.row}>
          <Text>{p.type}</Text>
          <Text style={styles.count}>{p.count}</Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 14, borderRadius: 6, marginBottom: 6 },
  count: { fontWeight: "600", color: "#2563eb" },
  btnRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 4 },
  dlBtn: { backgroundColor: "#2563eb", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, marginRight: 8 },
  dlBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  dlLabel: { fontSize: 14, color: "#374151" },
});
