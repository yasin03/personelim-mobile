import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  Layout,
  Text,
  Button,
  Input,
  Select,
  SelectItem,
  Datepicker,
  Card,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import usePersonelStore from "../store/personelStore";

// Backend'e uygun leave validation schema
const leaveSchema = z
  .object({
    type: z.enum(["günlük", "yıllık", "mazeret"], {
      required_error: "İzin türü seçilmelidir",
      invalid_type_error: "Geçersiz izin türü",
    }),
    startDate: z.date({
      required_error: "Başlangıç tarihi gereklidir",
      invalid_type_error: "Geçerli bir tarih seçiniz",
    }),
    endDate: z.date({
      required_error: "Bitiş tarihi gereklidir",
      invalid_type_error: "Geçerli bir tarih seçiniz",
    }),
    reason: z
      .string()
      .max(500, "Açıklama en fazla 500 karakter olabilir")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
      path: ["endDate"],
    }
  );

const CreateLeaveScreen = ({ navigation }) => {
  const { createLeave, isLoading } = usePersonelStore();
  const [selectedType, setSelectedType] = useState(null);

  const leaveTypes = [
    { id: "günlük", title: "Günlük İzin" },
    { id: "yıllık", title: "Yıllık İzin" },
    { id: "mazeret", title: "Mazeret İzni" },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: "",
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Format dates to YYYY-MM-DD format for backend
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString().split("T")[0],
        endDate: data.endDate.toISOString().split("T")[0],
        type: selectedType?.id || data.type,
      };

      const result = await createLeave(formattedData);

      if (result.success) {
        Alert.alert("Başarılı", "İzin talebiniz oluşturuldu. Onay bekliyor.", [
          {
            text: "Tamam",
            onPress: () => {
              reset();
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Hata", result.error || "İzin talebi oluşturulamadı");
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
              Yeni İzin Talebi
            </Text>

            {/* İzin Türü */}
            <View style={styles.inputContainer}>
              <Text category="label" style={styles.label}>
                İzin Türü *
              </Text>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => {
                  const handleSelect = (index) => {
                    let selectedIndex;
                    if (typeof index === "number") {
                      selectedIndex = index;
                    } else if (index && typeof index.row === "number") {
                      selectedIndex = index.row;
                    } else {
                      return;
                    }
                    
                    if (selectedIndex >= 0 && selectedIndex < leaveTypes.length) {
                      const selected = leaveTypes[selectedIndex];
                      setSelectedType(selected);
                      onChange(selected.id);
                    }
                  };
                  
                  return (
                    <Select
                      value={selectedType?.title || "İzin türü seçiniz"}
                      onSelect={handleSelect}
                      status={errors.type ? "danger" : "basic"}
                    >
                      {leaveTypes.map((type, index) => (
                        <SelectItem key={type.id} title={type.title} />
                      ))}
                    </Select>
                  );
                }}
              />
              {errors.type && (
                <Text style={styles.errorText}>{errors.type.message}</Text>
              )}
            </View>

            {/* Başlangıç Tarihi */}
            <View style={styles.inputContainer}>
              <Text category="label" style={styles.label}>
                Başlangıç Tarihi *
              </Text>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, value } }) => (
                  <Datepicker
                    date={value}
                    onSelect={onChange}
                    status={errors.startDate ? "danger" : "basic"}
                    min={new Date()}
                  />
                )}
              />
              {errors.startDate && (
                <Text style={styles.errorText}>{errors.startDate.message}</Text>
              )}
            </View>

            {/* Bitiş Tarihi */}
            <View style={styles.inputContainer}>
              <Text category="label" style={styles.label}>
                Bitiş Tarihi *
              </Text>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, value } }) => (
                  <Datepicker
                    date={value}
                    onSelect={onChange}
                    status={errors.endDate ? "danger" : "basic"}
                    min={new Date()}
                  />
                )}
              />
              {errors.endDate && (
                <Text style={styles.errorText}>{errors.endDate.message}</Text>
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
                    placeholder="İzin sebebinizi açıklayınız (isteğe bağlı)"
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

export default CreateLeaveScreen;
