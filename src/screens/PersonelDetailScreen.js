import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from "react-native";
import {
  Layout,
  Text,
  Button,
  Card,
  Divider,
  Avatar,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import usePersonelStore from "../store/personelStore";
import useAuthStore from "../store/authStore";

const avatarColors = [
  "#FDE68A", // sarı
  "#A7F3D0", // yeşil
  "#BFDBFE", // mavi
  "#FBCFE8", // pembe
  "#DDD6FE", // mor
  "#FECACA", // kırmızımsı
  "#C7D2FE", // indigo
];

// Personel ID'sine veya ismine göre sabit renk döndürür
const getAvatarColor = (personel) => {
  const identifier = personel?.id || personel?._id || `${personel?.firstName}${personel?.lastName}` || "default";
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

const PersonelDetailScreen = ({ navigation, route }) => {
  const { personel } = route.params;
  const { deletePersonel, updatePersonelRole, isLoading } = usePersonelStore();
  const { user: authUser } = useAuthStore();
  const [personelData, setPersonelData] = useState(personel);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const personelId =
    personelData?.id ||
    personelData?._id ||
    personelData?.employeeId ||
    personelData?.userId;
  const userId = personelData?.userId || personelData?.user?.id;
  const accountRole =
    personelData?.userRole ||
    personelData?.role ||
    personelData?.accountRole ||
    personelData?.user?.role ||
    "employee";
  const canManageRoles = authUser?.role === "owner";

  useEffect(() => {
    setPersonelData(personel);
  }, [personel]);

  const handleEdit = () => {
    navigation.navigate("AddPersonel", {
      mode: "edit",
      personel: personelData,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Personeli Sil",
      `${personelData.firstName} ${personelData.lastName} adlı personeli silmek istediğinizden emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (!personelId) {
              Alert.alert("Hata", "Personel kimliği bulunamadı.");
              return;
            }
            const result = await deletePersonel(personelId);
            if (result.success) {
              Alert.alert("Başarılı", "Personel başarıyla silindi", [
                {
                  text: "Tamam",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } else {
              Alert.alert(
                "Hata",
                result.error || "Personel silinirken bir hata oluştu"
              );
            }
          },
        },
      ]
    );
  };

  const handleCreateUser = () => {
    navigation.navigate("CreatePersonelUser", { personel: personelData });
  };

  const handleRoleChange = (targetRole) => {
    if (!personelId || !userId) {
      Alert.alert(
        "Bilgi",
        "Önce bu personel için bir kullanıcı hesabı oluşturmanız gerekir."
      );
      return;
    }

    if (accountRole === targetRole) {
      Alert.alert("Bilgi", `Personel zaten ${targetRole} rolünde.`);
      return;
    }

    const roleLabel =
      targetRole === "manager"
        ? "Manager"
        : targetRole === "owner"
        ? "Owner"
        : "Employee";

    Alert.alert(
      "Rol Güncelle",
      `${personelData.firstName} ${personelData.lastName} adlı personeli ${roleLabel} rolüne geçirmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            setIsUpdatingRole(true);
            const result = await updatePersonelRole(
              personelId,
              userId,
              targetRole
            );
            setIsUpdatingRole(false);

            if (result.success) {
              setPersonelData((prev) => ({
                ...prev,
                role: targetRole,
                userRole: targetRole,
                accountRole: targetRole,
                user: prev?.user
                  ? { ...prev.user, role: targetRole }
                  : { id: userId, role: targetRole },
              }));
              Alert.alert("Başarılı", `Rol ${roleLabel} olarak güncellendi.`);
            } else {
              Alert.alert(
                "Hata",
                result.error ||
                  "Rol güncellenirken bir hata oluştu. Lütfen tekrar deneyin."
              );
            }
          },
        },
      ]
    );
  };

  const InfoRow = ({ label, value, icon, iconColor = "#2196F3" }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        {icon && (
          <View style={[styles.infoIconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons
              name={icon}
              size={18}
              color={iconColor}
            />
          </View>
        )}
        <Text category="s2" style={styles.infoLabel}>
          {label}
        </Text>
      </View>
      <Text category="p1" style={styles.infoValue}>
        {value || "Belirtilmemiş"}
      </Text>
    </View>
  );

  const initials = `${personelData?.firstName?.[0] ?? ""}${personelData?.lastName?.[0] ?? ""}`.toUpperCase();
  const bgColor = getAvatarColor(personelData);
  const hasProfilePicture = personelData?.profilePictureUrl;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
                {/* Header with Back Button */}
                <View style={styles.topHeader}>
          <Text category="h5" style={styles.pageTitle}>
            Personel Detayı
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#2196F3" />
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <Card style={styles.headerCard}>
            <View style={styles.headerContent}>
              {/* Sol: Avatar */}
              {hasProfilePicture ? (
                <Avatar
                  size="large"
                  source={{ uri: personelData.profilePictureUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.customAvatar, { backgroundColor: bgColor }]}>
                  <Text style={styles.initialText}>{initials}</Text>
                </View>
              )}
              
              {/* Orta: Bilgiler */}
              <View style={styles.headerInfo}>
                <Text category="h5" style={styles.name}>
                  {personelData.firstName} {personelData.lastName}
                </Text>
               
                <Text category="s1" style={styles.position}>
                  {personelData.position || "Pozisyon belirtilmemiş"}
                </Text>
                <Text category="c1" style={styles.department}>
                  {personelData.department || "Departman belirtilmemiş"}
                </Text>
              </View>

              {/* Sağ: Rol */}
              {personelData.userId && (
                <View style={styles.headerRoleContainer}>
                   <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: personelData.isDeleted ? "#F44336" : "#4CAF50" }]} />
                  <Text category="c2" style={[styles.statusText, { color: personelData.isDeleted ? "#F44336" : "#4CAF50" }]}>
                    {personelData.isDeleted ? "Pasif" : "Aktif"}
                  </Text>
                </View>
                  <View style={[styles.headerRoleBadge, {
                    backgroundColor: accountRole === "manager" ? "#FF980015" : accountRole === "owner" ? "#F4433615" : "#2196F315"
                  }]}>
                    <Ionicons 
                      name={accountRole === "manager" ? "shield" : accountRole === "owner" ? "star" : "person"} 
                      size={16} 
                      color={accountRole === "manager" ? "#FF9800" : accountRole === "owner" ? "#F44336" : "#2196F3"} 
                    />
                    <Text category="c2" style={[styles.headerRoleText, {
                      color: accountRole === "manager" ? "#FF9800" : accountRole === "owner" ? "#F44336" : "#2196F3"
                    }]}>
                      {accountRole === "manager" ? "Manager" : accountRole === "owner" ? "Owner" : "Employee"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Contact Information */}
          <Card style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color="#2196F3" style={styles.sectionIcon} />
              <Text category="h6" style={styles.sectionTitle}>
                İletişim Bilgileri
              </Text>
            </View>
            <Divider style={styles.divider} />

            <InfoRow
              label="Email"
              value={personelData.email}
              icon="mail-outline"
              iconColor="#2196F3"
            />
            <InfoRow
              label="Telefon"
              value={personelData.phone}
              icon="call-outline"
              iconColor="#4CAF50"
            />
            <InfoRow
              label="Adres"
              value={personelData.address}
              icon="location-outline"
              iconColor="#FF9800"
            />
            <InfoRow
              label="Acil Durum"
              value={personelData.emergencyContact}
              icon="alert-circle-outline"
              iconColor="#F44336"
            />
          </Card>

          {/* Work Information */}
          <Card style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase" size={20} color="#FF9800" style={styles.sectionIcon} />
              <Text category="h6" style={styles.sectionTitle}>
                İş Bilgileri
              </Text>
            </View>
            <Divider style={styles.divider} />

            <InfoRow
              label="Pozisyon"
              value={personelData.position}
              icon="briefcase-outline"
              iconColor="#FF9800"
            />
            <InfoRow
              label="Departman"
              value={personelData.department}
              icon="business-outline"
              iconColor="#2196F3"
            />
            <InfoRow
              label="Maaş"
              value={
                personelData.salary
                  ? `${personelData.salary.toLocaleString()} TL`
                  : undefined
              }
              icon="card-outline"
              iconColor="#4CAF50"
            />
            <InfoRow
              label="İşe Başlama"
              value={personelData.startDate}
              icon="calendar-outline"
              iconColor="#9C27B0"
            />
          </Card>

          {/* User Account Information */}
          {personelData.userId ? (
            <Card style={styles.infoCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color="#9C27B0" style={styles.sectionIcon} />
                <Text category="h6" style={styles.sectionTitle}>
                  Kullanıcı Hesabı
                </Text>
              </View>
              <Divider style={styles.divider} />

              <InfoRow
                label="Hesap Durumu"
                value="Aktif"
                icon="checkmark-circle"
                iconColor="#4CAF50"
              />
              <InfoRow
                label="Kullanıcı ID"
                value={personelData.userId}
                icon="key-outline"
                iconColor="#666"
              />
              <View style={styles.roleContainer}>
                <View style={styles.infoLeft}>
                  <View style={[styles.infoIconContainer, { backgroundColor: "#9C27B015" }]}>
                    <Ionicons name="ribbon-outline" size={18} color="#9C27B0" />
                  </View>
                  <Text category="s2" style={styles.infoLabel}>
                    Rol
                  </Text>
                </View>
                <View style={[styles.roleBadge, { 
                  backgroundColor: accountRole === "manager" ? "#FF980015" : accountRole === "owner" ? "#F4433615" : "#2196F315" 
                }]}>
                  <Text category="c1" style={[styles.roleText, {
                    color: accountRole === "manager" ? "#FF9800" : accountRole === "owner" ? "#F44336" : "#2196F3"
                  }]}>
                    {accountRole === "manager" ? "Manager" : accountRole === "owner" ? "Owner" : "Employee"}
                  </Text>
                </View>
              </View>

              {canManageRoles && (
                <View style={styles.roleButtons}>
                  {accountRole !== "manager" && (
                    <Button
                      size="small"
                      status="danger"
                      style={styles.roleButton}
                      disabled={isUpdatingRole}
                      onPress={() => handleRoleChange("manager")}
                    >
                      Manager Yap
                    </Button>
                  )}
                  {accountRole !== "employee" && (
                    <Button
                      size="small"
                      appearance="outline"
                      status="basic"
                      style={styles.roleButton}
                      disabled={isUpdatingRole}
                      onPress={() => handleRoleChange("employee")}
                    >
                      Çalışana Çevir
                    </Button>
                  )}
                </View>
              )}
            </Card>
          ) : (
            <Card style={styles.infoCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={20} color="#9C27B0" style={styles.sectionIcon} />
                <Text category="h6" style={styles.sectionTitle}>
                  Kullanıcı Hesabı
                </Text>
              </View>
              <Divider style={styles.divider} />

              <View style={styles.emptyUserState}>
                <Ionicons name="person-outline" size={48} color="#999" />
                <Text category="p2" style={styles.noUserText}>
                  Bu personel için henüz kullanıcı hesabı oluşturulmamış
                </Text>
                <Button
                  appearance="outline"
                  status="info"
                  onPress={handleCreateUser}
                  style={styles.createUserButton}
                  accessoryLeft={(props) => <Ionicons name="add-circle-outline" size={20} color="#2196F3" />}
                >
                  Kullanıcı Hesabı Oluştur
                </Button>
              </View>
            </Card>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer]}>
              <Ionicons name="create-outline" size={20} color="#2196F3" />
            </View>
            <Text style={[styles.actionButtonText, { color: "#2196F3" }]}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.timesheetButton]}
            onPress={() =>
              navigation.navigate("EmployeeTimesheets", {
                employeeId: personelId,
                employeeName: `${personelData.firstName || ""} ${
                  personelData.lastName || ""
                }`,
              })
            }
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer]}>
              <Ionicons name="time-outline" size={20} color="#FF9800" />
            </View>
            <Text style={[styles.actionButtonText, { color: "#FF9800" }]}>Mesailer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.leavesButton]}
            onPress={() =>
              navigation.navigate("EmployeeLeaves", {
                employeeId: personelId,
                employeeName: `${personelData.firstName || ""} ${
                  personelData.lastName || ""
                }`,
              })
            }
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer]}>
              <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.actionButtonText, { color: "#4CAF50" }]}>İzinler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer]}>
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </View>
            <Text style={[styles.actionButtonText, { color: "#F44336" }]}>
              {isLoading ? "Siliniyor..." : "Sil"}
            </Text>
          </TouchableOpacity>
        </View>
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
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    paddingLeft: 16,

  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerCard: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    marginRight: 16,
    width: 64,
    height: 64,
  },
  customAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  initialText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A2138",
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  headerRoleContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  headerRoleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  name: {
    marginBottom: 6,
    fontSize: 18,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  position: {
    marginBottom: 4,
    color: "#666",
    fontSize: 14,
  },
  department: {
    color: "#999",
    fontSize: 12,
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    marginBottom: 16,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    color: "#666",
    fontWeight: "500",
    fontSize: 13,
  },
  infoValue: {
    flex: 1,
    color: "#333",
    textAlign: "right",
    fontSize: 14,
    fontWeight: "400",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyUserState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noUserText: {
    textAlign: "center",
    color: "#666",
    marginTop: 12,
    marginBottom: 16,
    fontSize: 13,
  },
  createUserButton: {
    marginTop: 8,
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  roleButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "#FFF",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  actionIconContainer: {
    width: 40,
    height: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    borderColor: "#2196F3",
  },
  timesheetButton: {
    borderColor: "#FF9800",
  },
  leavesButton: {
    borderColor: "#4CAF50",
  },
  deleteButton: {
    borderColor: "#F44336",
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default PersonelDetailScreen;
