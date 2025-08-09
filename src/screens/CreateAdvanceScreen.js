import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { Layout, Text, Button, Input, Card } from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import usePersonelStore from "../store/personelStore";

// Backend'e uygun advance validation schema
const advanceSchema = z.object({
  amount: z
    .string()
    .min(1, "Tutar girilmelidir")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Geçerli bir tutar giriniz"),
  reason: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .optional(),
});

const CreateAdvanceScreen = ({ navigation }) => {
  const { createAdvance, isLoading } = usePersonelStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      amount: "",
      reason: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Convert amount to number
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
      };

      const result = await createAdvance(formattedData);

      if (result.success) {
        Alert.alert("Başarılı", "Avans talebiniz oluşturuldu. Onay bekliyor.", [
          {
            text: "Tamam",
            onPress: () => {
              reset();
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Hata", result.error || "Avans talebi oluşturulamadı");
      }
    } catch (error) {
      Alert.alert("Hata", "Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Layout style={styles.layout}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Text category="h5" style={styles.title}>
              Yeni Avans Talebi
            </Text>

            {/* Tutar */}
            <View style={styles.inputContainer}>
              <Text category="label" style={styles.label}>
                Tutar (₺) *
              </Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Örn: 1000"
                    keyboardType="numeric"
                    status={errors.amount ? "danger" : "basic"}
                  />
                )}
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount.message}</Text>
              )}
            </View>

            {/* Açıklama */}
            <View style={styles.inputContainer}>
              <Text category="label" style={styles.label}>
                Açıklama
              </Text>
              <Controller
                control={control}
                name="reason"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textStyle={styles.textArea}
                    placeholder="Avans sebebinizi açıklayınız (isteğe bağlı)"
                    status={errors.reason ? "danger" : "basic"}
                    maxLength={500}
                  />
                )}
              />
              {errors.reason && (
                <Text style={styles.errorText}>{errors.reason.message}</Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                style={[styles.button, styles.cancelButton]}
                appearance="outline"
                onPress={() => navigation.goBack()}
              >
                İptal
              </Button>
              <Button
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? "Oluşturuluyor..." : "Talep Oluştur"}
              </Button>
            </View>
          </Card>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#FF3D71",
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: "#8F9BB3",
  },
});

export default CreateAdvanceScreen;
