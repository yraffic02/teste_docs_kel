import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, Platform } from "react-native";
import useDocumentStore from "../store/documentStore";

export default function UploadScreen() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { upload } = useDocumentStore();
  const fileInputRef = useRef(null);

  const pickFile = async () => {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      return;
    }
    try {
      const { DocumentPicker } = require("expo-document-picker");
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/png", "application/xml"],
        multiple: true,
      });
      if (!result.canceled) setFiles(result.assets);
    } catch {
      Alert.alert("Erro", "N\u00e3o foi poss\u00edvel selecionar o arquivo");
    }
  };

  const onFilesSelected = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) setFiles((prev) => [...prev, ...dropped]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      Alert.alert("Aviso", "Selecione pelo menos um arquivo");
      return;
    }
    setUploading(true);
    try {
      const result = await upload(files);
      Alert.alert("Sucesso", `${result.count} arquivo(s) enviado(s) para processamento`);
      setFiles([]);
    } catch {
      Alert.alert("Erro", "Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  const renderFile = ({ item, index }) => (
    <View style={styles.fileRow}>
      <Text style={styles.fileName} numberOfLines={1}>{item.name || item.fileName}</Text>
      <TouchableOpacity onPress={() => removeFile(index)} disabled={uploading}>
        <Text style={styles.removeText}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={styles.container}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {Platform.OS === "web" && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.xml,application/pdf,image/png,application/xml"
          style={{ display: "none" }}
          onChange={onFilesSelected}
        />
      )}

      <TouchableOpacity
        style={[styles.picker, dragging && styles.pickerDragging]}
        onPress={pickFile}
        activeOpacity={0.7}
      >
        <Text style={styles.pickerText}>
          {files.length > 0
            ? `${files.length} arquivo(s) selecionado(s)`
            : "Clique para selecionar ou arraste os arquivos aqui"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>PDF, PNG ou XML (m\u00e1x. 20MB cada, m\u00faltiplos permitidos)</Text>

      {files.length > 0 && (
        <FlatList
          data={files}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderFile}
          style={styles.fileList}
        />
      )}

      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={uploading || files.length === 0}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {files.length > 0 ? `Enviar ${files.length} arquivo(s)` : "Enviar"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f5f5f5" },
  picker: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  pickerDragging: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  pickerText: { fontSize: 15, color: "#6b7280", textAlign: "center" },
  hint: { textAlign: "center", color: "#9ca3af", marginTop: 8, marginBottom: 16 },
  fileList: { maxHeight: 200, marginBottom: 16 },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  fileName: { flex: 1, fontSize: 14, marginRight: 8 },
  removeText: { color: "#ef4444", fontWeight: "600", fontSize: 13 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
