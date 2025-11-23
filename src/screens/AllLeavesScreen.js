import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Layout,
  Text,
  Card,
  Button,
  Modal,
  Input,
  Select,
  SelectItem,
  IndexPath,
  Datepicker,
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

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "Beklemede";
    case "approved":
      return "Onaylandı";
    case "rejected":
      return "Reddedildi";
    default:
      return status || "-";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#FF9800";
    case "approved":
      return "#4CAF50";
    case "rejected":
      return "#F44336";
    default:
      return "#9E9E9E";
  }
};

const getLeaveIdentifier = (entry) =>
  entry.id || entry._id || entry.leaveId || entry.uuid || entry.code;

const AllLeavesScreen = ({ navigation, route }) => {
  const { user } = useAuthStore();
  const {
    allLeaves,
    fetchAllLeaves,
    fetchAllApprovedLeaves,
    fetchAllRejectedLeaves,
    fetchPendingLeaves,
    approveLeave,
    reviseLeave,
    allLeavesPagination,
    isLoading,
    setCurrentPageName,
  } = usePersonelStore();

  // Route parametresinden initialStatus al (varsa)
  const initialStatus = route?.params?.initialStatus || "all";
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [approvalModal, setApprovalModal] = useState({
    visible: false,
    status: "approved",
    leave: null,
  });
  const [approvalNote, setApprovalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);

  const statusOptions = [
    { id: "all", title: "Tümü" },
    { id: "pending", title: "Beklemede" },
    { id: "approved", title: "Onaylandı" },
    { id: "rejected", title: "Reddedildi" },
  ];

  const typeOptions = [
    { id: "all", title: "Tümü" },
    { id: "günlük", title: "Günlük İzin" },
    { id: "yıllık", title: "Yıllık İzin" },
    { id: "mazeret", title: "Mazeret İzni" },
  ];

  const loadLeaves = useCallback(async () => {
    if (selectedStatus === "approved") {
      await fetchAllApprovedLeaves(1, 50, true);
    } else if (selectedStatus === "rejected") {
      await fetchAllRejectedLeaves(1, 50, true);
    } else if (selectedStatus === "pending") {
      await fetchPendingLeaves(1, 50, true);
    } else {
      await fetchAllLeaves(
        1,
        50,
        selectedStatus === "all" ? null : selectedStatus,
        selectedType === "all" ? null : selectedType,
        true,
        startDate ? startDate.toISOString().split("T")[0] : null,
        endDate ? endDate.toISOString().split("T")[0] : null
      );
    }
  }, [
    selectedStatus,
    selectedType,
    startDate,
    endDate,
    fetchAllLeaves,
    fetchAllApprovedLeaves,
    fetchAllRejectedLeaves,
    fetchPendingLeaves,
  ]);

  useFocusEffect(
    useCallback(() => {
      setCurrentPageName("AllLeaves");
      // Route parametresinden initialStatus varsa, onu kullan
      if (route?.params?.initialStatus) {
        setSelectedStatus(route.params.initialStatus);
      }
      setTimeout(() => {
        loadLeaves();
      }, 0);
    }, [loadLeaves, route?.params?.initialStatus, setCurrentPageName])
  );

  useEffect(() => {
    if (shouldReload) {
      setTimeout(() => {
        loadLeaves();
        setShouldReload(false);
      }, 0);
    }
  }, [shouldReload, loadLeaves]);

  const handleRefresh = () => {
    loadLeaves();
  };

  const handleStatusChange = (index) => {
    const status = statusOptions[index.row]?.id || "all";
    setSelectedStatus(status);
    setTimeout(() => {
      loadLeaves();
    }, 0);
  };

  const handleTypeChange = (index) => {
    const type = typeOptions[index.row]?.id || "all";
    setSelectedType(type);
    setTimeout(() => {
      loadLeaves();
    }, 0);
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
        personel: {
          id: employeeId,
          firstName: employeeName.split(" ")[0],
          lastName: employeeName.split(" ").slice(1).join(" "),
        },
      },
    });
  };

  const handleViewEmployeeLeaves = (employeeId, employeeName) => {
    navigation.navigate("Personel", {
      screen: "EmployeeLeaves",
      params: {
        employeeId,
        employeeName,
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
    const status = item.status || "pending";
    const statusColor = getStatusColor(status);

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
          <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
            <Text style={styles.statusChipText}>{getStatusText(status)}</Text>
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

        {(item.approvalNote || item.note) && (
          <View style={styles.notesContainer}>
            <Text category="s2" style={styles.detailLabel}>
              {status === "approved"
                ? "Onay Notu:"
                : status === "rejected"
                ? "Ret Notu:"
                : "Not:"}
            </Text>
            <Text category="p2">{item.approvalNote || item.note}</Text>
          </View>
        )}

        {item.approvedAt && (
          <View style={styles.detailRow}>
            <Text category="s2" style={styles.detailLabel}>
              {status === "approved" ? "Onaylanma Tarihi:" : "Red Tarihi:"}
            </Text>
            <Text category="p2">{formatDate(item.approvedAt)}</Text>
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
            appearance="ghost"
            status="info"
            style={styles.actionButton}
            onPress={() => handleViewEmployeeLeaves(employeeId, employeeName)}
          >
            İzinleri Gör
          </Button>
          {status === "pending" && (
            <>
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
            </>
          )}
        </View>
      </Card>
    );
  };

  const selectedStatusIndex = new IndexPath(
    statusOptions.findIndex((opt) => opt.id === selectedStatus)
  );
  const selectedTypeIndex = new IndexPath(
    typeOptions.findIndex((opt) => opt.id === selectedType)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Layout style={styles.container}>
        <View style={styles.header}>
          <Text category="h4" style={styles.title}>
            Tüm İzinler
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Ionicons
              name={showFilters ? "filter" : "filter-outline"}
              size={24}
              color="#2196F3"
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Card style={styles.filterCard}>
            <Text category="s1" style={styles.filterTitle}>
              Filtreler
            </Text>
            <View style={styles.filterRow}>
              <Text category="s2" style={styles.filterLabel}>
                Durum:
              </Text>
              <Select
                selectedIndex={selectedStatusIndex}
                value={statusOptions.find((opt) => opt.id === selectedStatus)?.title}
                onSelect={handleStatusChange}
                style={styles.filterSelect}
              >
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.id} title={opt.title} />
                ))}
              </Select>
            </View>
            <View style={styles.filterRow}>
              <Text category="s2" style={styles.filterLabel}>
                İzin Türü:
              </Text>
              <Select
                selectedIndex={selectedTypeIndex}
                value={typeOptions.find((opt) => opt.id === selectedType)?.title}
                onSelect={handleTypeChange}
                style={styles.filterSelect}
              >
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.id} title={opt.title} />
                ))}
              </Select>
            </View>
            <View style={styles.filterRow}>
              <Text category="s2" style={styles.filterLabel}>
                Başlangıç Tarihi:
              </Text>
              <Datepicker
                date={startDate}
                onSelect={setStartDate}
                placeholder="Seçiniz"
                style={styles.filterDatepicker}
              />
            </View>
            <View style={styles.filterRow}>
              <Text category="s2" style={styles.filterLabel}>
                Bitiş Tarihi:
              </Text>
              <Datepicker
                date={endDate}
                onSelect={setEndDate}
                placeholder="Seçiniz"
                style={styles.filterDatepicker}
              />
            </View>
            <Button
              size="small"
              appearance="ghost"
              status="basic"
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
                setSelectedType("all");
                setSelectedStatus("all");
                setTimeout(() => {
                  loadLeaves();
                }, 0);
              }}
              style={styles.clearFiltersButton}
            >
              Filtreleri Temizle
            </Button>
          </Card>
        )}

        <View style={styles.summaryRow}>
          <Text category="c1" appearance="hint">
            Toplam: {allLeavesPagination.total || 0}
          </Text>
        </View>

        <FlatList
          data={allLeaves}
          keyExtractor={(item, index) =>
            getLeaveIdentifier(item) || `all-leave-${index}`
          }
          renderItem={renderLeave}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#9E9E9E" />
              <Text category="s1" style={styles.emptyText}>
                İzin kaydı bulunamadı
              </Text>
              <Text category="c1" appearance="hint" style={styles.emptyHint}>
                Filtreleri değiştirerek tekrar deneyin.
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  filterCard: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    marginBottom: 4,
  },
  filterSelect: {
    marginTop: 4,
  },
  filterDatepicker: {
    marginTop: 4,
  },
  clearFiltersButton: {
    marginTop: 8,
  },
  summaryRow: {
    marginBottom: 12,
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

export default AllLeavesScreen;

