import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Layout, Text, Card } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import usePersonelStore from "../store/personelStore";

const ReportsScreen = () => {
  const { personelList } = usePersonelStore();

  const activePersonel = personelList.filter(
    (p) => p.status === "active"
  ).length;
  const totalPersonel = personelList.length;
  const inactivePersonel = totalPersonel - activePersonel;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
        <Text category="h4" style={styles.title}>
          Raporlar
        </Text>

        <ScrollView style={styles.scrollView}>
          {/* Genel İstatistikler */}
          <Card style={styles.card}>
            <Text category="h6" style={styles.cardTitle}>
              Genel İstatistikler
            </Text>

            <View style={styles.statRow}>
              <Text category="s1">Toplam Personel:</Text>
              <Text category="h6">{totalPersonel}</Text>
            </View>

            <View style={styles.statRow}>
              <Text category="s1">Aktif Personel:</Text>
              <Text category="h6" style={styles.activeText}>
                {activePersonel}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text category="s1">Pasif Personel:</Text>
              <Text category="h6" style={styles.inactiveText}>
                {inactivePersonel}
              </Text>
            </View>
          </Card>

          {/* Departman Dağılımı */}
          <Card style={styles.card}>
            <Text category="h6" style={styles.cardTitle}>
              Departman Dağılımı
            </Text>

            {personelList.length > 0 ? (
              personelList.reduce((acc, person) => {
                acc[person.department] = (acc[person.department] || 0) + 1;
                return acc;
              }, {}) ? (
                Object.entries(
                  personelList.reduce((acc, person) => {
                    acc[person.department] = (acc[person.department] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([department, count]) => (
                  <View key={department} style={styles.statRow}>
                    <Text category="s1">{department}:</Text>
                    <Text category="h6">{count}</Text>
                  </View>
                ))
              ) : null
            ) : (
              <Text category="s1" style={styles.emptyText}>
                Henüz veri bulunmuyor
              </Text>
            )}
          </Card>

          {/* Pozisyon Dağılımı */}
          <Card style={styles.card}>
            <Text category="h6" style={styles.cardTitle}>
              Pozisyon Dağılımı
            </Text>

            {personelList.length > 0 ? (
              Object.entries(
                personelList.reduce((acc, person) => {
                  acc[person.position] = (acc[person.position] || 0) + 1;
                  return acc;
                }, {})
              ).map(([position, count]) => (
                <View key={position} style={styles.statRow}>
                  <Text category="s1">{position}:</Text>
                  <Text category="h6">{count}</Text>
                </View>
              ))
            ) : (
              <Text category="s1" style={styles.emptyText}>
                Henüz veri bulunmuyor
              </Text>
            )}
          </Card>
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
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeText: {
    color: "#00C851",
  },
  inactiveText: {
    color: "#FF4444",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
});

export default ReportsScreen;
