import { create } from "zustand";
import {
  getAllEmployees,
  getEmployeeStatistics,
  getCurrentEmployeeData,
  updateCurrentEmployeeData,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  getDeletedEmployees,
  restoreEmployee,
  createEmployeeUser,
  getMyLeaves,
  getMyLeaveStatistics,
  createLeaveRequest,
  getLeaveById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getMyAdvances,
  getMyAdvanceStatistics,
  createAdvanceRequest,
  getAdvanceById,
  updateAdvanceRequest,
  deleteAdvanceRequest,
  getEmployeeLeaves,
  approveLeaveRequest,
  getEmployeeAdvances,
  approveAdvanceRequest,
} from "../services/employee";

const usePersonelStore = create((set, get) => ({
  // State
  personelList: [],
  deletedPersonelList: [],
  currentPersonel: null,
  statistics: null,
  myLeaves: [],
  myAdvances: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  // Actions
  setPersonelList: (personelList) => set({ personelList }),
  setDeletedPersonelList: (deletedPersonelList) => set({ deletedPersonelList }),
  setCurrentPersonel: (currentPersonel) => set({ currentPersonel }),
  setStatistics: (statistics) => set({ statistics }),
  setMyLeaves: (myLeaves) => set({ myLeaves }),
  setMyAdvances: (myAdvances) => set({ myAdvances }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),

  // Personel listesini getir (sayfalama ile)
  fetchPersonelList: async (
    page = 1,
    limit = 10,
    department = null,
    search = null
  ) => {
    console.log("PersonelStore - fetchPersonelList başlatılıyor");
    set({ isLoading: true, error: null });
    try {
      const result = await getAllEmployees(page, limit, department, search);
      console.log("PersonelStore - getAllEmployees result:", result);

      if (result.success) {
        console.log(
          "PersonelStore - Result success, employees:",
          result.data.employees
        );
        set({
          personelList: result.data.employees || [],
          pagination: {
            page,
            limit,
            total: result.data.total || 0,
          },
          isLoading: false,
        });
        console.log("PersonelStore - State güncellendi");
        return { success: true };
      } else {
        console.log("PersonelStore - Result error:", result.error);
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log("PersonelStore - Catch error:", error.message);
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Personel istatistiklerini getir
  fetchStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getEmployeeStatistics();

      if (result.success) {
        set({
          statistics: result.statistics,
          isLoading: false,
        });
        return { success: true, statistics: result.statistics };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Mevcut çalışanın kendi bilgilerini getir
  fetchMyData: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getCurrentEmployeeData();

      if (result.success) {
        set({
          currentPersonel: result.employee,
          isLoading: false,
        });
        return { success: true, employee: result.employee };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Mevcut çalışanın kendi bilgilerini güncelle
  updateMyData: async (updateData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateCurrentEmployeeData(updateData);

      if (result.success) {
        set({
          currentPersonel: result.employee,
          isLoading: false,
        });
        return { success: true, employee: result.employee };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Silinmiş personelleri getir
  fetchDeletedPersonelList: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getDeletedEmployees(page, limit);

      if (result.success) {
        set({
          deletedPersonelList: result.data.employees || [],
          isLoading: false,
        });
        return { success: true };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Personel ekle
  addPersonel: async (personelData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createEmployee(personelData);

      if (result.success) {
        const currentList = get().personelList;
        set({
          personelList: [...currentList, result.employee],
          isLoading: false,
        });
        return { success: true, employee: result.employee };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Personel güncelle
  updatePersonel: async (id, personelData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateEmployee(id, personelData);

      if (result.success) {
        const currentList = get().personelList;
        const updatedList = currentList.map((personel) =>
          personel.id === id ? result.employee : personel
        );
        set({
          personelList: updatedList,
          currentPersonel: result.employee,
          isLoading: false,
        });
        return { success: true, employee: result.employee };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Personel sil
  deletePersonel: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await deleteEmployee(id);

      if (result.success) {
        const currentList = get().personelList;
        const filteredList = currentList.filter(
          (personel) => personel.id !== id
        );
        set({
          personelList: filteredList,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Personel detaylarını getir
  fetchPersonelById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getEmployeeById(id);

      if (result.success) {
        set({
          currentPersonel: result.employee,
          isLoading: false,
        });
        return { success: true, employee: result.employee };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Silinmiş personeli geri yükle
  restorePersonel: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await restoreEmployee(id);

      if (result.success) {
        // Silinmiş listeden çıkar ve ana listeye ekle
        const currentDeletedList = get().deletedPersonelList;
        const currentList = get().personelList;

        const updatedDeletedList = currentDeletedList.filter(
          (personel) => personel.id !== id
        );
        const updatedList = [...currentList, result.employee];

        set({
          personelList: updatedList,
          deletedPersonelList: updatedDeletedList,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Personel için kullanıcı hesabı oluştur
  createPersonelUser: async (personelId, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createEmployeeUser(personelId, email, password);

      if (result.success) {
        set({ isLoading: false });
        return { success: true, user: result.user };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  clearPersonelList: () =>
    set({
      personelList: [],
      deletedPersonelList: [],
      currentPersonel: null,
      statistics: null,
      myLeaves: [],
      myAdvances: [],
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      },
    }),

  // İzin yönetimi
  fetchMyLeaves: async (
    page = 1,
    limit = 10,
    status = null,
    type = null,
    approved = null
  ) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getMyLeaves(page, limit, status, type, approved);

      if (result.success) {
        set({
          myLeaves: result.data.leaves || [],
          isLoading: false,
        });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  fetchMyLeaveStatistics: async (year = null) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getMyLeaveStatistics(year);

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  createLeave: async (leaveData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createLeaveRequest(leaveData);

      if (result.success) {
        const currentLeaves = get().myLeaves;
        set({
          myLeaves: [result.leave, ...currentLeaves],
          isLoading: false,
        });
        return { success: true, leave: result.leave };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  getLeaveById: async (leaveId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getLeaveById(leaveId);

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  updateLeave: async (leaveId, leaveData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateLeaveRequest(leaveId, leaveData);

      if (result.success) {
        const currentLeaves = get().myLeaves;
        const updatedLeaves = currentLeaves.map((leave) =>
          leave.id === leaveId ? result.data : leave
        );
        set({
          myLeaves: updatedLeaves,
          isLoading: false,
        });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  deleteLeave: async (leaveId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await deleteLeaveRequest(leaveId);

      if (result.success) {
        const currentLeaves = get().myLeaves;
        const filteredLeaves = currentLeaves.filter(
          (leave) => leave.id !== leaveId
        );
        set({
          myLeaves: filteredLeaves,
          isLoading: false,
        });
        return { success: true, message: result.message };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Avans yönetimi
  fetchMyAdvances: async (page = 1, limit = 10, status = null) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getMyAdvances(page, limit, status);

      if (result.success) {
        set({
          myAdvances: result.data.advances || [],
          isLoading: false,
        });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  fetchMyAdvanceStatistics: async (year = null) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getMyAdvanceStatistics(year);

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  createAdvance: async (advanceData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createAdvanceRequest(advanceData);

      if (result.success) {
        const currentAdvances = get().myAdvances;
        set({
          myAdvances: [result.advance, ...currentAdvances],
          isLoading: false,
        });
        return { success: true, advance: result.advance };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  getAdvanceById: async (advanceId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getAdvanceById(advanceId);

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  updateAdvance: async (advanceId, advanceData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateAdvanceRequest(advanceId, advanceData);

      if (result.success) {
        const currentAdvances = get().myAdvances;
        const updatedAdvances = currentAdvances.map((advance) =>
          advance.id === advanceId ? result.data : advance
        );
        set({
          myAdvances: updatedAdvances,
          isLoading: false,
        });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  deleteAdvance: async (advanceId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await deleteAdvanceRequest(advanceId);

      if (result.success) {
        const currentAdvances = get().myAdvances;
        const filteredAdvances = currentAdvances.filter(
          (advance) => advance.id !== advanceId
        );
        set({
          myAdvances: filteredAdvances,
          isLoading: false,
        });
        return { success: true, message: result.message };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Manager/Owner fonksiyonları
  fetchEmployeeLeaves: async (
    employeeId,
    page = 1,
    limit = 10,
    status = null,
    type = null,
    approved = null
  ) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getEmployeeLeaves(
        employeeId,
        page,
        limit,
        status,
        type,
        approved
      );

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  approveLeave: async (employeeId, leaveId, status, approvalNote = null) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approveLeaveRequest(
        employeeId,
        leaveId,
        status,
        approvalNote
      );

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  fetchEmployeeAdvances: async (
    employeeId,
    page = 1,
    limit = 10,
    status = null
  ) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getEmployeeAdvances(employeeId, page, limit, status);

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  approveAdvance: async (
    employeeId,
    advanceId,
    status,
    approvalNote = null
  ) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approveAdvanceRequest(
        employeeId,
        advanceId,
        status,
        approvalNote
      );

      if (result.success) {
        set({ isLoading: false });
        return { success: true, data: result.data };
      } else {
        set({
          error: result.error,
          isLoading: false,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },
}));

export default usePersonelStore;
