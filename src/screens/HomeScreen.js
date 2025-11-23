import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from "react-native";
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
  const [isPendingRequestsExpanded, setIsPendingRequestsExpanded] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Tarih formatlama fonksiyonu
  const getFormattedDate = () => {
    const today = new Date();
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    const day = today.getDate();
    const month = months[today.getMonth()];
    return `Bugün ${day} ${month}, keyifli bir gün olsun`;
  };

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
      icon: "person-add-outline",
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
            icon: "calendar-outline",
          },
        ]
      : []),

  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}

            <View style={styles.headerContent}>
              {/* Sol taraf - Avatar */}
              <View style={styles.avatarContainer}>
                <Image
                  source={user?.photoURL ? { uri: user.photoURL } : require("../../assets/icon.png")}
                  style={styles.avatar}
                />
              </View>

              {/* Orta - Hoşgeldin mesajı */}
              <View style={styles.headerTextContainer}>
                <Text category="h5" style={styles.welcomeText}>
                  Hoşgeldin {user?.name || user?.email?.split("@")[0] || "Kullanıcı"}
                </Text>
                <Text category="s1" style={styles.userText}>
                  {getFormattedDate()}
                </Text>
              </View>

              {/* Sağ taraf - Bildirim ikonu */}
              <TouchableOpacity
                style={styles.notificationIcon}
                onPress={() => {
                  // Bildirim sayfasına git
                  // navigation.navigate("Notifications");
                }}
              >
                <Ionicons name="notifications-outline" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, styles.statCardBlue]}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <Text category="h5" style={[styles.statNumber, styles.statNumberBlue]}>
                    {statistics?.total || 0}
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
                    {statistics?.active || 0}
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

            <Card style={[styles.statCard, styles.statCardOrange]}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <Text category="h5" style={[styles.statNumber, styles.statNumberOrange]}>
                    {Object.keys(statistics?.departments || {}).length}
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

            <Card style={[styles.statCard, styles.statCardRed]}>
              <View style={styles.statCardContent}>
                <View style={styles.statCardLeft}>
                  <Text category="h5" style={[styles.statNumber, styles.statNumberRed]}>
                    {statistics?.deleted || 0}
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
          </View>

          {/* Pending Requests Widget - Owner/Manager Only */}
          {(user?.role === "owner" || user?.role === "manager") && (
            <Card style={styles.pendingRequestsCard}>
              <TouchableOpacity
                style={styles.pendingRequestsHeaderButton}
                onPress={() => setIsPendingRequestsExpanded(!isPendingRequestsExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.pendingRequestsHeaderContent}>
                  <View style={styles.pendingRequestsHeaderLeft}>
                    <Ionicons
                      name="notifications"
                      size={20}
                      color="#2196F3"
                      style={styles.pendingRequestsHeaderIcon}
                    />
                    <Text category="h6" style={styles.pendingRequestsHeaderTitle}>
                      Bekleyen Talepler
                    </Text>
                  </View>
                  <View style={styles.pendingRequestsHeaderRight}>
                    {pendingRequestsLoading ? (
                      <Text category="c1" appearance="hint">
                        Yükleniyor...
                      </Text>
                    ) : pendingRequestsError ? (
                      <View style={styles.pendingRequestsBadgeError}>
                        <Ionicons name="alert-circle" size={14} color="#F44336" />
                      </View>
                    ) : pendingRequests && pendingRequests.total > 0 ? (
                      <View style={styles.pendingRequestsBadge}>
                        <Text style={styles.pendingRequestsBadgeText}>
                          {pendingRequests.total}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.pendingRequestsBadgeEmpty}>
                        <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                      </View>
                    )}
                    <Ionicons
                      name={isPendingRequestsExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#666"
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {isPendingRequestsExpanded && (
                <View style={styles.pendingRequestsContent}>
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
                      <View style={styles.pendingRequestsGrid}>
                        <TouchableOpacity
                          style={styles.pendingRequestItem}
                          onPress={() => {
                            setIsPendingRequestsExpanded(false);
                            navigation.navigate("Personel", {
                              screen: "AllLeaves",
                              params: { initialStatus: "pending" },
                            });
                          }}
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
                            setIsPendingRequestsExpanded(false);
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
                            setIsPendingRequestsExpanded(false);
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
                        size={32}
                        color="#4CAF50"
                      />
                      <Text category="s1" style={styles.emptyText}>
                        Bekleyen talep bulunmamaktadır
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Card>
          )}

          {/* Quick Actions */}
          <Text category="h6" style={styles.sectionTitle}>
            Hızlı İşlemler
          </Text>

          <View style={styles.actionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={styles.actionCardContent}>
                  <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text category="s1" style={styles.actionTitle}>
                      {action.title}
                    </Text>
                    <Text category="c2" style={styles.actionSubtitle}>
                      {action.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  userText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  notificationIcon: {
    marginLeft: 12,
    padding: 8,
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
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionCard: {
    marginBottom: 8,
    borderLeftWidth: 3,
    borderRadius: 8,
    backgroundColor: "#FFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionSubtitle: {
    opacity: 0.6,
    fontSize: 11,
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
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
  },
  pendingRequestsHeaderButton: {

  },
  pendingRequestsHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pendingRequestsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pendingRequestsHeaderIcon: {
    marginRight: 8,
  },
  pendingRequestsHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  pendingRequestsHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pendingRequestsBadge: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingRequestsBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  pendingRequestsBadgeEmpty: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingRequestsBadgeError: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingRequestsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  pendingRequestsLoading: {
    padding: 24,
    alignItems: "center",
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
    padding: 20,
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
