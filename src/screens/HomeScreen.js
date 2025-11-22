import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Layout, Text, Button, Card } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import useAuthStore from "../store/authStore";
import usePersonelStore from "../store/personelStore";

const HomeScreen = ({ navigation }) => {
  const { user, business } = useAuthStore();
  const {
    statistics,
    fetchStatistics,
    isLoading,
  } = usePersonelStore();

  useEffect(() => {
    fetchStatistics();
  }, []);


  const quickActions = [
    {
      title: "Personel Ekle",
      subtitle: "Yeni personel kaydı",
      action: () => navigation.navigate("Personel", { screen: "AddPersonel" }),
      color: "#4CAF50",
    },
    {
      title: "Personel Listesi",
      subtitle: "Tüm personelleri görüntüle",
      action: () => navigation.navigate("Personel"),
      color: "#2196F3",
    },
    ...(user?.role === "owner" || user?.role === "manager"
      ? [
          {
            title: "Tüm İzinler",
            subtitle: "Tüm izin kayıtları",
            action: () =>
              navigation.navigate("Personel", {
                screen: "AllLeaves",
              }),
            color: "#2196F3",
          },
        ]
      : []),
    {
      title: "Raporlar",
      subtitle: "İstatistikler ve analizler",
      action: () => navigation.navigate("Reports"),
      color: "#FF9800",
    },
    {
      title: "Ayarlar",
      subtitle: "Uygulama ayarları",
      action: () => navigation.navigate("Settings"),
      color: "#9C27B0",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <Card style={styles.headerCard}>
            <Text category="h4" style={styles.welcomeText}>
              Hoş geldiniz! 👋
            </Text>
            <Text category="s1" style={styles.userText}>
              {user?.name || user?.email}
            </Text>
            {business && (
              <Text category="c1" style={styles.businessText}>
                {business.name}
              </Text>
            )}
          </Card>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text category="h6" style={styles.statNumber}>
                {statistics?.total || 0}
              </Text>
              <Text category="s2" style={styles.statLabel}>
                Toplam Personel
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <Text category="h6" style={styles.statNumber}>
                {statistics?.active || 0}
              </Text>
              <Text category="s2" style={styles.statLabel}>
                Aktif Personel
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <Text category="h6" style={styles.statNumber}>
                {Object.keys(statistics?.departments || {}).length}
              </Text>
              <Text category="s2" style={styles.statLabel}>
                Departman
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <Text category="h6" style={styles.statNumber}>
                {statistics?.deleted || 0}
              </Text>
              <Text category="s2" style={styles.statLabel}>
                Pasif Personel
              </Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <Text category="h6" style={styles.sectionTitle}>
            Hızlı İşlemler
          </Text>

          <View style={styles.actionsContainer}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.action}
              >
                <Text category="h6" style={styles.actionTitle}>
                  {action.title}
                </Text>
                <Text category="c1" style={styles.actionSubtitle}>
                  {action.subtitle}
                </Text>
              </Card>
            ))}
          </View>


          {/* Recent Activity - Placeholder */}
          {!(user?.role === "owner" || user?.role === "manager") && (
            <>
              <Text category="h6" style={styles.sectionTitle}>
                Son Aktiviteler
              </Text>

              <Card style={styles.activityCard}>
                <Text category="s1" style={styles.emptyText}>
                  Son aktiviteler burada görünecek
                </Text>
              </Card>
            </>
          )}
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  welcomeText: {
    marginBottom: 4,
  },
  userText: {
    marginBottom: 2,
  },
  businessText: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 0.48,
    alignItems: "center",
    paddingVertical: 20,
  },
  statNumber: {
    marginBottom: 4,
    fontWeight: "bold",
  },
  statLabel: {
    opacity: 0.7,
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    paddingVertical: 16,
  },
  actionTitle: {
    marginBottom: 4,
  },
  actionSubtitle: {
    opacity: 0.7,
  },
  activityCard: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.7,
    textAlign: "center",
  },
  emptyIcon: {
    marginBottom: 8,
  },
});

export default HomeScreen;
