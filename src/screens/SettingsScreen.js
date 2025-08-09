import React from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  Layout,
  Text,
  Card,
  Button,
  Divider,
  ListItem,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthStore from "../store/authStore";

const SettingsScreen = () => {
  const { user, business, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      "Personelim v1.0.0",
      "Personel takip ve yönetim sistemi\n\nGeliştirici: Your Company\nİletişim: info@yourcompany.com"
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
        <Text category="h4" style={styles.title}>
          Ayarlar
        </Text>

        <ScrollView style={styles.scrollView}>
          {/* Kullanıcı Bilgileri */}
          <Card style={styles.card}>
            <Text category="h6" style={styles.cardTitle}>
              Kullanıcı Bilgileri
            </Text>

            <View style={styles.infoRow}>
              <Text category="s1" style={styles.label}>
                Ad:
              </Text>
              <Text category="p1">{user?.name || "Bilinmiyor"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text category="s1" style={styles.label}>
                Email:
              </Text>
              <Text category="p1">{user?.email || "Bilinmiyor"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text category="s1" style={styles.label}>
                Rol:
              </Text>
              <Text category="p1">{user?.role || "Bilinmiyor"}</Text>
            </View>
          </Card>

          {/* İşletme Bilgileri */}
          {business && (
            <Card style={styles.card}>
              <Text category="h6" style={styles.cardTitle}>
                İşletme Bilgileri
              </Text>

              <View style={styles.infoRow}>
                <Text category="s1" style={styles.label}>
                  İşletme Adı:
                </Text>
                <Text category="p1">{business.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text category="s1" style={styles.label}>
                  Email:
                </Text>
                <Text category="p1">{business.email}</Text>
              </View>
            </Card>
          )}

          {/* Ayarlar */}
          <Card style={styles.card}>
            <Text category="h6" style={styles.cardTitle}>
              Genel Ayarlar
            </Text>

            <ListItem
              title="Profil Düzenle"
              onPress={() =>
                Alert.alert("Yakında", "Bu özellik yakında eklenecek")
              }
              style={styles.listItem}
            />

            <Divider />

            <ListItem
              title="Şifre Değiştir"
              onPress={() =>
                Alert.alert("Yakında", "Bu özellik yakında eklenecek")
              }
              style={styles.listItem}
            />

            <Divider />

            <ListItem
              title="Bildirim Ayarları"
              onPress={() =>
                Alert.alert("Yakında", "Bu özellik yakında eklenecek")
              }
              style={styles.listItem}
            />
          </Card>

          {/* Yardım */}
          <Card style={styles.card}>
            <Text category="h6" style={styles.cardTitle}>
              Yardım & Destek
            </Text>

            <ListItem
              title="SSS"
              onPress={() =>
                Alert.alert("Yakında", "Bu özellik yakında eklenecek")
              }
              style={styles.listItem}
            />

            <Divider />

            <ListItem
              title="İletişim"
              onPress={() =>
                Alert.alert("Yakında", "Bu özellik yakında eklenecek")
              }
              style={styles.listItem}
            />

            <Divider />

            <ListItem
              title="Hakkında"
              onPress={handleAbout}
              style={styles.listItem}
            />
          </Card>

          {/* Çıkış */}
          <Button
            style={styles.logoutButton}
            status="danger"
            onPress={handleLogout}
          >
            Çıkış Yap
          </Button>
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    minWidth: 80,
  },
  listItem: {
    paddingVertical: 12,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default SettingsScreen;
