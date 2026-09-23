import api from "./api";

export const createAttendance = async (attendance) => {
  const response = await api.post("/attendance", attendance);
  return response.data;
};

export const getStudentAttendance = async (studentId) => {
  const response = await api.get(`/students/${studentId}/attendance`);
  return response.data;
};
