import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  Layout,
  Text,
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  IndexPath,
  Datepicker,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import usePersonelStore from "../store/personelStore";

// Zod validation schema - Backend Employee model'e uygun
const personelSchema = z.object({
  employeeCode: z
    .string()
    .min(2, "Personel kodu en az 2 karakter olmalıdır")
    .max(20, "Personel kodu en fazla 20 karakter olabilir")
    .optional(),
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  profilePictureUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      {
        message: "Geçerli bir URL giriniz",
      }
    ),
  email: z
    .string()
    .email("Geçerli bir email adresi giriniz")
    .min(1, "Email adresi gereklidir"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.trim() === "" ||
        /^(\+90|0)?[5][0-9]{9}$/.test(val.replace(/\s/g, "")),
      {
        message: "Geçerli bir Türkiye telefon numarası giriniz (05XX XXX XXXX)",
      }
    ),
  tcKimlikNo: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "" || /^\d{11}$/.test(val), {
      message: "TC Kimlik No 11 haneli sayı olmalıdır",
    }),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Erkek", "Kadın", "Diğer"]).optional(),
  address: z
    .string()
    .max(500, "Adres en fazla 500 karakter olabilir")
    .optional(),
  position: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || val.trim() === "" || (val.length >= 2 && val.length <= 100),
      {
        message: "Pozisyon 2-100 karakter arasında olmalıdır",
      }
    ),
  department: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || val.trim() === "" || (val.length >= 2 && val.length <= 100),
      {
        message: "Departman 2-100 karakter arasında olmalıdır",
      }
    ),
  contractType: z
    .enum(["Belirsiz Süreli", "Belirli Süreli", "Part-time", "Stajyer"])
    .optional(),
  workingHoursPerDay: z.number().min(1).max(24).optional(),
  startDate: z.string().min(1, "Başlangıç tarihi gereklidir"),
  terminationDate: z.string().optional(),
  salary: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "" || !isNaN(parseFloat(val)), {
      message: "Geçerli bir maaş tutarı giriniz",
    }),
  bankName: z.string().optional(),
  iban: z.string().optional(),
  insuranceInfo: z.string().optional(),
  isActive: z.boolean().optional(),
});

const departments = [
  "İnsan Kaynakları",
  "Bilgi İşlem",
  "Pazarlama",
  "Satış",
  "Muhasebe",
  "Üretim",
  "Lojistik",
  "Diğer",
];

const contractTypes = [
  "Belirsiz Süreli",
  "Belirli Süreli",
  "Part-time",
  "Stajyer",
];

const genderOptions = ["Erkek", "Kadın", "Diğer"];

