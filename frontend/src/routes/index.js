import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import useAuthStore from "../store/authStore";
import LoginScreen from "../screens/LoginScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import DocumentDetailScreen from "../screens/DocumentDetailScreen";
import UploadScreen from "../screens/UploadScreen";
import ReportsScreen from "../screens/ReportsScreen";
import UsersScreen from "../screens/UsersScreen";
import AuditScreen from "../screens/AuditScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LogoutButton() {
  const logout = useAuthStore((s) => s.logout);
  return (
    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
      <Text style={styles.logoutText}>Sair</Text>
    </TouchableOpacity>
  );
}

function OperatorTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
      <Tab.Screen name="Documents" component={DocumentsScreen} options={{ title: "Documentos" }} />
      <Tab.Screen name="Upload" component={UploadScreen} options={{ title: "Upload" }} />
    </Tab.Navigator>
  );
}

function ManagerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: "Relatórios" }} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
      <Tab.Screen name="Documents" component={DocumentsScreen} options={{ title: "Documentos" }} />
      <Tab.Screen name="Upload" component={UploadScreen} options={{ title: "Upload" }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: "Relatórios" }} />
      <Tab.Screen name="Users" component={UsersScreen} options={{ title: "Usuários" }} />
      <Tab.Screen name="Audit" component={AuditScreen} options={{ title: "Auditoria" }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  const role = user.role;

  return (
    <Stack.Navigator>
      {role === "operator" && (
        <Stack.Screen name="Home" component={OperatorTabs} options={{ headerShown: false }} />
      )}
      {role === "manager" && (
        <Stack.Screen name="Home" component={ManagerTabs} options={{ headerShown: false }} />
      )}
      {role === "admin" && (
        <Stack.Screen name="Home" component={AdminTabs} options={{ headerShown: false }} />
      )}
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: "Detalhes" }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 12, paddingHorizontal: 10, paddingVertical: 4 },
  logoutText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
});

export default function Routes() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
