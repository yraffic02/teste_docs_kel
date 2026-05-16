import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import useDocumentStore from "../store/documentStore";

async function downloadDocXlsx(id) {
  if (Platform.OS !== "web") return;
  try {
    const store = require("../store/authStore").default;
    const token = store.getState().token;
    const base = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
    const res = await fetch(`${base}/documents/${id}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extraidos.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    /* silent */
  }
}

const typeLabels = {
  cpf: "CPF",
  cnpj: "CNPJ",
  currency: "Valor",
  date: "Data",
  name: "Nome",
  client: "Cliente",
  value: "Valor",
  total_value: "Valor Total",
};

export default function DocumentDetailScreen() {
  const route = useRoute();
  const { id } = route.params;
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      (async () => {
        try {
          const data = await useDocumentStore.getState().getById(id);
          setDoc(data);
        } finally {
          setLoading(false);
        }
      })();
    }, [id])
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!doc) return <Text style={styles.error}>Documento n\u00e3o encontrado</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{doc.original_name}</Text>
          <Text style={styles.meta}>Status: {doc.status}</Text>
          <Text style={styles.meta}>Tipo: {doc.mime_type}</Text>
          {doc.processed_at && (
            <Text style={styles.meta}>
              Processado em: {new Date(doc.processed_at).toLocaleString("pt-BR")}
            </Text>
          )}
        </View>
        {doc.status === "completed" && (
          <TouchableOpacity style={styles.dlBtn} onPress={() => downloadDocXlsx(doc.id)}>
            <Text style={styles.dlBtnText}>XLSX</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Padr\u00f5es Extra\u00eddos</Text>
      {(doc.extracted_patterns || []).length === 0 ? (
        <Text style={styles.empty}>
          {doc.status === "pending" || doc.status === "processing"
            ? "Processando documento..."
            : "Nenhum padr\u00e3o encontrado"}
        </Text>
      ) : (
        doc.extracted_patterns.map((p) => (
          <View key={p.id} style={styles.pattern}>
            <Text style={styles.patternType}>
              {typeLabels[p.type] || p.type.toUpperCase()}
            </Text>
            <Text style={styles.patternValue}>{p.value}</Text>
          </View>
        ))
      )}

      {doc.xml_import && (
        <>
          <Text style={styles.sectionTitle}>XML Importado</Text>
          <Text style={styles.meta}>Arquivo: {doc.xml_import.xml_path}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "flex-start" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8, flex: 1 },
  meta: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  pattern: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  patternType: { fontWeight: "600", marginRight: 12, width: 100 },
  patternValue: { color: "#374151", flex: 1 },
  empty: { color: "#9ca3af", fontStyle: "italic" },
  error: { textAlign: "center", marginTop: 40, color: "#ef4444" },
  dlBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  dlBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
