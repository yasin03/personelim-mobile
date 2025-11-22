import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Layout,
  Text,
  Card,
  Button,
  Modal,
  Input,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import usePersonelStore from "../store/personelStore";
import useAuthStore from "../store/authStore";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString("tr-TR");
  } catch (error) {
    return value;
  }
};

const getLeaveTypeText = (type) => {
  switch (type) {
    case "günlük":
      return "Günlük İzin";
    case "yıllık":
      return "Yıllık İzin";
    case "mazeret":
      return "Mazeret İzni";
    default:
      return type || "-";
  }
};

const getLeaveIdentifier = (entry) =>
  entry.id || entry._id || entry.leaveId || entry.uuid || entry.code;

const PendingLeavesScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const {
    pendingLeaves,
    fetchPendingLeaves,
    approveLeave,
    reviseLeave,
    pendingLeavesPagination,
    isLoading,
  } = usePersonelStore();

  const [approvalModal, setApprovalModal] = useState({
    visible: false,
    status: "approved",
    leave: null,
  });
  const [approvalNote, setApprovalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPendingLeaves();
    }, [fetchPendingLeaves])
  );

  useEffect(() => {
    if (shouldReload) {
      fetchPendingLeaves();
      setShouldReload(false);
    }
  }, [shouldReload, fetchPendingLeaves]);

  const handleRefresh = () => {
    fetchPendingLeaves();
  };

  const openApprovalModal = (leave, status) => {
    setApprovalModal({
      visible: true,
      status,
      leave,
    });
    setApprovalNote(leave?.approvalNote || "");
  };

  const closeApprovalModal = () => {
    if (isSubmitting) {
      return;
    }
    setApprovalModal({
      visible: false,
      status: "approved",
      leave: null,
    });
    setApprovalNote("");
  };

  const handleSubmitApproval = async () => {
    if (!approvalModal.leave) {
      return;
    }
    const leaveId = getLeaveIdentifier(approvalModal.leave);
    const employeeId =
      approvalModal.leave.employeeId ||
      approvalModal.leave.employee?.id ||
      approvalModal.leave.employee?._id;
    if (!leaveId || !employeeId) {
      Alert.alert("Hata", "İzin kaydının kimliği bulunamadı.");
      return;
    }

    setIsSubmitting(true);
    const result = await approveLeave(
      employeeId,
      leaveId,
      approvalModal.status,
      approvalNote.trim() === "" ? null : approvalNote.trim()
    );
    setIsSubmitting(false);

    if (!result.success) {
      Alert.alert(
        "Hata",
        result.error || "İzin kaydı güncellenirken bir hata oluştu"
      );
    } else {
      closeApprovalModal();
      setTimeout(() => {
        setShouldReload(true);
      }, 0);
    }
  };

  const handleViewEmployee = (employeeId, employeeName) => {
    navigation.navigate("Personel", {
      screen: "PersonelDetail",
      params: {
        personel: { id: employeeId, firstName: employeeName.split(" ")[0], lastName: employeeName.split(" ").slice(1).join(" ") },
      },
    });
  };

  const renderLeave = ({ item }) => {
    const employee = item.employee || {};
    const employeeName =
      item.employeeName ||
      employee.name ||
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      employee.email ||
      "Bilinmeyen Çalışan";
    const employeeId = item.employeeId || employee.id || employee._id;

    return (
      <Card style={styles.leaveCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar-outline" size={22} color="#2196F3" />
            <View style={styles.headerText}>
              <Text category="s1">{employeeName}</Text>
              <Text category="c1" appearance="hint">
                {getLeaveTypeText(item.type)}
                {employee.department ? ` • ${employee.department}` : ""}
                {employee.position ? ` • ${employee.position}` : ""}
              </Text>
            </View>
          </View>
          <View style={[styles.statusChip, { backgroundColor: "#FF9800" }]}>
            <Text style={styles.statusChipText}>Beklemede</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text category="s2" style={styles.detailLabel}>
            Tarih:
          </Text>
          <Text category="p2">
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>

        {item.reason && (
          <View style={styles.notesContainer}>
            <Text category="s2" style={styles.detailLabel}>
              Açıklama:
            </Text>
            <Text category="p2">{item.reason}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <Button
            size="small"
            appearance="ghost"
            status="info"
            style={styles.actionButton}
            onPress={() => handleViewEmployee(employeeId, employeeName)}
          >
            Personeli Gör
          </Button>
          <Button
            size="small"
            status="success"
            style={styles.actionButton}
            onPress={() => openApprovalModal(item, "approved")}
          >
            Onayla
          </Button>
          <Button
            size="small"
            status="danger"
            appearance="outline"
            style={styles.actionButton}
            onPress={() => openApprovalModal(item, "rejected")}
          >
            Reddet
          </Button>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Layout style={styles.container}>
        <View style={styles.header}>
          <Text category="h4" style={styles.title}>
            Bekleyen İzin Talepleri
          </Text>
          <Text category="c1" appearance="hint">
            Toplam: {pendingLeavesPagination.total || 0}
          </Text>
        </View>

        <FlatList
          data={pendingLeaves}
          keyExtractor={(item, index) =>
            getLeaveIdentifier(item) || `pending-leave-${index}`
          }
          renderItem={renderLeave}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" />
              <Text category="s1" style={styles.emptyText}>
                Bekleyen izin talebi yok
              </Text>
              <Text category="c1" appearance="hint" style={styles.emptyHint}>
                Tüm izin talepleri onaylandı veya reddedildi.
              </Text>
            </View>
          }
        />

        <Modal
          visible={approvalModal.visible}
          backdropStyle={styles.modalBackdrop}
          onBackdropPress={closeApprovalModal}
        >
          <Card disabled style={styles.modalCard}>
            <Text category="h6" style={styles.modalTitle}>
              {approvalModal.status === "approved"
                ? "İzni Onayla"
                : "İzni Reddet"}
            </Text>
            <Text category="c1" appearance="hint" style={styles.modalDescription}>
              {approvalModal.status === "approved"
                ? "Gerekli görüyorsanız izin talebi için kısa bir açıklama ekleyin."
                : "Reddetme sebebini not olarak iletin (isteğe bağlı)."}
            </Text>
            <Input
              label="Not (opsiyonel)"
              placeholder="Açıklama ekleyin..."
              value={approvalNote}
              multiline
              textStyle={styles.modalInput}
              onChangeText={setApprovalNote}
              style={styles.modalInputContainer}
            />
            <View style={styles.modalActions}>
              <Button
                appearance="ghost"
                status="basic"
                onPress={closeApprovalModal}
                disabled={isSubmitting}
                style={styles.modalButton}
              >
                İptal
              </Button>
              <Button
                status={approvalModal.status === "approved" ? "success" : "danger"}
                onPress={handleSubmitApproval}
                disabled={isSubmitting}
                style={styles.modalButton}
              >
                {isSubmitting
                  ? "Gönderiliyor..."
                  : approvalModal.status === "approved"
                  ? "Onayla"
                  : "Reddet"}
              </Button>
            </View>
          </Card>
        </Modal>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  leaveCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerText: {
    flexShrink: 1,
  },
  statusChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusChipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    color: "#666",
  },
  notesContainer: {
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "#333",
  },
  emptyHint: {
    textAlign: "center",
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: 320,
  },
  modalTitle: {
    marginBottom: 8,
  },
  modalDescription: {
    marginBottom: 12,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default PendingLeavesScreen;

