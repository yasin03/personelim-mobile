import React from "react";
import { StyleSheet } from "react-native";
import { Layout, Text, Spinner } from "@ui-kitten/components";

const LoadingScreen = () => {
  return (
    <Layout style={styles.container}>
      <Spinner size="large" />
      <Text category="h6" style={styles.text}>
        Yükleniyor...
      </Text>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
  },
});

export default LoadingScreen;
