import React, { useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Layout, Text, Card } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import usePersonelStore from "../store/personelStore";

const ReportsScreen = () => {
  const { personelList } = usePersonelStore();

  const activePersonel = personelList.filter(
    (p) => p.status === "active"
  ).length;
  const totalPersonel = personelList.length;
  const inactivePersonel = totalPersonel - activePersonel;

  // Departman dağılımını hesapla
  const departmentDistribution = useMemo(() => {
    if (personelList.length === 0) return {};
    return personelList.reduce((acc, person) => {
      const dept = person.department || "Belirtilmemiş";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
  }, [personelList]);

  // Pozisyon dağılımını hesapla
  const positionDistribution = useMemo(() => {
    if (personelList.length === 0) return {};
    return personelList.reduce((acc, person) => {
      const pos = person.position || "Belirtilmemiş";
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {});
  }, [personelList]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text category="h5" style={styles.title}>
            Raporlar
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Genel İstatistikler - Renkli Kartlar */}
          <Text category="h6" style={styles.sectionTitle}>
            Genel İstatistikler
          </Text>
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, styles.statCardBlue]}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <Text category="h5" style={[styles.statNumber, styles.statNumberBlue]}>
                    {totalPersonel}
                  </Text>
                  <Text category="c1" style={styles.statLabel}>
                    Toplam Personel
                  </Text>
                </View>
                <View style={styles.statCardRight}>
                  <Ionicons name="people-outline" size={40} color="#2196F3" />
                </View>
              </View>
            </Card>

            <Card style={[styles.statCard, styles.statCardGreen]}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <Text category="h5" style={[styles.statNumber, styles.statNumberGreen]}>
                    {activePersonel}
                  </Text>
                  <Text category="c1" style={styles.statLabel}>
                    Aktif Personel
                  </Text>
                </View>
                <View style={styles.statCardRight}>
                  <Ionicons name="checkmark-circle-outline" size={40} color="#4CAF50" />
                </View>
              </View>
            </Card>

            <Card style={[styles.statCard, styles.statCardRed]}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <Text category="h5" style={[styles.statNumber, styles.statNumberRed]}>
                    {inactivePersonel}
                  </Text>
                  <Text category="c1" style={styles.statLabel}>
                    Pasif Personel
                  </Text>
                </View>
                <View style={styles.statCardRight}>
                  <Ionicons name="close-circle-outline" size={40} color="#F44336" />
                </View>
              </View>
            </Card>

            <Card style={[styles.statCard, styles.statCardOrange]}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <Text category="h5" style={[styles.statNumber, styles.statNumberOrange]}>
                    {Object.keys(departmentDistribution).length}
                  </Text>
                  <Text category="c1" style={styles.statLabel}>
                    Departman
                  </Text>
                </View>
                <View style={styles.statCardRight}>
                  <Ionicons name="business-outline" size={40} color="#FF9800" />
                </View>
              </View>
            </Card>
          </View>

          {/* Departman Dağılımı */}
          <Text category="h6" style={styles.sectionTitle}>
            Departman Dağılımı
          </Text>
          <Card style={styles.distributionCard}>
            {Object.keys(departmentDistribution).length > 0 ? (
              Object.entries(departmentDistribution).map(([department, count]) => {
                const percentage = totalPersonel > 0 ? ((count / totalPersonel) * 100).toFixed(1) : 0;
                return (
                  <View key={department} style={styles.distributionItem}>
                    <View style={styles.distributionHeader}>
                      <View style={styles.distributionLeft}>
                        <Ionicons name="business" size={20} color="#2196F3" style={styles.distributionIcon} />
                        <Text category="s1" style={styles.distributionLabel}>
                          {department}
                        </Text>
                      </View>
                      <View style={styles.distributionRight}>
                        <Text category="h6" style={styles.distributionCount}>
                          {count}
                        </Text>
                        <Text category="c2" style={styles.distributionPercentage}>
                          %{percentage}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: "#2196F3" }]} />
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#999" />
                <Text category="s1" style={styles.emptyText}>
                  Henüz veri bulunmuyor
                </Text>
              </View>
            )}
          </Card>

          {/* Pozisyon Dağılımı */}
          <Text category="h6" style={styles.sectionTitle}>
            Pozisyon Dağılımı
          </Text>
          <Card style={styles.distributionCard}>
            {Object.keys(positionDistribution).length > 0 ? (
              Object.entries(positionDistribution).map(([position, count]) => {
                const percentage = totalPersonel > 0 ? ((count / totalPersonel) * 100).toFixed(1) : 0;
                return (
                  <View key={position} style={styles.distributionItem}>
                    <View style={styles.distributionHeader}>
                      <View style={styles.distributionLeft}>
                        <Ionicons name="briefcase" size={20} color="#FF9800" style={styles.distributionIcon} />
                        <Text category="s1" style={styles.distributionLabel}>
                          {position}
                        </Text>
                      </View>
                      <View style={styles.distributionRight}>
                        <Text category="h6" style={styles.distributionCount}>
                          {count}
                        </Text>
                        <Text category="c2" style={styles.distributionPercentage}>
                          %{percentage}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: "#FF9800" }]} />
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#999" />
                <Text category="s1" style={styles.emptyText}>
                  Henüz veri bulunmuyor
                </Text>
              </View>
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
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 0.48,
    minWidth: "47%",
    borderRadius: 12,
    borderWidth: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardBlue: {
    backgroundColor: "#E3F2FD",
  },
  statCardGreen: {
    backgroundColor: "#E8F5E9",
  },
  statCardOrange: {
    backgroundColor: "#FFF3E0",
  },
  statCardRed: {
    backgroundColor: "#FFEBEE",
  },
  statCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCardLeft: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  statCardRight: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  statNumber: {
    marginBottom: 4,
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 18,
  },
  statNumberBlue: {
    color: "#2196F3",
  },
  statNumberGreen: {
    color: "#4CAF50",
  },
  statNumberOrange: {
    color: "#FF9800",
  },
  statNumberRed: {
    color: "#F44336",
  },
  statLabel: {
    opacity: 0.8,
    textAlign: "left",
    fontSize: 10,
    marginTop: 2,
  },
  distributionCard: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  distributionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  distributionIcon: {
    marginRight: 8,
  },
  distributionLabel: {
    flex: 1,
    fontSize: 14,
  },
  distributionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distributionCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  distributionPercentage: {
    opacity: 0.7,
    fontSize: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
});

export default ReportsScreen;
