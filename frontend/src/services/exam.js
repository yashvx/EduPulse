import api from "./api";

export const createExam = async (exam) => {
  const response = await api.post("/exams", exam);
  return response.data;
};

export const getStudentExams = async (studentId) => {
  const response = await api.get(`/students/${studentId}/exams`);
  return response.data;
};