const AddPersonelScreen = ({ navigation }) => {
  // Helper function to format date as DD.MM.YYYY
  const formatDateToDDMMYYYY = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Helper function to convert DD.MM.YYYY back to Date
  const parseDDMMYYYYToDate = (dateString) => {
    if (!dateString) return new Date();
    const [day, month, year] = dateString.split(".");
    return new Date(year, month - 1, day);
  };

  // Helper function to format date for backend (YYYY-MM-DD)
  const formatDateForBackend = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split(".");
    if (parts.length !== 3) return null;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const { addPersonel, isLoading, fetchPersonelList } = usePersonelStore();
  const [selectedDepartmentIndex, setSelectedDepartmentIndex] = useState(
    new IndexPath(0)
  );
  const [selectedContractIndex, setSelectedContractIndex] = useState(
    new IndexPath(0)
  );
  const [selectedGenderIndex, setSelectedGenderIndex] = useState(
    new IndexPath(0)
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(personelSchema),
    defaultValues: {
      employeeCode: "",
      firstName: "",
      lastName: "",
      profilePictureUrl: "",
      email: "",
      phoneNumber: "",
      tcKimlikNo: "",
      dateOfBirth: "",
      gender: genderOptions[0],
      address: "",
      position: "",
      department: departments[0],
      contractType: contractTypes[0],
      workingHoursPerDay: 8,
      startDate: formatDateToDDMMYYYY(new Date()),
      terminationDate: "",
      salary: "",
      bankName: "",
      iban: "",
      insuranceInfo: "",
      isActive: true,
    },
  });

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    try {
      // Backend constructor'ına uygun veri formatı
      const processedData = {
        // userId backend'de otomatik oluşturulacak veya authentication'dan gelecek
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email, // Required field
        startDate: data.startDate
          ? parseDDMMYYYYToDate(data.startDate).toISOString().split("T")[0]
          : null,
        workingHoursPerDay: data.workingHoursPerDay || 8,
        contractType:
          contractTypes[selectedContractIndex.row] || "Belirsiz Süreli",
        // Salary obje formatında - backend constructor'a uygun
        salary: {
          grossAmount:
            data.salary && data.salary.trim() !== ""
              ? parseFloat(data.salary)
              : 0,
          netAmount: 0, // Backend hesaplayacak
          currency: "TL",
          bankName:
            data.bankName && data.bankName.trim() !== "" ? data.bankName : null,
          iban: data.iban && data.iban.trim() !== "" ? data.iban : null,
        },
        // Insurance info obje formatında
        insuranceInfo: {
          sicilNo:
            data.insuranceInfo && data.insuranceInfo.trim() !== ""
              ? data.insuranceInfo
              : null,
          startDate: data.startDate
            ? parseDDMMYYYYToDate(data.startDate).toISOString().split("T")[0]
            : null,
        },
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      // Optional alanları sadece doluysa ekle
      if (data.employeeCode && data.employeeCode.trim() !== "") {
        processedData.employeeCode = data.employeeCode;
      }
      if (data.profilePictureUrl && data.profilePictureUrl.trim() !== "") {
        processedData.profilePictureUrl = data.profilePictureUrl;
      }
      if (data.phoneNumber && data.phoneNumber.trim() !== "") {
        processedData.phoneNumber = data.phoneNumber;
      }
      if (data.tcKimlikNo && data.tcKimlikNo.trim() !== "") {
        processedData.tcKimlikNo = data.tcKimlikNo;
      }
      if (data.dateOfBirth && data.dateOfBirth.trim() !== "") {
        processedData.dateOfBirth = parseDDMMYYYYToDate(data.dateOfBirth)
          .toISOString()
          .split("T")[0];
      }
      if (genderOptions[selectedGenderIndex.row]) {
        processedData.gender = genderOptions[selectedGenderIndex.row];
      }
      if (data.address && data.address.trim() !== "") {
        processedData.address = data.address;
      }
      if (data.position && data.position.trim() !== "") {
        processedData.position = data.position;
      }
      if (departments[selectedDepartmentIndex.row]) {
        processedData.department = departments[selectedDepartmentIndex.row];
      }
      if (data.terminationDate && data.terminationDate.trim() !== "") {
        processedData.terminationDate = parseDDMMYYYYToDate(
          data.terminationDate
        )
          .toISOString()
          .split("T")[0];
      }

      console.log("Processed Data for Backend:", processedData);

      const result = await addPersonel(processedData);

      if (result.success) {
        // Başarılı ekleme sonrası listeyi yenile
        await fetchPersonelList();

        Alert.alert("Başarılı", "Personel başarıyla eklendi", [
          {
            text: "Tamam",
            onPress: () => {
              reset();
              // PersonelListScreen'e yönlendir
              navigation.navigate("PersonelList");
            },
          },
        ]);
      } else {
        Alert.alert(
          "Hata",
          result.error || "Personel eklenirken bir hata oluştu"
        );
      }
    } catch (error) {
      Alert.alert("Hata", "Beklenmeyen bir hata oluştu");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Layout style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text category="h4" style={styles.title}>
            Yeni Personel Ekle
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.formCard}>
            {/* Personal Information */}
            <Text category="h6" style={styles.sectionTitle}>
              Kişisel Bilgiler
            </Text>

            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Ad *"
                  placeholder="Adını giriniz"
                  value={value}
                  onChangeText={onChange}
                  status={errors.firstName ? "danger" : "basic"}
                  caption={errors.firstName?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Soyad *"
                  placeholder="Soyadını giriniz"
                  value={value}
                  onChangeText={onChange}
                  status={errors.lastName ? "danger" : "basic"}
                  caption={errors.lastName?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email *"
                  placeholder="email@ornek.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  status={errors.email ? "danger" : "basic"}
                  caption={errors.email?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Telefon"
                  placeholder="05XX XXX XXXX"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  status={errors.phoneNumber ? "danger" : "basic"}
                  caption={errors.phoneNumber?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="tcKimlikNo"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="TC Kimlik No"
                  placeholder="12345678901"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  maxLength={11}
                  status={errors.tcKimlikNo ? "danger" : "basic"}
                  caption={errors.tcKimlikNo?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, value } }) => (
                <View style={styles.input}>
                  <Text category="label" style={styles.label}>
                    Doğum Tarihi
                  </Text>
                  <Datepicker
                    date={value ? parseDDMMYYYYToDate(value) : null}
                    onSelect={(date) => onChange(formatDateToDDMMYYYY(date))}
                    accessoryRight={() => null}
                    placeholder="Doğum tarihi seçiniz"
                    status={errors.dateOfBirth ? "danger" : "basic"}
                    max={new Date()}
                    min={new Date(1900, 0, 1)}
                  />
                  {errors.dateOfBirth && (
                    <Text style={styles.errorText}>
                      {errors.dateOfBirth.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Select
              label="Cinsiyet"
              selectedIndex={selectedGenderIndex}
              onSelect={(index) => setSelectedGenderIndex(index)}
              value={genderOptions[selectedGenderIndex.row]}
              style={styles.input}
            >
              {genderOptions.map((gender) => (
                <SelectItem key={gender} title={gender} />
              ))}
            </Select>

            {/* Work Information */}
            <Text category="h6" style={styles.sectionTitle}>
              İş Bilgileri
            </Text>

            <Controller
              control={control}
              name="employeeCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Personel Kodu"
                  placeholder="PER001"
                  value={value}
                  onChangeText={onChange}
                  status={errors.employeeCode ? "danger" : "basic"}
                  caption={errors.employeeCode?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="position"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Pozisyon"
                  placeholder="Yazılım Geliştirici"
                  value={value}
                  onChangeText={onChange}
                  status={errors.position ? "danger" : "basic"}
                  caption={errors.position?.message}
                  style={styles.input}
                />
              )}
            />

            <Select
              label="Departman"
              selectedIndex={selectedDepartmentIndex}
              onSelect={(index) => setSelectedDepartmentIndex(index)}
              value={departments[selectedDepartmentIndex.row]}
              style={styles.input}
            >
              {departments.map((department) => (
                <SelectItem key={department} title={department} />
              ))}
            </Select>

            <Select
              label="Sözleşme Türü"
              selectedIndex={selectedContractIndex}
              onSelect={(index) => setSelectedContractIndex(index)}
              value={contractTypes[selectedContractIndex.row]}
              style={styles.input}
            >
              {contractTypes.map((contractType) => (
                <SelectItem key={contractType} title={contractType} />
              ))}
            </Select>

            <Controller
              control={control}
              name="salary"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Brüt Maaş (TL)"
                  placeholder="15000"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  status={errors.salary ? "danger" : "basic"}
                  caption={errors.salary?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="bankName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Banka Adı"
                  placeholder="Ziraat Bankası"
                  value={value}
                  onChangeText={onChange}
                  status={errors.bankName ? "danger" : "basic"}
                  caption={errors.bankName?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="iban"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="IBAN"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  value={value}
                  onChangeText={onChange}
                  status={errors.iban ? "danger" : "basic"}
                  caption={errors.iban?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <View style={styles.input}>
                  <Text category="label" style={styles.label}>
                    İşe Başlama Tarihi *
                  </Text>
                  <Datepicker
                    date={value ? parseDDMMYYYYToDate(value) : new Date()}
                    onSelect={(date) => onChange(formatDateToDDMMYYYY(date))}
                    accessoryRight={() => null}
                    placeholder="İşe başlama tarihi seçiniz"
                    status={errors.startDate ? "danger" : "basic"}
                    min={new Date(2020, 0, 1)}
                  />
                  {errors.startDate && (
                    <Text style={styles.errorText}>
                      {errors.startDate.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="terminationDate"
              render={({ field: { onChange, value } }) => (
                <View style={styles.input}>
                  <Text category="label" style={styles.label}>
                    İşten Ayrılma Tarihi
                  </Text>
                  <Datepicker
                    date={value ? parseDDMMYYYYToDate(value) : null}
                    onSelect={(date) => onChange(formatDateToDDMMYYYY(date))}
                    accessoryRight={() => null}
                    placeholder="İşten ayrılma tarihi seçiniz (isteğe bağlı)"
                    status={errors.terminationDate ? "danger" : "basic"}
                    min={new Date(2020, 0, 1)}
                  />
                  {errors.terminationDate && (
                    <Text style={styles.errorText}>
                      {errors.terminationDate.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="workingHoursPerDay"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Günlük Çalışma Saati"
                  placeholder="8"
                  value={value?.toString() || "8"}
                  onChangeText={(text) => onChange(parseInt(text) || 8)}
                  keyboardType="numeric"
                  status={errors.workingHoursPerDay ? "danger" : "basic"}
                  caption={errors.workingHoursPerDay?.message}
                  style={styles.input}
                />
              )}
            />

            {/* Additional Information */}
            <Text category="h6" style={styles.sectionTitle}>
              Ek Bilgiler
            </Text>

            <Controller
              control={control}
              name="profilePictureUrl"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Profil Resmi URL"
                  placeholder="https://example.com/photo.jpg"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="url"
                  autoCapitalize="none"
                  status={errors.profilePictureUrl ? "danger" : "basic"}
                  caption={errors.profilePictureUrl?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Adres"
                  placeholder="Tam adres"
                  value={value}
                  onChangeText={onChange}
                  multiline={true}
                  numberOfLines={3}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="insuranceInfo"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Sigorta Bilgileri"
                  placeholder="SGK numarası veya sigorta detayları"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              appearance="ghost"
              status="basic"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              İptal
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? "Ekleniyor..." : "Personel Ekle"}
            </Button>
          </View>
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
  header: {
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
  },
  errorText: {
    color: "#FF3D71",
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default AddPersonelScreen;
