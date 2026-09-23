import api from "./api";

export const createAssignment = async (assignment) => {
  const response = await api.post("/assignments", assignment);
  return response.data;
};

export const getStudentAssignments = async (studentId) => {
  const response = await api.get(`/students/${studentId}/assignments`);
  return response.data;
};
