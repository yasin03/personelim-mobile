// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Phone number formatting
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Format as Turkish phone number
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }

  return phone;
};

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// String utilities
export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalizeFirst(word))
    .join(" ");
};

// Array utilities
export const sortPersonelByName = (personelList) => {
  return [...personelList].sort((a, b) => a.name.localeCompare(b.name, "tr"));
};

export const filterPersonelByStatus = (personelList, status) => {
  return personelList.filter((personel) => personel.status === status);
};

export const searchPersonel = (personelList, searchTerm) => {
  if (!searchTerm) return personelList;

  const term = searchTerm.toLowerCase();
  return personelList.filter(
    (personel) =>
      personel.name.toLowerCase().includes(term) ||
      personel.position.toLowerCase().includes(term) ||
      personel.department.toLowerCase().includes(term) ||
      personel.email.toLowerCase().includes(term)
  );
};

// Error handling
export const getErrorMessage = (error) => {
  if (typeof error === "string") return error;

  if (error?.message) return error.message;

  if (error?.code) {
    // Firebase error codes
    switch (error.code) {
      case "auth/user-not-found":
        return "Kullanıcı bulunamadı";
      case "auth/wrong-password":
        return "Yanlış şifre";
      case "auth/email-already-in-use":
        return "Bu email adresi zaten kullanımda";
      case "auth/weak-password":
        return "Şifre çok zayıf";
      case "auth/invalid-email":
        return "Geçersiz email adresi";
      default:
        return "Bir hata oluştu";
    }
  }

  return "Bilinmeyen bir hata oluştu";
};
