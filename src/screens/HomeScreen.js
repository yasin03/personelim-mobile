import React, { useEffect, useRef } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Layout, Text, Button, Card } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, CommonActions } from "@react-navigation/native";
import useAuthStore from "../store/authStore";
import usePersonelStore from "../store/personelStore";

const HomeScreen = ({ navigation }) => {
  const { user, business } = useAuthStore();
  const {
    statistics,
    fetchStatistics,
    isLoading,
    pendingRequests,
    pendingRequestsLoading,
    pendingRequestsError,
    fetchPendingRequests,
    setCurrentPageName,
  } = usePersonelStore();
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Polling mekanizması: 30 saniyede bir güncelle
  useEffect(() => {
    if (user?.role === "owner" || user?.role === "manager") {
      // İlk yükleme
      fetchPendingRequests();

      // Polling başlat (30 saniye)
      pollingIntervalRef.current = setInterval(() => {
        fetchPendingRequests();
      }, 30000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [user?.role, fetchPendingRequests]);

  // Sayfa focus olduğunda güncelle
  useFocusEffect(
    React.useCallback(() => {
      setCurrentPageName("Home");
      if (user?.role === "owner" || user?.role === "manager") {
        fetchPendingRequests();
      }
    }, [user?.role, fetchPendingRequests, setCurrentPageName])
  );


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
      action: () => {
        // Stack'i sıfırla ve PersonelList'e git
        navigation.navigate("Personel", {
          screen: "PersonelList",
        });
        // Stack'i reset et
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "Personel",
                  state: {
                    routes: [{ name: "PersonelList" }],
                    index: 0,
                  },
                },
              ],
            })
          );
        }, 100);
      },
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

          {/* Pending Requests Widget - Owner/Manager Only */}
          {(user?.role === "owner" || user?.role === "manager") && (
            <>
              <Text category="h6" style={styles.sectionTitle}>
                Bekleyen Talepler
              </Text>
              <Card style={styles.pendingRequestsCard}>
                {pendingRequestsLoading && !pendingRequests ? (
                  <View style={styles.pendingRequestsLoading}>
                    <Text category="s1" appearance="hint">
                      Yükleniyor...
                    </Text>
                  </View>
                ) : pendingRequestsError ? (
                  <View style={styles.pendingRequestsError}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={24}
                      color="#F44336"
                    />
                    <Text category="s2" style={styles.errorText}>
                      {pendingRequestsError}
                    </Text>
                    <Button
                      size="small"
                      status="basic"
                      onPress={() => fetchPendingRequests()}
                      style={styles.retryButton}
                    >
                      Tekrar Dene
                    </Button>
                  </View>
                ) : pendingRequests && pendingRequests.total > 0 ? (
                  <>
                    <View style={styles.pendingRequestsHeader}>
                      <Text category="h4" style={styles.pendingRequestsTotal}>
                        {pendingRequests.total}
                      </Text>
                      <Text category="s2" appearance="hint">
                        Toplam Bekleyen Talep
                      </Text>
                    </View>

                    <View style={styles.pendingRequestsGrid}>
                      <TouchableOpacity
                        style={styles.pendingRequestItem}
                        onPress={() =>
                          navigation.navigate("Personel", {
                            screen: "AllLeaves",
                            params: { initialStatus: "pending" },
                          })
                        }
                      >
                        <View style={styles.pendingRequestIconContainer}>
                          <Ionicons
                            name="calendar-outline"
                            size={24}
                            color="#FF9800"
                          />
                        </View>
                        <Text category="h5" style={styles.pendingRequestCount}>
                          {pendingRequests.leaves.count}
                        </Text>
                        <Text category="c1" appearance="hint">
                          İzin Talepleri
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pendingRequestItem}
                        onPress={() => {
                          // Tüm bekleyen mesaileri görmek için PersonelList'e git
                          // Kullanıcı oradan personel seçip mesailerini görebilir
                          navigation.navigate("Personel", {
                            screen: "PersonelList",
                          });
                          setTimeout(() => {
                            navigation.dispatch(
                              CommonActions.reset({
                                index: 0,
                                routes: [
                                  {
                                    name: "Personel",
                                    state: {
                                      routes: [{ name: "PersonelList" }],
                                      index: 0,
                                    },
                                  },
                                ],
                              })
                            );
                          }, 100);
                        }}
                      >
                        <View style={styles.pendingRequestIconContainer}>
                          <Ionicons
                            name="time-outline"
                            size={24}
                            color="#2196F3"
                          />
                        </View>
                        <Text category="h5" style={styles.pendingRequestCount}>
                          {pendingRequests.timesheets.count}
                        </Text>
                        <Text category="c1" appearance="hint">
                          Mesai Talepleri
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pendingRequestItem}
                        onPress={() => {
                          // TODO: Avans talepleri ekranı eklendiğinde buraya navigate edilecek
                          // Şimdilik PersonelDetail'e gidiyoruz
                          navigation.navigate("Personel");
                        }}
                      >
                        <View style={styles.pendingRequestIconContainer}>
                          <Ionicons
                            name="cash-outline"
                            size={24}
                            color="#4CAF50"
                          />
                        </View>
                        <Text category="h5" style={styles.pendingRequestCount}>
                          {pendingRequests.advances.count}
                        </Text>
                        <Text category="c1" appearance="hint">
                          Avans Talepleri
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {pendingRequests.lastUpdated && (
                      <Text category="c2" appearance="hint" style={styles.lastUpdated}>
                        Son güncelleme:{" "}
                        {new Date(pendingRequests.lastUpdated).toLocaleString(
                          "tr-TR"
                        )}
                      </Text>
                    )}
                  </>
                ) : (
                  <View style={styles.pendingRequestsEmpty}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={48}
                      color="#4CAF50"
                    />
                    <Text category="s1" style={styles.emptyText}>
                      Bekleyen talep bulunmamaktadır
                    </Text>
                  </View>
                )}
              </Card>
            </>
          )}

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
  pendingRequestsCard: {
    marginBottom: 24,
    padding: 16,
  },
  pendingRequestsLoading: {
    padding: 24,
    alignItems: "center",
  },
  pendingRequestsHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  pendingRequestsTotal: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 4,
  },
  pendingRequestsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  pendingRequestItem: {
    alignItems: "center",
    flex: 1,
    padding: 8,
  },
  pendingRequestIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pendingRequestCount: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  lastUpdated: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 10,
  },
  pendingRequestsEmpty: {
    padding: 32,
    alignItems: "center",
  },
  pendingRequestsError: {
    padding: 24,
    alignItems: "center",
  },
  errorText: {
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
    color: "#F44336",
  },
  retryButton: {
    marginTop: 8,
  },
});

export default HomeScreen;
