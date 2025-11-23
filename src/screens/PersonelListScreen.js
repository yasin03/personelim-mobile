import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import {
  Layout,
  Text,
  Button,
  Card,
  ListItem,
  Divider,
  Input,
  Icon,
  Avatar,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, CommonActions } from "@react-navigation/native";
import usePersonelStore from "../store/personelStore";

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
  // Önce ID'yi dene, yoksa ismi kullan
  const identifier = personel.id || personel._id || `${personel.firstName}${personel.lastName}` || "default";
  
  // String'i sayıya çevir (basit hash)
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Hash'i pozitif sayıya çevir ve renk dizisinin index'ini al
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

const PersonelListScreen = ({ navigation }) => {
  const { personelList, isLoading, fetchPersonelList, setCurrentPageName } = usePersonelStore();
  const [searchText, setSearchText] = useState("");

  // Arama filtresi - personel ismi, pozisyon ve departmana göre
  const filteredPersonelList = useMemo(() => {
    if (!searchText.trim()) {
      return personelList;
    }

    const searchLower = searchText.toLowerCase().trim();
    return personelList.filter((personel) => {
      const fullName =
        `${personel.firstName} ${personel.lastName}`.toLowerCase();
      const position = (personel.position || "").toLowerCase();
      const department = (personel.department || "").toLowerCase();

      return (
        fullName.includes(searchLower) ||
        position.includes(searchLower) ||
        department.includes(searchLower)
      );
    });
  }, [personelList, searchText]);

  // İlk yükleme
  useEffect(() => {
    fetchPersonelList();
  }, [fetchPersonelList]);

  // Sayfa her açıldığında listeyi yenile
  useFocusEffect(
    React.useCallback(() => {
      setCurrentPageName("PersonelList");
      fetchPersonelList();
    }, [fetchPersonelList, setCurrentPageName])
  );

  const handleRefresh = () => {
    fetchPersonelList();
  };

  const renderPersonelItem = ({ item }) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    const initials = `${item.firstName?.[0] ?? ""}${item.lastName?.[0] ?? ""}`;
    const position = item.position || "Pozisyon belirtilmemiş";
    const department = item.department || "Departman belirtilmemiş";

    const bgColor = getAvatarColor(item);

    // Profil resmi varsa Avatar göster, yoksa harfli kutu
    const AvatarComponent = item.profilePictureUrl ? (
      <Avatar source={{ uri: item.profilePictureUrl }} style={styles.avatar} />
    ) : (
      <View style={[styles.customAvatar, { backgroundColor: bgColor }]}>
        <Text style={styles.initialText}>{initials.toUpperCase()}</Text>
      </View>
    );

    return (
      <ListItem
        style={styles.listItem}
        title={() => <Text category="s1">{fullName}</Text>}
        description={() => (
          <Text category="c1" appearance="hint">
            {position} · {department}
          </Text>
        )}
        accessoryLeft={() => AvatarComponent}
        onPress={() =>
          navigation.navigate("PersonelDetail", { personel: item })
        }
      />
    );
  };
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text category="h5" style={styles.title}>
            Personel Listesi
          </Text>
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={() => navigation.navigate("ArchivedPersonel")}
            activeOpacity={0.7}
          >
            <Ionicons name="archive-outline" size={20} color="#2196F3" />
            <Text style={styles.archiveButtonText}>Arşiv</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <Input
          placeholder="Personel, pozisyon veya departman ara..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          accessoryLeft={() => <Text>🔍</Text>}
          accessoryRight={
            searchText
              ? () => (
                  <Text
                    onPress={() => setSearchText("")}
                    style={{ fontSize: 16, color: "#8F9BB3" }}
                  >
                    ✕
                  </Text>
                )
              : null
          }
        />

        {/* List */}
        <View style={styles.listCard}>
          {filteredPersonelList.length === 0 ? (
            <View style={styles.emptyState}>
              {searchText ? (
                <>
                  <Text category="s1" style={styles.emptyText}>
                    Arama kriterinize uygun personel bulunamadı
                  </Text>
                  <Text category="c1" style={styles.emptyText}>
                    "{searchText}" için sonuç yok
                  </Text>
                </>
              ) : (
                <>
                  <Text category="s1" style={styles.emptyText}>
                    Henüz personel eklenmemiş
                  </Text>
                  <Text category="c1" style={styles.emptyText}>
                    Loading: {isLoading ? "Evet" : "Hayır"}
                  </Text>
                  <Text category="c1" style={styles.emptyText}>
                    Liste uzunluğu: {personelList?.length || 0}
                  </Text>
                </>
              )}
            </View>
          ) : (
            <View>
              {searchText && (
                <Text category="c1" style={styles.searchResults}>
                  {filteredPersonelList.length} personel bulundu
                </Text>
              )}
              <FlatList
                data={filteredPersonelList}
                renderItem={renderPersonelItem}
                keyExtractor={(item, index) =>
                  item.id || item._id || `item-${index}`
                }
                refreshControl={
                  <RefreshControl
                    refreshing={isLoading}
                    onRefresh={handleRefresh}
                  />
                }
                style={styles.list}
              />
            </View>
          )}
        </View>
      </Layout>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddPersonel", { mode: "create" })}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  archiveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    gap: 6,
  },
  archiveButtonText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchInput: {
    marginBottom: 16,
  },
  searchResults: {
    padding: 8,
    textAlign: "center",
    opacity: 0.7,
  },
  listCard: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    height: "100%",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  customAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  initialText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2138",
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 8,
  },

  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.7,
  },
});

export default PersonelListScreen;
