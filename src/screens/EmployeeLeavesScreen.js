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
  Select,
  SelectItem,
  Datepicker,
  IndexPath,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import usePersonelStore from "../store/personelStore";

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

const statusMeta = {
  approved: { label: "Onaylandı", color: "#4CAF50", noteLabel: "Onay Notu" },
  rejected: { label: "Reddedildi", color: "#F44336", noteLabel: "Ret Notu" },
  pending: { label: "Beklemede", color: "#FF9800", noteLabel: "Not" },
};

const getLeaveIdentifier = (entry) =>
  entry.id || entry._id || entry.leaveId || entry.uuid || entry.code;

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

const EmployeeLeavesScreen = ({ route }) => {
  const { employeeId, employeeName } = route.params;

  const {
    fetchEmployeeLeaves,
    approveLeave,
    reviseLeave,
    isLoading,
    setCurrentPageName,
  } = usePersonelStore();

  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });

  const [approvalModal, setApprovalModal] = useState({
    visible: false,
    status: "approved",
    leave: null,
  });
  const [approvalNote, setApprovalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reviseModal, setReviseModal] = useState({
    visible: false,
    leave: null,
  });
  const [reviseData, setReviseData] = useState({
    type: null,
    startDate: null,
    endDate: null,
    reason: "",
    status: null,
    note: "",
  });
  const [shouldReload, setShouldReload] = useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(new IndexPath(0));
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(undefined);

  const loadLeaves = useCallback(async () => {
    const result = await fetchEmployeeLeaves(employeeId, 1, 100);
    if (result.success) {
      const leavesData = result.data?.leaves || result.data?.items || result.data || [];
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setPagination({
        total: result.data?.total || result.data?.count || leavesData.length || 0,
      });
    }
  }, [employeeId, fetchEmployeeLeaves]);

  useFocusEffect(
    useCallback(() => {
      setCurrentPageName("EmployeeLeaves");
      loadLeaves();
    }, [loadLeaves, setCurrentPageName])
  );

  useEffect(() => {
    if (shouldReload) {
      loadLeaves();
      setShouldReload(false);
    }
  }, [shouldReload, loadLeaves]);

  const handleRefresh = () => {
    loadLeaves();
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
    if (!leaveId) {
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
      setShouldReload(true);
    }
  };

  const openReviseModal = (leave) => {
    const types = ["günlük", "yıllık", "mazeret"];
    const statuses = ["pending", "approved", "rejected"];
    const typeIndex = leave.type ? types.indexOf(leave.type) : 0;
    const statusIndex = leave.status ? statuses.indexOf(leave.status) : -1;
    
    setReviseModal({
      visible: true,
      leave,
    });
    setReviseData({
      type: leave.type || types[0],
      startDate: leave.startDate ? new Date(leave.startDate) : null,
      endDate: leave.endDate ? new Date(leave.endDate) : null,
      reason: leave.reason || "",
      status: null,
      note: "",
    });
    setSelectedTypeIndex(new IndexPath(typeIndex >= 0 ? typeIndex : 0));
    setSelectedStatusIndex(statusIndex >= 0 ? new IndexPath(statusIndex) : undefined);
  };

  const closeReviseModal = () => {
    if (isSubmitting) {
      return;
    }
    setReviseModal({
      visible: false,
      leave: null,
    });
    setReviseData({
      type: "günlük",
      startDate: null,
      endDate: null,
      reason: "",
      status: null,
      note: "",
    });
    setSelectedTypeIndex(new IndexPath(0));
    setSelectedStatusIndex(undefined);
  };

  const handleSubmitRevise = async () => {
    if (!reviseModal.leave) {
      return;
    }
    const leaveId = getLeaveIdentifier(reviseModal.leave);
    if (!leaveId) {
      Alert.alert("Hata", "İzin kaydının kimliği bulunamadı.");
      return;
    }

    setIsSubmitting(true);
    const payload = {};
    if (reviseData.type) payload.type = reviseData.type;
    if (reviseData.startDate) {
      payload.startDate = reviseData.startDate.toISOString().split("T")[0];
    }
    if (reviseData.endDate) {
      payload.endDate = reviseData.endDate.toISOString().split("T")[0];
    }
    if (reviseData.reason.trim()) payload.reason = reviseData.reason.trim();
    if (reviseData.status) payload.status = reviseData.status;
    if (reviseData.note.trim()) payload.note = reviseData.note.trim();

    const result = await reviseLeave(employeeId, leaveId, payload);
    setIsSubmitting(false);

    if (!result.success) {
      Alert.alert(
        "Hata",
        result.error || "İzin kaydı revize edilirken bir hata oluştu"
      );
    } else {
      closeReviseModal();
      setShouldReload(true);
    }
  };

  const renderLeave = ({ item }) => {
    const status =
      item.status ||
      (item.approved ? "approved" : item.rejected ? "rejected" : "pending");
    const meta = statusMeta[status] || statusMeta.pending;

    return (
      <Card style={styles.leaveCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar-outline" size={22} color="#2196F3" />
            <View style={styles.headerText}>
              <Text category="s1">{getLeaveTypeText(item.type)}</Text>
              <Text category="c1" appearance="hint">
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>
          <View style={[styles.statusChip, { backgroundColor: meta.color }]}>
            <Text style={styles.statusChipText}>{meta.label}</Text>
          </View>
        </View>

        {item.reason && (
          <View style={styles.notesContainer}>
            <Text category="s2" style={styles.detailLabel}>
              Açıklama:
            </Text>
            <Text category="p2">{item.reason}</Text>
          </View>
        )}

        {item.approvalNote ? (
          <View style={styles.notesContainer}>
            <Text category="s2" style={styles.detailLabel}>
              {meta.noteLabel}:
            </Text>
            <Text category="p2">{item.approvalNote}</Text>
          </View>
        ) : null}
        {item.approvedAt ? (
          <View style={styles.detailRow}>
            <Text category="s2" style={styles.detailLabel}>
              Onaylanma:
            </Text>
            <Text category="p2">
              {formatDate(item.approvedAt)} {item.approvedBy ? `(${item.approvedBy})` : ""}
            </Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Button
            size="small"
            status="info"
            appearance="outline"
            style={styles.actionButton}
            onPress={() => openReviseModal(item)}
          >
            Revize Et
          </Button>
          {status !== "approved" && (
            <Button
              size="small"
              status="success"
              style={styles.actionButton}
              onPress={() => openApprovalModal(item, "approved")}
            >
              Onayla
            </Button>
          )}
          {status !== "rejected" && (
            <Button
              size="small"
              status="danger"
              appearance="outline"
              style={styles.actionButton}
              onPress={() => openApprovalModal(item, "rejected")}
            >
              Reddet
            </Button>
          )}
          {status !== "pending" && (
            <Button
              size="small"
              status="basic"
              appearance="outline"
              style={styles.actionButton}
              onPress={() => openApprovalModal(item, "pending")}
            >
              Beklemeye Al
            </Button>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Layout style={styles.container}>
        <View style={styles.header}>
          <Text category="h4" style={styles.title}>
            {employeeName || "Çalışan"} İzin Kayıtları
          </Text>
          <Text category="c1" appearance="hint">
            Toplam kayıt: {pagination.total || 0}
          </Text>
        </View>

        <FlatList
          data={leaves}
          keyExtractor={(item, index) =>
            getLeaveIdentifier(item) || `leave-${index}`
          }
          renderItem={renderLeave}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text category="s1" style={styles.emptyText}>
                Henüz kayıt bulunmadı
              </Text>
              <Text category="c1" appearance="hint" style={styles.emptyHint}>
                Çalışan bu güne kadar izin talebi oluşturmadı.
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
                : approvalModal.status === "rejected"
                ? "İzni Reddet"
                : "İzni Beklemeye Al"}
            </Text>
            <Text category="c1" appearance="hint" style={styles.modalDescription}>
              {approvalModal.status === "approved"
                ? "Gerekli görüyorsanız izin talebi için kısa bir açıklama ekleyin."
                : approvalModal.status === "rejected"
                ? "Reddetme sebebini not olarak iletin (isteğe bağlı)."
                : "Kayıt yeniden incelemeye alınacak. İsterseniz bilgi notu ekleyin."}
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
                status={
                  approvalModal.status === "approved"
                    ? "success"
                    : approvalModal.status === "rejected"
                    ? "danger"
                    : "primary"
                }
                onPress={handleSubmitApproval}
                disabled={isSubmitting}
                style={styles.modalButton}
              >
                {isSubmitting
                  ? "Gönderiliyor..."
                  : approvalModal.status === "approved"
                  ? "Onayla"
                  : approvalModal.status === "rejected"
                  ? "Reddet"
                  : "Kaydet"}
              </Button>
            </View>
          </Card>
        </Modal>

        <Modal
          visible={reviseModal.visible}
          backdropStyle={styles.modalBackdrop}
          onBackdropPress={closeReviseModal}
        >
          <Card disabled style={styles.modalCard}>
            <Text category="h6" style={styles.modalTitle}>
              İzni Revize Et
            </Text>
            <Text category="c1" appearance="hint" style={styles.modalDescription}>
              İzin bilgilerini düzenleyebilir ve aynı anda onaylayabilirsiniz.
            </Text>

            <Select
              label="İzin Tipi"
              placeholder="Seçiniz"
              selectedIndex={selectedTypeIndex}
              value={
                selectedTypeIndex && selectedTypeIndex.row !== undefined
                  ? ["Günlük İzin", "Yıllık İzin", "Mazeret İzni"][selectedTypeIndex.row]
                  : "Seçiniz"
              }
              onSelect={(index) => {
                if (index) {
                  setTimeout(() => {
                    setSelectedTypeIndex(index);
                    const types = ["günlük", "yıllık", "mazeret"];
                    const row = index.row !== undefined ? index.row : (typeof index === "number" ? index : 0);
                    if (row >= 0 && row < types.length) {
                      setReviseData((prev) => ({ ...prev, type: types[row] }));
                    }
                  }, 0);
                }
              }}
              style={styles.modalInputContainer}
            >
              <SelectItem title="Günlük İzin" />
              <SelectItem title="Yıllık İzin" />
              <SelectItem title="Mazeret İzni" />
            </Select>

            <Datepicker
              label="Başlangıç Tarihi"
              date={reviseData.startDate}
              onSelect={(date) => {
                setTimeout(() => {
                  setReviseData((prev) => ({ ...prev, startDate: date }));
                }, 0);
              }}
              style={styles.modalInputContainer}
            />

            <Datepicker
              label="Bitiş Tarihi"
              date={reviseData.endDate}
              onSelect={(date) => {
                setTimeout(() => {
                  setReviseData((prev) => ({ ...prev, endDate: date }));
                }, 0);
              }}
              style={styles.modalInputContainer}
            />

            <Input
              label="Açıklama"
              placeholder="İzin açıklaması..."
              value={reviseData.reason}
              multiline
              textStyle={styles.modalInput}
              onChangeText={(text) => {
                setReviseData((prev) => ({ ...prev, reason: text }));
              }}
              style={styles.modalInputContainer}
            />

            <Select
              label="Onay Durumu (Opsiyonel)"
              placeholder="Seçiniz"
              selectedIndex={selectedStatusIndex}
              value={
                selectedStatusIndex && selectedStatusIndex.row !== undefined
                  ? ["Beklemede", "Onaylandı", "Reddedildi"][selectedStatusIndex.row]
                  : "Seçiniz"
              }
              onSelect={(index) => {
                if (index) {
                  setTimeout(() => {
                    setSelectedStatusIndex(index);
                    const statuses = ["pending", "approved", "rejected"];
                    const row = index.row !== undefined ? index.row : (typeof index === "number" ? index : 0);
                    if (row >= 0 && row < statuses.length) {
                      setReviseData((prev) => ({ ...prev, status: statuses[row] }));
                    }
                  }, 0);
                }
              }}
              style={styles.modalInputContainer}
            >
              <SelectItem title="Beklemede" />
              <SelectItem title="Onaylandı" />
              <SelectItem title="Reddedildi" />
            </Select>

            <Input
              label="Not (Opsiyonel)"
              placeholder="Revize notu..."
              value={reviseData.note}
              multiline
              textStyle={styles.modalInput}
              onChangeText={(text) => {
                setReviseData((prev) => ({ ...prev, note: text }));
              }}
              style={styles.modalInputContainer}
            />

            <View style={styles.modalActions}>
              <Button
                appearance="ghost"
                status="basic"
                onPress={closeReviseModal}
                disabled={isSubmitting}
                style={styles.modalButton}
              >
                İptal
              </Button>
              <Button
                status="info"
                onPress={handleSubmitRevise}
                disabled={isSubmitting}
                style={styles.modalButton}
              >
                {isSubmitting ? "Gönderiliyor..." : "Revize Et"}
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
    gap: 12,
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
    maxHeight: "90%",
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

export default EmployeeLeavesScreen;

