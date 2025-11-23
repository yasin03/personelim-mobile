import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, Card, Modal } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import usePersonelStore from "../store/personelStore";

const DebugButton = () => {
  const {
    currentPageResponses,
    currentPageName,
  } = usePersonelStore();
  const [debugModalVisible, setDebugModalVisible] = useState(false);

  // Mevcut sayfanın adını al (store'dan)
  const pageName = currentPageName || "Unknown";
  const pageResponses = currentPageResponses[pageName] || [];

  return (
    <>
      {/* Debug Button */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => setDebugModalVisible(true)}
      >
        <Ionicons name="bug-outline" size={20} color="#666" />
      </TouchableOpacity>

      {/* Debug Modal */}
      <Modal
        visible={debugModalVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setDebugModalVisible(false)}
      >
        <Card style={styles.debugModalCard} disabled={true}>
          <View style={styles.debugModalHeader}>
            <Text category="h6">Backend Response Debug</Text>
            <Button
              size="small"
              appearance="ghost"
              onPress={() => setDebugModalVisible(false)}
            >
              Kapat
            </Button>
          </View>

          <ScrollView style={styles.debugScrollView}>
            <View style={styles.debugPageInfo}>
              <Text category="s1" style={styles.debugPageName}>
                Sayfa: {pageName}
              </Text>
              <Text category="c2" style={styles.debugResponseCount}>
                {pageResponses.length} response kaydedildi
              </Text>
            </View>

            {pageResponses.length === 0 ? (
              <View style={styles.debugEmpty}>
                <Text category="s2" appearance="hint">
                  Bu sayfada henüz response kaydedilmedi
                </Text>
              </View>
            ) : (
              pageResponses.map((response, index) => (
                <View key={index} style={styles.debugSection}>
                  <Text category="s1" style={styles.debugSectionTitle}>
                    Response #{pageResponses.length - index}
                  </Text>
                  <Text category="c1" style={styles.debugTimestamp}>
                    {response.timestamp || "Tarih yok"}
                  </Text>
                  <Text category="c2" style={styles.debugStatus}>
                    Status: {response.status || "N/A"} | Success: {response.success ? "Yes" : "No"}
                  </Text>
                  {response.error && (
                    <Text category="s2" style={styles.debugError}>
                      Error: {response.error}
                    </Text>
                  )}
                  {response.endpoint && (
                    <Text category="c2" style={styles.debugEndpoint}>
                      Endpoint: {response.endpoint}
                    </Text>
                  )}
                  <Text category="c1" style={styles.debugJson}>
                    {JSON.stringify(response, null, 2)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </Card>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  debugButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  debugModalCard: {
    width: "90%",
    maxHeight: "80%",
  },
  debugModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  debugScrollView: {
    maxHeight: 500,
  },
  debugSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  debugSectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2196F3",
  },
  debugTimestamp: {
    color: "#666",
    marginBottom: 4,
    fontSize: 11,
  },
  debugStatus: {
    color: "#666",
    marginBottom: 8,
    fontSize: 11,
  },
  debugError: {
    color: "#F44336",
    marginBottom: 8,
    fontWeight: "bold",
  },
  debugJson: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    fontSize: 10,
    fontFamily: "monospace",
  },
  debugPageInfo: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#2196F3",
  },
  debugPageName: {
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 4,
  },
  debugResponseCount: {
    color: "#666",
    fontSize: 11,
  },
  debugEmpty: {
    padding: 24,
    alignItems: "center",
  },
  debugEndpoint: {
    color: "#666",
    marginBottom: 8,
    fontSize: 11,
    fontStyle: "italic",
  },
});

export default DebugButton;

