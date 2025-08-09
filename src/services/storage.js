import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "user_token";
const USER_KEY = "user_data";
const BUSINESS_KEY = "business_data";

// Token kaydetme
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Token save error:", error);
    return false;
  }
};

// Token alma
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Token get error:", error);
    return null;
  }
};

// Token silme
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("Token remove error:", error);
    return false;
  }
};

// Kullanıcı verilerini kaydetme
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("User save error:", error);
    return false;
  }
};

// Kullanıcı verilerini alma
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("User get error:", error);
    return null;
  }
};

// Kullanıcı verilerini silme
export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    return true;
  } catch (error) {
    console.error("User remove error:", error);
    return false;
  }
};

// İşletme verilerini kaydetme
export const saveBusiness = async (business) => {
  try {
    await AsyncStorage.setItem(BUSINESS_KEY, JSON.stringify(business));
    return true;
  } catch (error) {
    console.error("Business save error:", error);
    return false;
  }
};

// İşletme verilerini alma
export const getBusiness = async () => {
  try {
    const business = await AsyncStorage.getItem(BUSINESS_KEY);
    return business ? JSON.parse(business) : null;
  } catch (error) {
    console.error("Business get error:", error);
    return null;
  }
};

// İşletme verilerini silme
export const removeBusiness = async () => {
  try {
    await AsyncStorage.removeItem(BUSINESS_KEY);
    return true;
  } catch (error) {
    console.error("Business remove error:", error);
    return false;
  }
};

// Tüm verileri temizleme
export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, BUSINESS_KEY]);
    return true;
  } catch (error) {
    console.error("Clear all error:", error);
    return false;
  }
};

// Token geçerliliğini kontrol etme (basit bir kontrol)
export const isTokenValid = async () => {
  try {
    const token = await getToken();
    if (!token) return false;

    // Token'ın varlığını kontrol et
    // Gerçek uygulamada token'ın geçerlilik süresini de kontrol edebilirsiniz
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};
