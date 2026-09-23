import { useCallback, useEffect, useState } from "react";

import {
  Users,
  CalendarCheck,
  GraduationCap,
  ClipboardCheck,
  UsersRound,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import "../App.css";
import AttendanceTrend from "../components/dashboard/AttendanceTrend";

import MetricCard from "../components/dashboard/MetricCard";
import RiskDistribution from "../components/dashboard/RiskDistribution";
import AtRiskStudents from "../components/dashboard/AtRiskStudents";

import {
  getDashboardAnalytics,
  getRiskStudents,
  getStudentAnalytics,
  getPerformanceTrends,
} from "../services/analytics";

import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/student";
import {
  createAttendance,
  getStudentAttendance,
} from "../services/attendance";
import { getSubjects } from "../services/subject";
import {
  createAssignment,
  getStudentAssignments,
} from "../services/assignment";
import {
  createExam,
  getStudentExams,
} from "../services/exam";
import { getRecommendations } from "../services/recommendations";
import {
  getInterventions,
  createIntervention,
  updateInterventionStatus,
  updateInterventionOutcome,
} from "../services/interventions";

function Dashboard({ onLogout }) {
  // ==============================
  // NAVIGATION
  // ==============================

  const [activeSection, setActiveSection] = useState("dashboard");
  const [showCreateStudent, setShowCreateStudent] = useState(false);

  // ==============================
  // STUDENTS
  // ==============================

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // ATTENDANCE MANAGEMENT
  // ==============================

  const [attendanceStudentId, setAttendanceStudentId] = useState("");
  const [attendanceSubjectId, setAttendanceSubjectId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("Present");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

// ==============================
// ASSIGNMENT MANAGEMENT
// ==============================

const [assignmentStudentId, setAssignmentStudentId] = useState("");
const [assignmentSubjectId, setAssignmentSubjectId] = useState("");
const [assignmentTitle, setAssignmentTitle] = useState("");
const [assignmentDueDate, setAssignmentDueDate] = useState("");
const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
const [assignmentScore, setAssignmentScore] = useState("");
const [assignmentRecords, setAssignmentRecords] = useState([]);
const [assignmentLoading, setAssignmentLoading] = useState(false);
const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
const [assignmentError, setAssignmentError] = useState("");
const [assignmentMessage, setAssignmentMessage] = useState("");

// ==============================
// EXAM MANAGEMENT
// ==============================

const [examStudentId, setExamStudentId] = useState("");
const [examSubjectId, setExamSubjectId] = useState("");
const [examType, setExamType] = useState("");
const [examDate, setExamDate] = useState("");
const [examScore, setExamScore] = useState("");
const [examRecords, setExamRecords] = useState([]);
const [examLoading, setExamLoading] = useState(false);
const [examSubmitting, setExamSubmitting] = useState(false);
const [examError, setExamError] = useState("");
const [examMessage, setExamMessage] = useState("");

  // ==============================
  // DASHBOARD ANALYTICS
  // ==============================

  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true);

    try {
      const data = await getSubjects();
      setSubjects(data);
      setAttendanceError("");
    } catch (error) {
      console.error("Subjects error:", error);
      setSubjects([]);
      setAttendanceError(
        error.response?.data?.detail || "Failed to load subjects",
      );
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  // ==============================
  // RISK MONITORING
  // ==============================

  const [riskStudents, setRiskStudents] = useState([]);

  // ==============================
  // RECOMMENDATIONS
  // ==============================

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState("");

  // ==============================
  // INTERVENTIONS
  // ==============================

  const [interventions, setInterventions] = useState([]);
  const [interventionsLoading, setInterventionsLoading] = useState(true);
  const [interventionsError, setInterventionsError] = useState("");
  const [updatingInterventionId, setUpdatingInterventionId] = useState(null);
  const [updatingInterventionOutcomeId, setUpdatingInterventionOutcomeId] =
    useState(null);
  const [interventionOutcome, setInterventionOutcome] = useState({});
  const [interventionOutcomeNotes, setInterventionOutcomeNotes] = useState({});
  const [interventionOutcomeDate, setInterventionOutcomeDate] = useState({});

  const [showCreateIntervention, setShowCreateIntervention] = useState(false);
  const [creatingIntervention, setCreatingIntervention] = useState(false);
  const [createInterventionMessage, setCreateInterventionMessage] =
    useState("");
  const [interventionStudentId, setInterventionStudentId] = useState("");
  const [interventionFactor, setInterventionFactor] = useState("");
  const [interventionAction, setInterventionAction] = useState("");
  const [interventionPriority, setInterventionPriority] = useState("High");
  const [interventionDescription, setInterventionDescription] = useState("");
  const [interventionDueDate, setInterventionDueDate] = useState("");

  // ==============================
  // STUDENT ANALYTICS
  // ==============================

  const [studentAnalytics, setStudentAnalytics] = useState(null);

  const [studentAnalyticsLoading, setStudentAnalyticsLoading] = useState(false);

  const [studentAnalyticsError, setStudentAnalyticsError] = useState("");

  // ==============================
  // PERFORMANCE TRENDS
  // ==============================

  const [performanceTrends, setPerformanceTrends] = useState([]);
  const [performanceTrendsLoading, setPerformanceTrendsLoading] =
    useState(false);
  const [performanceTrendsError, setPerformanceTrendsError] = useState("");

  // ==============================
  // LOAD INTERVENTIONS
  // ==============================

  const loadInterventions = useCallback(async () => {
    setInterventionsLoading(true);

    try {
      const data = await getInterventions();

      setInterventions(data);
      setInterventionsError("");
    } catch (error) {
      console.error("Interventions error:", error);

      setInterventionsError(
        error.response?.data?.detail || "Unable to load interventions",
      );
    } finally {
      setInterventionsLoading(false);
    }
  }, []);

  // ==============================
  // USE RECOMMENDATION FOR INTERVENTION
  // ==============================

  const handleUseRecommendation = (student, recommendation) => {
    setInterventionStudentId(String(student.student_id));
    setInterventionFactor(recommendation.factor);
    setInterventionAction(recommendation.action);
    setInterventionPriority(recommendation.priority);
    setInterventionDescription(recommendation.description);
    setInterventionDueDate("");

    setCreateInterventionMessage("");
    setShowCreateIntervention(true);
    setActiveSection("interventions");
  };

  // ==============================
  // CREATE INTERVENTION
  // ==============================

  const handleCreateIntervention = async (event) => {
    event.preventDefault();

    if (!interventionStudentId) {
      setCreateInterventionMessage("Please select a student.");
      return;
    }

    setCreatingIntervention(true);
    setCreateInterventionMessage("");

    try {
      const newIntervention = await createIntervention({
        student_id: Number(interventionStudentId),
        factor: interventionFactor,
        action: interventionAction,
        priority: interventionPriority,
        description: interventionDescription,
        due_date: interventionDueDate || null,
      });

      setInterventions((current) => [newIntervention, ...current]);

      setInterventionStudentId("");
      setInterventionFactor("");
      setInterventionAction("");
      setInterventionPriority("High");
      setInterventionDescription("");
      setInterventionDueDate("");

      setCreateInterventionMessage("Intervention created successfully.");
      setShowCreateIntervention(false);
    } catch (error) {
      console.error("Create intervention error:", error);

      setCreateInterventionMessage(
        error.response?.data?.detail || "Unable to create intervention",
      );
    } finally {
      setCreatingIntervention(false);
    }
  };

  // ==============================
  // UPDATE INTERVENTION STATUS
  // ==============================

  const handleInterventionStatusChange = async (interventionId, status) => {
    setUpdatingInterventionId(interventionId);

    try {
      const updatedIntervention = await updateInterventionStatus(
        interventionId,
        status,
      );

      setInterventions((current) =>
        current.map((intervention) =>
          intervention.id === updatedIntervention.id
            ? updatedIntervention
            : intervention,
        ),
      );

      setInterventionsError("");
    } catch (error) {
      console.error("Intervention status update error:", error);

      setInterventionsError(
        error.response?.data?.detail || "Unable to update intervention status",
      );
    } finally {
      setUpdatingInterventionId(null);
    }
  };

  // ==============================
  // UPDATE INTERVENTION OUTCOME
  // ==============================

  const handleInterventionOutcomeChange = async (interventionId) => {
    const outcome = interventionOutcome[interventionId];

    if (!outcome) {
      setInterventionsError("Please select an outcome.");
      return;
    }

    setUpdatingInterventionOutcomeId(interventionId);

    try {
      const updatedIntervention = await updateInterventionOutcome(
        interventionId,
        outcome,
        interventionOutcomeNotes[interventionId] || null,
        interventionOutcomeDate[interventionId] || null,
      );

      setInterventions((current) =>
        current.map((intervention) =>
          intervention.id === updatedIntervention.id
            ? updatedIntervention
            : intervention,
        ),
      );

      setInterventionsError("");
    } catch (error) {
      console.error("Intervention outcome update error:", error);

      setInterventionsError(
        error.response?.data?.detail || "Unable to update intervention outcome",
      );
    } finally {
      setUpdatingInterventionOutcomeId(null);
    }
  };

  // ==============================
  // SEARCH
  // ==============================

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ==============================
  // SORT
  // ==============================

  const [sortBy, setSortBy] = useState("id");

  const [order, setOrder] = useState("asc");

  // ==============================
  // PAGINATION
  // ==============================

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  // ==============================
  // CREATE
  // ==============================

  const [studentId, setStudentId] = useState("");

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [department, setDepartment] = useState("");

  const [year, setYear] = useState("");

  const [semester, setSemester] = useState("");

  const [creating, setCreating] = useState(false);

  const [createMessage, setCreateMessage] = useState("");

  // ==============================
  // EDIT
  // ==============================

  const [editingId, setEditingId] = useState(null);

  const [editStudentId, setEditStudentId] = useState("");

  const [editName, setEditName] = useState("");

  const [editEmail, setEditEmail] = useState("");

  const [editDepartment, setEditDepartment] = useState("");

  const [editYear, setEditYear] = useState("");

  const [editSemester, setEditSemester] = useState("");

  const [updating, setUpdating] = useState(false);

  // ==============================
  // DETAILS
  // ==============================

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentProfile, setShowStudentProfile] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);

  // ==============================
  // DELETE
  // ==============================

  const [deletingId, setDeletingId] = useState(null);

  // ==============================
  // LOAD DASHBOARD ANALYTICS
  // ==============================

  const loadDashboardAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);

    try {
      const data = await getDashboardAnalytics();

      setAnalytics(data);
      setAnalyticsError("");
    } catch (error) {
      console.error("Dashboard analytics error:", error);

      setAnalyticsError(
        error.response?.data?.detail || "Unable to load dashboard analytics",
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // ==============================
  // LOAD RISK STUDENTS
  // ==============================

  const loadRiskStudents = useCallback(async () => {
    try {
      const data = await getRiskStudents();
      setRiskStudents(data);
    } catch (error) {
      console.error("Risk students error:", error);
      setRiskStudents([]);
    }
  }, []);

  // ==============================
  // LOAD RECOMMENDATIONS
  // ==============================

  const loadRecommendations = useCallback(async () => {
    setRecommendationsLoading(true);

    try {
      const data = await getRecommendations();

      setRecommendations(data);
      setRecommendationsError("");
    } catch (error) {
      console.error("Recommendations error:", error);

      setRecommendationsError(
        error.response?.data?.detail || "Unable to load recommendations",
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  // ==============================
  // LOAD STUDENT ANALYTICS
  // ==============================

  const loadStudentAnalytics = useCallback(async (studentIdValue) => {
    setStudentAnalyticsLoading(true);
    setStudentAnalyticsError("");

    try {
      const data = await getStudentAnalytics(studentIdValue);

      console.log("Student analytics data:", data);

      setStudentAnalytics(data);
    } catch (error) {
      console.error("Student analytics error:", error);

      setStudentAnalytics(null);

      setStudentAnalyticsError(
        error.response?.data?.detail || "Unable to load student analytics",
      );
    } finally {
      setStudentAnalyticsLoading(false);
    }
  }, []);

  // ==============================
  // LOAD PERFORMANCE TRENDS
  // ==============================

  const loadPerformanceTrends = useCallback(async (studentIdValue) => {
    setPerformanceTrendsLoading(true);
    setPerformanceTrendsError("");
    setPerformanceTrends([]);

    try {
      const data = await getPerformanceTrends(studentIdValue);

      console.log("Performance trends data:", data);

      setPerformanceTrends(data);
    } catch (error) {
      console.error("Performance trends error:", error);

      setPerformanceTrends([]);

      setPerformanceTrendsError(
        error.response?.data?.detail || "Unable to load performance trends",
      );
    } finally {
      setPerformanceTrendsLoading(false);
    }
  }, []);

  // ==============================
  // LOAD STUDENTS
  // ==============================

  const loadStudents = useCallback(
    async (pageValue, searchValue, sortValue, orderValue) => {
      setLoading(true);

      try {
        const data = await getStudents(
          pageValue,
          limit,
          searchValue,
          sortValue,
          orderValue,
        );

        setStudents(data.data);
        setTotal(data.total);
        setError("");
      } catch (error) {
        console.error("Students error:", error);

        setError(error.response?.data?.detail || "Unable to load students");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStudents(1, "", "id", "asc");
  }, [loadStudents]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardAnalytics();
  }, [loadDashboardAnalytics]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRiskStudents();
  }, [loadRiskStudents]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInterventions();
  }, [loadInterventions]);

  // ==============================
  // SEARCH
  // ==============================

  const handleSearch = (event) => {
    event.preventDefault();

    setSearch(searchInput);
    setPage(1);

    loadStudents(1, searchInput, sortBy, order);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);

    loadStudents(1, "", sortBy, order);
  };

  // ==============================
  // SORT
  // ==============================

  const handleSort = () => {
    setPage(1);

    loadStudents(1, search, sortBy, order);
  };

  // ==============================
  // PAGINATION
  // ==============================

  const totalPages = Math.ceil(total / limit);

  const handlePreviousPage = () => {
    if (page <= 1) {
      return;
    }

    const newPage = page - 1;

    setPage(newPage);

    loadStudents(newPage, search, sortBy, order);
  };

  const handleNextPage = () => {
    if (page >= totalPages) {
      return;
    }

    const newPage = page + 1;

    setPage(newPage);

    loadStudents(newPage, search, sortBy, order);
  };

  // ==============================
  // CREATE STUDENT
  // ==============================

  const handleCreateStudent = async (event) => {
    event.preventDefault();

    setCreating(true);
    setCreateMessage("");

    try {
      await createStudent({
        student_id: studentId,
        name,
        email,
        department,
        year: Number(year),
        semester: Number(semester),
      });

      setStudentId("");
      setName("");
      setEmail("");
      setDepartment("");
      setYear("");
      setSemester("");

      setCreateMessage("Student created successfully!");

      await loadStudents(page, search, sortBy, order);

      await loadDashboardAnalytics();
      await loadRiskStudents();
    } catch (error) {
      console.error("Create student error:", error);

      setCreateMessage(
        error.response?.data?.detail || "Failed to create student",
      );
    } finally {
      setCreating(false);
    }
  };

  // ==============================
  // VIEW DETAILS
  // ==============================

  const handleViewDetails = async (studentIdValue) => {
    setLoadingDetails(true);

    setStudentAnalytics(null);
    setStudentAnalyticsError("");

    try {
      const student = await getStudentById(studentIdValue);

      setSelectedStudent(student);
      setShowStudentProfile(true);

      await Promise.all([
        loadStudentAnalytics(studentIdValue),
        loadPerformanceTrends(studentIdValue),
      ]);
    } catch (error) {
      console.error("Student details error:", error);

      alert(error.response?.data?.detail || "Unable to load student details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // ==============================
  // CLOSE DETAILS
  // ==============================

  const handleCloseDetails = () => {
    setShowStudentProfile(false);
    setSelectedStudent(null);
    setStudentAnalytics(null);
    setStudentAnalyticsError("");
  };

  // ==============================
  // EDIT STUDENT
  // ==============================

  const handleEditStudent = (student) => {
    setEditingId(student.id);

    setEditStudentId(student.student_id);

    setEditName(student.name);
    setEditEmail(student.email);

    setEditDepartment(student.department);

    setEditYear(student.year);
    setEditSemester(student.semester);
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setEditStudentId("");
    setEditName("");
    setEditEmail("");
    setEditDepartment("");
    setEditYear("");
    setEditSemester("");
  };

  // ==============================
  // UPDATE STUDENT
  // ==============================

  const handleUpdateStudent = async (studentIdValue) => {
    setUpdating(true);

    try {
      const updatedStudent = await updateStudent(studentIdValue, {
        student_id: editStudentId,
        name: editName,
        email: editEmail,
        department: editDepartment,
        year: Number(editYear),
        semester: Number(editSemester),
      });

      setSelectedStudent((currentStudent) => {
        if (currentStudent && currentStudent.id === studentIdValue) {
          return updatedStudent;
        }

        return currentStudent;
      });

      if (selectedStudent && selectedStudent.id === studentIdValue) {
        await loadStudentAnalytics(studentIdValue);
      }

      handleCancelEdit();

      await loadStudents(page, search, sortBy, order);

      await loadDashboardAnalytics();
      await loadRiskStudents();
    } catch (error) {
      console.error("Update student error:", error);

      alert(error.response?.data?.detail || "Failed to update student");
    } finally {
      setUpdating(false);
    }
  };

  // ==============================
  // DELETE STUDENT
  // ==============================

  const handleDeleteStudent = async (studentIdValue) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(studentIdValue);

    try {
      await deleteStudent(studentIdValue);

      if (selectedStudent && selectedStudent.id === studentIdValue) {
        setSelectedStudent(null);
        setStudentAnalytics(null);
        setStudentAnalyticsError("");
      }

      await loadStudents(page, search, sortBy, order);

      await loadDashboardAnalytics();
      await loadRiskStudents();
    } catch (error) {
      console.error("Delete student error:", error);

      alert(error.response?.data?.detail || "Failed to delete student");
    } finally {
      setDeletingId(null);
    }
  };

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">E</div>
          <div>
            <h2>EduPulse</h2>
            <span>Academic Intelligence</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "students" ? "active" : ""
            }`}
            onClick={() => setActiveSection("students")}
          >
            <span>◉</span>
            Students
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "attendance" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("attendance");
              loadSubjects();
            }}
          >
            <span>✓</span>
            Attendance
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "assignments" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("assignments");
              loadSubjects();
            }}
          >
            <span>▤</span>
            Assignments
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "exams" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("exams");
              loadSubjects();
            }}
          >
            <span>▣</span>
            Exams
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "analytics" ? "active" : ""
            }`}
            onClick={() => setActiveSection("analytics")}
          >
            <span>◫</span>
            Analytics
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "reports" ? "active" : ""
            }`}
            onClick={() => setActiveSection("reports")}
          >
            <span>▥</span>
            Reports
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "recommendations" ? "active" : ""
            }`}
            onClick={() => setActiveSection("recommendations")}
          >
            <span>✦</span>
            Recommendations
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "interventions" ? "active" : ""
            }`}
            onClick={() => setActiveSection("interventions")}
          >
            <span>✓</span>
            Interventions
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "messages" ? "active" : ""
            }`}
            onClick={() => setActiveSection("messages")}
          >
            <span>✉</span>
            Messages
          </button>

          <button
            className={`sidebar-item ${
              activeSection === "settings" ? "active" : ""
            }`}
            onClick={() => setActiveSection("settings")}
          >
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">F</div>
            <div>
              <strong>Faculty</strong>
              <span>Academic Staff</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search students, reports..."
              aria-label="Search"
            />
          </div>

          <div className="topbar-actions">
            <button className="notification-button">🔔</button>

            <div className="topbar-profile">
              <div className="user-avatar">F</div>
              <div>
                <strong>Faculty</strong>
                <span>Academic Staff</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard">
          <div className="dashboard-header">
            <div>
              <h1>EduPulse Dashboard</h1>
              <p>University academic performance and risk monitoring.</p>
            </div>
          </div>
          <hr />
          {activeSection === "dashboard" && (
            <section className="edupulse-dashboard-home">
              {analyticsLoading && (
                <div className="dashboard-state-card">
                  <div className="dashboard-state-spinner" />
                  <div>
                    <strong>Loading academic analytics</strong>
                    <span>Preparing your faculty overview...</span>
                  </div>
                </div>
              )}

              {analyticsError && (
                <div className="dashboard-alert dashboard-alert-error">
                  {analyticsError}
                </div>
              )}

              {analytics && !analyticsLoading && (
                <>
                  <div className="faculty-page-heading">
                    <div>
                      <span className="faculty-kicker">ACADEMIC OVERVIEW</span>

                      <h2>Faculty Dashboard</h2>

                      <p>
                        Welcome back, Faculty. Here&apos;s what&apos;s happening
                        with your students.
                      </p>
                    </div>

                    <div className="faculty-heading-actions">
                      <button className="faculty-select" type="button">
                        <span>B.Tech - Computer Science</span>
                      </button>

                      <button
                        className="faculty-primary-button"
                        type="button"
                        onClick={() => setActiveSection("students")}
                      >
                        <UsersRound size={16} />
                        Manage Students
                      </button>
                    </div>
                  </div>

                  <div className="faculty-kpi-grid">
                    <MetricCard
                      title="Total Students"
                      value={analytics.total_students ?? 0}
                      subtitle="Currently enrolled"
                      icon={Users}
                      variant="purple"
                    />

                    <MetricCard
                      title="At Risk Students"
                      value={
                        (analytics.high_risk_students ?? 0) +
                        (analytics.medium_risk_students ?? 0)
                      }
                      subtitle={
                        `${analytics.high_risk_students ?? 0} high · ` +
                        `${analytics.medium_risk_students ?? 0} medium`
                      }
                      icon={UsersRound}
                      variant="red"
                    />

                    <MetricCard
                      title="Average Attendance"
                      value={`${analytics.average_attendance ?? 0}%`}
                      subtitle="Overall attendance"
                      icon={CalendarCheck}
                      variant="blue"
                    />

                    <MetricCard
                      title="Assignments Submitted"
                      value={`${analytics.average_assignment_completion ?? 0}%`}
                      subtitle="Average completion"
                      icon={ClipboardCheck}
                      variant="green"
                    />
                  </div>

                  <div className="faculty-analytics-grid">
                    <RiskDistribution analytics={analytics} />

                    <AttendanceTrend
                      students={students}
                      averageAttendance={analytics.average_attendance ?? 0}
                    />

                    <AtRiskStudents
                      students={riskStudents}
                      onViewAll={() => setActiveSection("students")}
                    />
                  </div>

                  <section className="engagement-card">
                    <div className="engagement-header">
                      <div>
                        <h3>Engagement Overview</h3>

                        <p>Key academic indicators across your students.</p>
                      </div>
                    </div>

                    <div className="engagement-grid">
                      <div className="engagement-metric">
                        <div className="engagement-metric-top">
                          <span>Attendance</span>
                          <CalendarCheck size={16} />
                        </div>

                        <strong>{analytics.average_attendance ?? 0}%</strong>

                        <div className="engagement-track">
                          <span
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  Number(analytics.average_attendance ?? 0),
                                  0,
                                ),
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="engagement-metric">
                        <div className="engagement-metric-top">
                          <span>Assignments</span>
                          <ClipboardCheck size={16} />
                        </div>

                        <strong>
                          {analytics.average_assignment_completion ?? 0}%
                        </strong>

                        <div className="engagement-track">
                          <span
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  Number(
                                    analytics.average_assignment_completion ??
                                      0,
                                  ),
                                  0,
                                ),
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="engagement-metric">
                        <div className="engagement-metric-top">
                          <span>Exam Performance</span>
                          <GraduationCap size={16} />
                        </div>

                        <strong>{analytics.average_exam_score ?? 0}</strong>

                        <div className="engagement-track">
                          <span
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  Number(analytics.average_exam_score ?? 0),
                                  0,
                                ),
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="engagement-metric">
                        <div className="engagement-metric-top">
                          <span>Students With Data</span>
                          <Users size={16} />
                        </div>

                        <strong>
                          {(analytics.total_students ?? 0) -
                            (analytics.no_data_students ?? 0)}
                        </strong>

                        <small>
                          of {analytics.total_students ?? 0} students
                        </small>
                      </div>

                      <div className="engagement-score-card">
                        <div>
                          <span>Academic Risk</span>

                          <strong>
                            {(analytics.high_risk_students ?? 0) +
                              (analytics.medium_risk_students ?? 0)}
                          </strong>
                        </div>

                        <div className="engagement-risk-breakdown">
                          <span>
                            <i className="risk-dot-high" />
                            High {analytics.high_risk_students ?? 0}
                          </span>

                          <span>
                            <i className="risk-dot-medium" />
                            Medium {analytics.medium_risk_students ?? 0}
                          </span>

                          <span>
                            <i className="risk-dot-low" />
                            Low {analytics.low_risk_students ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {!analyticsLoading && !analyticsError && !analytics && (
                <div className="dashboard-state-card">
                  <div>
                    <strong>Dashboard analytics unavailable</strong>

                    <span>
                      The analytics service did not return dashboard data.
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === "students" && showStudentProfile && (
            <section className="student-profile-page">
              <div className="student-profile-topbar">
                <button
                  className="secondary-button"
                  onClick={handleCloseDetails}
                >
                  ← Back to Students
                </button>

                <span className="student-profile-breadcrumb">
                  Students / Student Profile
                </span>
              </div>

              {loadingDetails && (
                <p className="status-message">Loading student profile...</p>
              )}

              {selectedStudent && (
                <>
                  <section className="student-profile-hero">
                    <div className="student-profile-avatar">
                      {selectedStudent.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="student-profile-main">
                      <div>
                        <p className="student-profile-eyebrow">
                          STUDENT PROFILE
                        </p>

                        <h1>{selectedStudent.name}</h1>

                        <p className="student-profile-meta">
                          {selectedStudent.student_id} ·{" "}
                          {selectedStudent.department}
                        </p>
                      </div>

                      <span className="student-profile-id">
                        ID #{selectedStudent.id}
                      </span>
                    </div>
                  </section>

                  <div className="student-profile-content">
                    <section className="student-profile-section">
                      <div className="dashboard-section-header">
                        <h2>Student Information</h2>
                        <p>Academic and contact information.</p>
                      </div>

                      <div className="student-profile-info-grid">
                        <div className="profile-info-item">
                          <span>Email</span>
                          <strong>{selectedStudent.email}</strong>
                        </div>

                        <div className="profile-info-item">
                          <span>Department</span>
                          <strong>{selectedStudent.department}</strong>
                        </div>

                        <div className="profile-info-item">
                          <span>Year</span>
                          <strong>Year {selectedStudent.year}</strong>
                        </div>

                        <div className="profile-info-item">
                          <span>Semester</span>
                          <strong>Semester {selectedStudent.semester}</strong>
                        </div>
                      </div>
                    </section>

                    <section className="student-profile-section">
                      <div className="dashboard-section-header">
                        <h2>Academic Performance</h2>
                        <p>Current engagement and performance indicators.</p>
                      </div>

                      {studentAnalyticsLoading && (
                        <p className="status-message">
                          Loading academic analytics...
                        </p>
                      )}

                      {studentAnalyticsError && (
                        <p className="error-message">{studentAnalyticsError}</p>
                      )}

                      {!studentAnalyticsLoading &&
                        !studentAnalyticsError &&
                        studentAnalytics && (
                          <div className="student-profile-metrics">
                            <div className="profile-metric-card">
                              <span>Attendance</span>
                              <strong>
                                {studentAnalytics.attendance_percentage}%
                              </strong>
                              <small>Overall attendance rate</small>
                            </div>

                            <div className="profile-metric-card">
                              <span>Assignments</span>
                              <strong>
                                {studentAnalytics.assignment_completion_rate}%
                              </strong>
                              <small>Assignment completion rate</small>
                            </div>

                            <div className="profile-metric-card">
                              <span>Exam Score</span>
                              <strong>
                                {studentAnalytics.average_exam_score}
                              </strong>
                              <small>Average examination score</small>
                            </div>

                            <div className="profile-metric-card">
                              <span>Risk Level</span>
                              <strong className="profile-risk-value">
                                {studentAnalytics.risk_level}
                              </strong>
                              <small>Current academic risk status</small>
                            </div>
                          </div>
                        )}

                      {/* ============================== */}
                      {/* PERFORMANCE TRENDS */}
                      {/* ============================== */}

                      <div className="student-performance-trends">
                        <div className="dashboard-section-header">
                          <h2>Performance Trends</h2>
                          <p>
                            Historical academic performance across recorded
                            assessments.
                          </p>
                        </div>

                        {performanceTrendsLoading && (
                          <p className="status-message">
                            Loading performance trends...
                          </p>
                        )}

                        {performanceTrendsError && (
                          <p className="error-message">
                            {performanceTrendsError}
                          </p>
                        )}

                        {!performanceTrendsLoading &&
                          !performanceTrendsError &&
                          performanceTrends.length === 0 && (
                            <p className="status-message">
                              No performance trend data available.
                            </p>
                          )}

                        {!performanceTrendsLoading &&
                          !performanceTrendsError &&
                          performanceTrends.length > 0 && (
                            <div className="performance-chart-container">
                              <ResponsiveContainer width="100%" height={320}>
                                <LineChart
                                  data={performanceTrends}
                                  margin={{
                                    top: 10,
                                    right: 20,
                                    left: -10,
                                    bottom: 10,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                  />

                                  <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) =>
                                      new Date(value).toLocaleDateString(
                                        "en-IN",
                                        {
                                          day: "numeric",
                                          month: "short",
                                        },
                                      )
                                    }
                                  />

                                  <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12 }}
                                  />

                                  <Tooltip
                                    labelFormatter={(value) =>
                                      new Date(value).toLocaleDateString(
                                        "en-IN",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        },
                                      )
                                    }
                                    formatter={(value, name, item) => [
                                      `${value}%`,
                                      item.payload.subject
                                        ? `${item.payload.subject} Score`
                                        : "Score",
                                    ]}
                                  />

                                  <Legend />

                                  <Line
                                    type="monotone"
                                    dataKey="score"
                                    name="Performance Score"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                      </div>
                    </section>
                  </div>
                </>
              )}
            </section>
          )}

          {activeSection === "students" && !showStudentProfile && (
            <>
              <section className="students-page-header">
                <div>
                  <h2>Students</h2>
                  <p>Manage and monitor student academic profiles.</p>
                </div>

                <button
                  type="button"
                  className="add-student-button"
                  onClick={() => setShowCreateStudent((previous) => !previous)}
                >
                  {showCreateStudent ? "Close Form" : "+ Add Student"}
                </button>
              </section>

              {showCreateStudent && (
                <section className="student-form-section">
                  <div className="dashboard-section-header">
                    <h2>Create Student</h2>
                    <p>Add a new student to the academic system.</p>
                  </div>

                  <form className="student-form" onSubmit={handleCreateStudent}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Student ID</label>
                        <input
                          type="text"
                          placeholder="Example: STU007"
                          value={studentId}
                          onChange={(event) => setStudentId(event.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label>Name</label>
                        <input
                          type="text"
                          placeholder="Enter student name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label>Email</label>
                        <input
                          type="email"
                          placeholder="Enter student email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label>Department</label>
                        <input
                          type="text"
                          placeholder="Example: Computer Science"
                          value={department}
                          onChange={(event) =>
                            setDepartment(event.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label>Year</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          placeholder="Example: 3"
                          value={year}
                          onChange={(event) => setYear(event.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label>Semester</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Example: 6"
                          value={semester}
                          onChange={(event) => setSemester(event.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="student-form-actions">
                      <button type="submit" disabled={creating}>
                        {creating ? "Creating..." : "Create Student"}
                      </button>
                    </div>

                    {createMessage && (
                      <p className="status-message">{createMessage}</p>
                    )}
                  </form>
                </section>
              )}

              <hr />
              {/* ============================== */}
              {/* SEARCH & SORT */}
              {/* ============================== */}

              <section className="student-tools-section">
                <div className="dashboard-section-header">
                  <h2>Search & Sort Students</h2>
                  <p>
                    Find students and organize the list by academic information.
                  </p>
                </div>

                <div className="dashboard-toolbar">
                  <form className="toolbar-search" onSubmit={handleSearch}>
                    <div className="toolbar-field toolbar-search-field">
                      <label htmlFor="student-search">Search Students</label>

                      <input
                        id="student-search"
                        type="text"
                        placeholder="Search by name"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                      />
                    </div>

                    <button type="submit">Search</button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleClearSearch}
                    >
                      Clear
                    </button>
                  </form>

                  <div className="toolbar-divider" />

                  <div className="toolbar-sort">
                    <div className="toolbar-field">
                      <label htmlFor="sort-by">Sort By</label>

                      <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                      >
                        <option value="id">ID</option>
                        <option value="student_id">Student ID</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="department">Department</option>
                        <option value="year">Year</option>
                        <option value="semester">Semester</option>
                      </select>
                    </div>

                    <div className="toolbar-field">
                      <label htmlFor="sort-order">Order</label>

                      <select
                        id="sort-order"
                        value={order}
                        onChange={(event) => setOrder(event.target.value)}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>

                    <button type="button" onClick={handleSort}>
                      Apply Sort
                    </button>
                  </div>
                </div>

                {search && (
                  <p className="search-result-message">
                    Showing results for: <strong>{search}</strong>
                  </p>
                )}
              </section>

              <hr />
              {/* ============================== */}
              {/* STUDENT DETAILS */}
              {/* ============================== */}

              {selectedStudent && (
                <section className="student-details">
                  <div className="dashboard-section-header">
                    <h2>Student Details</h2>
                    <p>
                      Academic profile and performance overview for the selected
                      student.
                    </p>
                  </div>

                  <div className="student-details-grid">
                    <div className="student-detail-item">
                      <div className="student-detail-label">ID</div>
                      <div className="student-detail-value">
                        {selectedStudent.id}
                      </div>
                    </div>

                    <div className="student-detail-item">
                      <div className="student-detail-label">Student ID</div>
                      <div className="student-detail-value">
                        {selectedStudent.student_id}
                      </div>
                    </div>

                    <div className="student-detail-item">
                      <div className="student-detail-label">Name</div>
                      <div className="student-detail-value">
                        {selectedStudent.name}
                      </div>
                    </div>

                    <div className="student-detail-item">
                      <div className="student-detail-label">Email</div>
                      <div className="student-detail-value">
                        {selectedStudent.email}
                      </div>
                    </div>

                    <div className="student-detail-item">
                      <div className="student-detail-label">Department</div>
                      <div className="student-detail-value">
                        {selectedStudent.department}
                      </div>
                    </div>

                    <div className="student-detail-item">
                      <div className="student-detail-label">Year</div>
                      <div className="student-detail-value">
                        {selectedStudent.year}
                      </div>
                    </div>

                    <div className="student-detail-item">
                      <div className="student-detail-label">Semester</div>
                      <div className="student-detail-value">
                        {selectedStudent.semester}
                      </div>
                    </div>
                  </div>

                  <div className="student-performance-section">
                    <div className="dashboard-section-header">
                      <h3>Academic Performance</h3>
                      <p>Current engagement and academic indicators.</p>
                    </div>

                    {studentAnalyticsLoading && (
                      <p className="status-message">
                        Loading academic analytics...
                      </p>
                    )}

                    {studentAnalyticsError && (
                      <p className="error-message">{studentAnalyticsError}</p>
                    )}

                    {!studentAnalyticsLoading &&
                      !studentAnalyticsError &&
                      studentAnalytics && (
                        <div className="performance-grid">
                          <div className="performance-card">
                            <div className="performance-card-label">
                              Attendance
                            </div>
                            <div className="performance-card-value">
                              {studentAnalytics.attendance_percentage}%
                            </div>
                          </div>

                          <div className="performance-card">
                            <div className="performance-card-label">
                              Assignment Completion
                            </div>
                            <div className="performance-card-value">
                              {studentAnalytics.assignment_completion_rate}%
                            </div>
                          </div>

                          <div className="performance-card">
                            <div className="performance-card-label">
                              Average Exam Score
                            </div>
                            <div className="performance-card-value">
                              {studentAnalytics.average_exam_score}
                            </div>
                          </div>

                          <div className="performance-card">
                            <div className="performance-card-label">
                              Risk Level
                            </div>
                            <div className="performance-card-value">
                              {studentAnalytics.risk_level}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* ============================== */}
                    {/* PERFORMANCE TRENDS */}
                    {/* ============================== */}

                    <div className="student-performance-trends">
                      <div className="dashboard-section-header">
                        <h3>Performance Trends</h3>
                        <p>
                          Historical academic performance across recorded
                          assessments.
                        </p>
                      </div>

                      {performanceTrendsLoading && (
                        <p className="status-message">
                          Loading performance trends...
                        </p>
                      )}

                      {performanceTrendsError && (
                        <p className="error-message">
                          {performanceTrendsError}
                        </p>
                      )}

                      {!performanceTrendsLoading &&
                        !performanceTrendsError &&
                        performanceTrends.length === 0 && (
                          <p className="status-message">
                            No performance trend data available.
                          </p>
                        )}

                      {!performanceTrendsLoading &&
                        !performanceTrendsError &&
                        performanceTrends.length > 0 && (
                          <div className="performance-chart-container">
                            <ResponsiveContainer width="100%" height={320}>
                              <LineChart
                                data={performanceTrends}
                                margin={{
                                  top: 10,
                                  right: 20,
                                  left: -10,
                                  bottom: 10,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                />

                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />

                                <YAxis
                                  domain={[0, 100]}
                                  tick={{ fontSize: 12 }}
                                />

                                <Tooltip
                                  formatter={(value) => [`${value}%`, "Score"]}
                                />

                                <Legend />

                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  name="Performance Score"
                                  strokeWidth={3}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                    </div>

                    <div className="student-details-actions">
                      <button onClick={handleCloseDetails}>
                        Close Details
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <hr />
              {/* ============================== */}
              {/* STUDENTS */}
              {/* ============================== */}

              <section className="students-list-section">
                <div className="dashboard-section-header">
                  <h2>Students</h2>
                  <p>
                    Manage student profiles and review academic information.
                  </p>
                </div>

                {loading && (
                  <p className="status-message">Loading students...</p>
                )}

                {error && <p className="error-message">{error}</p>}

                {loadingDetails && (
                  <p className="status-message">Loading student details...</p>
                )}

                {!loading && !error && students.length === 0 && (
                  <p className="status-message">No students found.</p>
                )}

                {!loading && !error && students.length > 0 && (
                  <div className="student-list">
                    {students.map((student) => (
                      <div className="student-card" key={student.id}>
                        {editingId === student.id ? (
                          <div className="student-edit-form">
                            <div className="student-card-header">
                              <div>
                                <h3>Edit Student</h3>
                                <p>
                                  Update the information for{" "}
                                  <strong>{student.name}</strong>.
                                </p>
                              </div>

                              <span className="student-record-id">
                                ID #{student.id}
                              </span>
                            </div>

                            <div className="form-grid">
                              <div className="form-field">
                                <label>Student ID</label>
                                <input
                                  type="text"
                                  value={editStudentId}
                                  onChange={(event) =>
                                    setEditStudentId(event.target.value)
                                  }
                                />
                              </div>

                              <div className="form-field">
                                <label>Name</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(event) =>
                                    setEditName(event.target.value)
                                  }
                                />
                              </div>

                              <div className="form-field">
                                <label>Email</label>
                                <input
                                  type="email"
                                  value={editEmail}
                                  onChange={(event) =>
                                    setEditEmail(event.target.value)
                                  }
                                />
                              </div>

                              <div className="form-field">
                                <label>Department</label>
                                <input
                                  type="text"
                                  value={editDepartment}
                                  onChange={(event) =>
                                    setEditDepartment(event.target.value)
                                  }
                                />
                              </div>

                              <div className="form-field">
                                <label>Year</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={editYear}
                                  onChange={(event) =>
                                    setEditYear(event.target.value)
                                  }
                                />
                              </div>

                              <div className="form-field">
                                <label>Semester</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={editSemester}
                                  onChange={(event) =>
                                    setEditSemester(event.target.value)
                                  }
                                />
                              </div>
                            </div>

                            <div className="student-actions">
                              <button
                                onClick={() => handleUpdateStudent(student.id)}
                                disabled={updating}
                              >
                                {updating ? "Saving..." : "Save Changes"}
                              </button>

                              <button
                                className="secondary-button"
                                onClick={handleCancelEdit}
                                disabled={updating}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="student-row">
                              <div className="student-profile">
                                <div className="student-avatar">
                                  {student.name?.charAt(0)?.toUpperCase() ||
                                    "S"}
                                </div>

                                <div className="student-primary-info">
                                  <h3>{student.name}</h3>
                                  <p>{student.student_id}</p>
                                </div>
                              </div>

                              <div className="student-academic-info">
                                <div>
                                  <span>Department</span>
                                  <strong>{student.department}</strong>
                                </div>

                                <div>
                                  <span>Year</span>
                                  <strong>Year {student.year}</strong>
                                </div>

                                <div>
                                  <span>Semester</span>
                                  <strong>Semester {student.semester}</strong>
                                </div>
                              </div>

                              <div className="student-row-actions">
                                <button
                                  className="view-student-button"
                                  onClick={() => handleViewDetails(student.id)}
                                >
                                  View Profile
                                </button>

                                <button
                                  className="icon-action-button"
                                  onClick={() => handleEditStudent(student)}
                                  title="Edit student"
                                >
                                  Edit
                                </button>

                                <button
                                  className="icon-action-button delete-action"
                                  onClick={() =>
                                    handleDeleteStudent(student.id)
                                  }
                                  disabled={deletingId === student.id}
                                  title="Delete student"
                                >
                                  {deletingId === student.id ? "..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!loading && !error && total > 0 && (
                  <div className="pagination">
                    <button onClick={handlePreviousPage} disabled={page === 1}>
                      Previous
                    </button>

                    <span>
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {activeSection === "attendance" && (
            <section className="academic-management-page">
              <section className="students-page-header">
                <div>
                  <h2>Attendance Management</h2>
                  <p>
                    Mark attendance and review attendance history by student.
                  </p>
                </div>
              </section>

              <section className="student-form-section">
                <div className="dashboard-section-header">
                  <h2>Mark Attendance</h2>
                  <p>Record attendance for a student and subject.</p>
                </div>

                <form
                  className="student-form"
                  onSubmit={async (event) => {
                    event.preventDefault();

                    setAttendanceSubmitting(true);
                    setAttendanceMessage("");
                    setAttendanceError("");

                    try {
                      await createAttendance({
                        student_id: Number(attendanceStudentId),
                        subject_id: Number(attendanceSubjectId),
                        date: attendanceDate,
                        status: attendanceStatus,
                      });

                      setAttendanceMessage(
                        "Attendance marked successfully.",
                      );

                      const records = await getStudentAttendance(
                        Number(attendanceStudentId),
                      );

                      setAttendanceRecords(records);
                    } catch (error) {
                      console.error("Attendance error:", error);

                      setAttendanceError(
                        error.response?.data?.detail ||
                          "Failed to mark attendance",
                      );
                    } finally {
                      setAttendanceSubmitting(false);
                    }
                  }}
                >
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="attendance-student">
                        Student
                      </label>

                      <select
                        id="attendance-student"
                        value={attendanceStudentId}
                        onChange={async (event) => {
                          const studentIdValue = event.target.value;

                          setAttendanceStudentId(studentIdValue);
                          setAttendanceRecords([]);
                          setAttendanceError("");
                          setAttendanceMessage("");

                          if (!studentIdValue) {
                            return;
                          }

                          setAttendanceLoading(true);

                          try {
                            const records = await getStudentAttendance(
                              Number(studentIdValue),
                            );

                            setAttendanceRecords(records);
                          } catch (error) {
                            console.error(
                              "Attendance history error:",
                              error,
                            );

                            setAttendanceError(
                              error.response?.data?.detail ||
                                "Failed to load attendance",
                            );
                          } finally {
                            setAttendanceLoading(false);
                          }
                        }}
                        required
                      >
                        <option value="">Select a student</option>

                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.student_id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="attendance-subject">
                        Subject
                      </label>

                      <select
                        id="attendance-subject"
                        value={attendanceSubjectId}
                        onChange={(event) =>
                          setAttendanceSubjectId(event.target.value)
                        }
                        required
                        disabled={subjectsLoading}
                      >
                        <option value="">
                          {subjectsLoading
                            ? "Loading subjects..."
                            : "Select a subject"}
                        </option>

                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.code} — {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="attendance-date">
                        Date
                      </label>

                      <input
                        id="attendance-date"
                        type="date"
                        value={attendanceDate}
                        onChange={(event) =>
                          setAttendanceDate(event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="attendance-status">
                        Status
                      </label>

                      <select
                        id="attendance-status"
                        value={attendanceStatus}
                        onChange={(event) =>
                          setAttendanceStatus(event.target.value)
                        }
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="add-student-button"
                      disabled={attendanceSubmitting}
                    >
                      {attendanceSubmitting
                        ? "Saving..."
                        : "Mark Attendance"}
                    </button>
                  </div>
                </form>

                {attendanceMessage && (
                  <p className="success-message">{attendanceMessage}</p>
                )}

                {attendanceError && (
                  <p className="error-message">{attendanceError}</p>
                )}
              </section>

              <section className="student-form-section">
                <div className="dashboard-section-header">
                  <h2>Attendance History</h2>
                  <p>
                    {attendanceStudentId
                      ? "Recent attendance records for the selected student."
                      : "Select a student to view attendance history."}
                  </p>
                </div>

                {attendanceLoading && (
                  <p className="status-message">
                    Loading attendance history...
                  </p>
                )}

                {!attendanceLoading &&
                  attendanceStudentId &&
                  attendanceRecords.length === 0 && (
                    <p className="status-message">
                      No attendance records found for this student.
                    </p>
                  )}

                {!attendanceLoading && attendanceRecords.length > 0 && (
                  <div className="student-table-wrapper">
                    <table className="student-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Subject</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {attendanceRecords.map((record) => (
                          <tr key={record.id}>
                            <td>{record.date}</td>
                            <td>{record.subject}</td>
                            <td>
                              <span
                                className={`status-badge ${
                                  record.status.toLowerCase() === "present"
                                    ? "status-badge-success"
                                    : "status-badge-danger"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </section>
          )}

          {activeSection === "assignments" && (
          <section className="academic-management-page">
            <section className="students-page-header">
              <div>
                <h2>Assignment Management</h2>
                <p>
                  Create assignments and review submission history by student.
                </p>
              </div>
            </section>

            <section className="student-form-section">
              <div className="dashboard-section-header">
                <h2>Create Assignment</h2>
                <p>Record an assignment for a student and subject.</p>
              </div>

              <form
                className="student-form"
                onSubmit={async (event) => {
                  event.preventDefault();

                  setAssignmentSubmitting(true);
                  setAssignmentMessage("");
                  setAssignmentError("");

                  try {
                    await createAssignment({
                      student_id: Number(assignmentStudentId),
                      subject_id: Number(assignmentSubjectId),
                      title: assignmentTitle,
                      due_date: assignmentDueDate,
                      submitted: assignmentSubmitted,
                      score:
                        assignmentScore === ""
                          ? null
                          : Number(assignmentScore),
                    });

                    setAssignmentMessage(
                      "Assignment created successfully.",
                    );

                    const records = await getStudentAssignments(
                      Number(assignmentStudentId),
                    );

                    setAssignmentRecords(records);
                    setAssignmentTitle("");
                    setAssignmentDueDate("");
                    setAssignmentSubmitted(false);
                    setAssignmentScore("");
                  } catch (error) {
                    console.error("Assignment error:", error);

                    setAssignmentError(
                      error.response?.data?.detail ||
                        "Failed to create assignment",
                    );
                  } finally {
                    setAssignmentSubmitting(false);
                  }
                }}
              >
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="assignment-student">
                      Student
                    </label>

                    <select
                      id="assignment-student"
                      value={assignmentStudentId}
                      onChange={async (event) => {
                        const studentIdValue = event.target.value;

                        setAssignmentStudentId(studentIdValue);
                        setAssignmentRecords([]);
                        setAssignmentError("");
                        setAssignmentMessage("");

                        if (!studentIdValue) {
                          return;
                        }

                        setAssignmentLoading(true);

                        try {
                          const records =
                            await getStudentAssignments(
                              Number(studentIdValue),
                            );

                          setAssignmentRecords(records);
                        } catch (error) {
                          console.error(
                            "Assignment history error:",
                            error,
                          );

                          setAssignmentError(
                            error.response?.data?.detail ||
                              "Failed to load assignments",
                          );
                        } finally {
                          setAssignmentLoading(false);
                        }
                      }}
                      required
                    >
                      <option value="">Select a student</option>

                      {students.map((student) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.name} ({student.student_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="assignment-subject">
                      Subject
                    </label>

                    <select
                      id="assignment-subject"
                      value={assignmentSubjectId}
                      onChange={(event) =>
                        setAssignmentSubjectId(event.target.value)
                      }
                      required
                      disabled={subjectsLoading}
                    >
                      <option value="">
                        {subjectsLoading
                          ? "Loading subjects..."
                          : "Select a subject"}
                      </option>

                      {subjects.map((subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                        >
                          {subject.code} — {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="assignment-title">
                      Assignment Title
                    </label>

                    <input
                      id="assignment-title"
                      type="text"
                      value={assignmentTitle}
                      onChange={(event) =>
                        setAssignmentTitle(event.target.value)
                      }
                      placeholder="e.g. Linked List Implementation"
                      minLength={2}
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="assignment-due-date">
                      Due Date
                    </label>

                    <input
                      id="assignment-due-date"
                      type="date"
                      value={assignmentDueDate}
                      onChange={(event) =>
                        setAssignmentDueDate(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="assignment-score">
                      Score
                    </label>

                    <input
                      id="assignment-score"
                      type="number"
                      value={assignmentScore}
                      onChange={(event) =>
                        setAssignmentScore(event.target.value)
                      }
                      placeholder="Optional"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div className="form-field checkbox-field">
                    <label htmlFor="assignment-submitted">
                      Submitted
                    </label>

                    <input
                      id="assignment-submitted"
                      type="checkbox"
                      checked={assignmentSubmitted}
                      onChange={(event) =>
                        setAssignmentSubmitted(event.target.checked)
                      }
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="add-student-button"
                    disabled={assignmentSubmitting}
                  >
                    {assignmentSubmitting
                      ? "Saving..."
                      : "Create Assignment"}
                  </button>
                </div>
              </form>

              {assignmentMessage && (
                <p className="success-message">
                  {assignmentMessage}
                </p>
              )}

              {assignmentError && (
                <p className="error-message">
                  {assignmentError}
                </p>
              )}
            </section>

            <section className="student-form-section">
              <div className="dashboard-section-header">
                <h2>Assignment History</h2>
                <p>
                  {assignmentStudentId
                    ? "Assignment records for the selected student."
                    : "Select a student to view assignment history."}
                </p>
              </div>

              {assignmentLoading && (
                <p className="status-message">
                  Loading assignment history...
                </p>
              )}

              {!assignmentLoading &&
                assignmentStudentId &&
                assignmentRecords.length === 0 && (
                  <p className="status-message">
                    No assignments found for this student.
                  </p>
                )}

              {!assignmentLoading &&
                assignmentRecords.length > 0 && (
                  <div className="student-table-wrapper">
                    <table className="student-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Subject</th>
                          <th>Due Date</th>
                          <th>Submitted</th>
                          <th>Score</th>
                        </tr>
                      </thead>

                      <tbody>
                        {assignmentRecords.map((record) => (
                          <tr key={record.id}>
                            <td>{record.title}</td>
                            <td>{record.subject}</td>
                            <td>{record.due_date}</td>
                            <td>
                              {record.submitted
                                ? "Yes"
                                : "No"}
                            </td>
                            <td>
                              {record.score !== null &&
                              record.score !== undefined
                                ? record.score
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </section>
          </section>
        )}

        {activeSection === "exams" && (
          <section className="academic-management-page">
            <section className="students-page-header">
              <div>
                <h2>Exam Management</h2>
                <p>
                  Record exam results and review performance by student.
                </p>
              </div>
            </section>

            <section className="student-form-section">
              <div className="dashboard-section-header">
                <h2>Record Exam Result</h2>
                <p>Record an exam score for a student and subject.</p>
              </div>

              <form
                className="student-form"
                onSubmit={async (event) => {
                  event.preventDefault();

                  setExamSubmitting(true);
                  setExamMessage("");
                  setExamError("");

                  try {
                    await createExam({
                      student_id: Number(examStudentId),
                      subject_id: Number(examSubjectId),
                      exam_type: examType,
                      exam_date: examDate,
                      score: Number(examScore),
                    });

                    setExamMessage(
                      "Exam result recorded successfully.",
                    );

                    const records = await getStudentExams(
                      Number(examStudentId),
                    );

                    setExamRecords(records);
                    setExamType("");
                    setExamDate("");
                    setExamScore("");
                  } catch (error) {
                    console.error("Exam error:", error);

                    setExamError(
                      error.response?.data?.detail ||
                        "Failed to record exam result",
                    );
                  } finally {
                    setExamSubmitting(false);
                  }
                }}
              >
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="exam-student">
                      Student
                    </label>

                    <select
                      id="exam-student"
                      value={examStudentId}
                      onChange={async (event) => {
                        const studentIdValue = event.target.value;

                        setExamStudentId(studentIdValue);
                        setExamRecords([]);
                        setExamError("");
                        setExamMessage("");

                        if (!studentIdValue) {
                          return;
                        }

                        setExamLoading(true);

                        try {
                          const records = await getStudentExams(
                            Number(studentIdValue),
                          );

                          setExamRecords(records);
                        } catch (error) {
                          console.error(
                            "Exam history error:",
                            error,
                          );

                          setExamError(
                            error.response?.data?.detail ||
                              "Failed to load exam history",
                          );
                        } finally {
                          setExamLoading(false);
                        }
                      }}
                      required
                    >
                      <option value="">Select a student</option>

                      {students.map((student) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.name} ({student.student_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="exam-subject">
                      Subject
                    </label>

                    <select
                      id="exam-subject"
                      value={examSubjectId}
                      onChange={(event) =>
                        setExamSubjectId(event.target.value)
                      }
                      required
                      disabled={subjectsLoading}
                    >
                      <option value="">
                        {subjectsLoading
                          ? "Loading subjects..."
                          : "Select a subject"}
                      </option>

                      {subjects.map((subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                        >
                          {subject.code} — {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="exam-type">
                      Exam Type
                    </label>

                    <input
                      id="exam-type"
                      type="text"
                      value={examType}
                      onChange={(event) =>
                        setExamType(event.target.value)
                      }
                      placeholder="e.g. Midterm"
                      minLength={2}
                      maxLength={50}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="exam-date">
                      Exam Date
                    </label>

                    <input
                      id="exam-date"
                      type="date"
                      value={examDate}
                      onChange={(event) =>
                        setExamDate(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="exam-score">
                      Score
                    </label>

                    <input
                      id="exam-score"
                      type="number"
                      value={examScore}
                      onChange={(event) =>
                        setExamScore(event.target.value)
                      }
                      placeholder="0 - 100"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="add-student-button"
                    disabled={examSubmitting}
                  >
                    {examSubmitting
                      ? "Saving..."
                      : "Record Exam Result"}
                  </button>
                </div>
              </form>

              {examMessage && (
                <p className="success-message">
                  {examMessage}
                </p>
              )}

              {examError && (
                <p className="error-message">
                  {examError}
                </p>
              )}
            </section>

            <section className="student-form-section">
              <div className="dashboard-section-header">
                <h2>Exam History</h2>
                <p>
                  {examStudentId
                    ? "Exam results for the selected student."
                    : "Select a student to view exam history."}
                </p>
              </div>

              {examLoading && (
                <p className="status-message">
                  Loading exam history...
                </p>
              )}

              {!examLoading &&
                examStudentId &&
                examRecords.length === 0 && (
                  <p className="status-message">
                    No exam records found for this student.
                  </p>
                )}

              {!examLoading && examRecords.length > 0 && (
                <div className="student-table-wrapper">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Exam Type</th>
                        <th>Exam Date</th>
                        <th>Score</th>
                      </tr>
                    </thead>

                    <tbody>
                      {examRecords.map((record) => (
                        <tr key={record.id}>
                          <td>{record.subject}</td>
                          <td>{record.exam_type}</td>
                          <td>{record.exam_date}</td>
                          <td>{record.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </section>
        )}

        {activeSection === "recommendations" && (
            <section className="section-card">
              <div className="section-header">
                <div>
                  <h2>Academic Recommendations</h2>
                  <p>
                    Recommended interventions based on student risk factors.
                  </p>
                </div>
              </div>

              {recommendationsLoading && (
                <p className="status-message">Loading recommendations...</p>
              )}

              {recommendationsError && (
                <p className="error-message">{recommendationsError}</p>
              )}

              {!recommendationsLoading &&
                !recommendationsError &&
                recommendations.length === 0 && (
                  <p className="status-message">
                    No academic interventions are currently required.
                  </p>
                )}

              {!recommendationsLoading &&
                !recommendationsError &&
                recommendations.length > 0 && (
                  <div className="recommendations-list">
                    {recommendations.map((student) => (
                      <div
                        key={student.student_id}
                        className="recommendation-student-card"
                      >
                        <div className="recommendation-student-header">
                          <div>
                            <h3>{student.name}</h3>
                            <p>
                              <strong>Student Code:</strong>{" "}
                              {student.student_code}
                            </p>
                          </div>

                          <span
                            className={`risk-badge ${
                              student.risk_level === "High"
                                ? "risk-high"
                                : "risk-medium"
                            }`}
                          >
                            {student.risk_level} Risk
                          </span>
                        </div>

                        <div className="recommendation-probabilities">
                          <strong>ML Risk Probability</strong>

                          <div>
                            Low:{" "}
                            {(
                              (student.ml_risk_probabilities?.Low ?? 0) * 100
                            ).toFixed(1)}
                            %
                          </div>

                          <div>
                            Medium:{" "}
                            {(
                              (student.ml_risk_probabilities?.Medium ?? 0) * 100
                            ).toFixed(1)}
                            %
                          </div>

                          <div>
                            High:{" "}
                            {(
                              (student.ml_risk_probabilities?.High ?? 0) * 100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>

                        <div className="recommendation-items">
                          {student.recommendations.map((recommendation) => (
                            <div
                              key={`${student.student_id}-${recommendation.factor}`}
                              className="recommendation-item"
                            >
                              <div className="recommendation-item-header">
                                <h4>{recommendation.action}</h4>

                                <span
                                  className={`priority-badge priority-${recommendation.priority.toLowerCase()}`}
                                >
                                  {recommendation.priority}
                                </span>
                              </div>

                              <p>
                                <strong>Factor:</strong> {recommendation.factor}
                              </p>

                              <p>
                                <strong>Current Value:</strong>{" "}
                                {recommendation.value}
                              </p>

                              <p>{recommendation.description}</p>

                              <button
                                type="button"
                                className="recommendation-action-button"
                                onClick={() =>
                                  handleUseRecommendation(
                                    student,
                                    recommendation,
                                  )
                                }
                              >
                                Create Intervention
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </section>
          )}

          {activeSection === "interventions" && (
            <section className="section-card">
              <div className="section-header">
                <div>
                  <h2>Intervention Tracking</h2>
                  <p>
                    Track faculty actions taken to support at-risk students.
                  </p>
                </div>

                <button
                  type="button"
                  className="add-student-button"
                  onClick={() => {
                    setShowCreateIntervention((previous) => !previous);
                    setCreateInterventionMessage("");
                  }}
                >
                  {showCreateIntervention
                    ? "Close Form"
                    : "+ Create Intervention"}
                </button>
              </div>

              {showCreateIntervention && (
                <section className="student-form-section">
                  <div className="dashboard-section-header">
                    <h2>Create Intervention</h2>
                    <p>Create a targeted action plan for an at-risk student.</p>
                  </div>

                  <form
                    className="student-form"
                    onSubmit={handleCreateIntervention}
                  >
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="intervention-student">Student</label>

                        <select
                          id="intervention-student"
                          value={interventionStudentId}
                          onChange={(event) =>
                            setInterventionStudentId(event.target.value)
                          }
                          required
                        >
                          <option value="">Select a student</option>

                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.name} ({student.student_id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field">
                        <label htmlFor="intervention-factor">Risk Factor</label>

                        <input
                          id="intervention-factor"
                          type="text"
                          placeholder="Example: Low attendance"
                          value={interventionFactor}
                          onChange={(event) =>
                            setInterventionFactor(event.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="intervention-action">Action</label>

                        <input
                          id="intervention-action"
                          type="text"
                          placeholder="Example: Faculty counseling session"
                          value={interventionAction}
                          onChange={(event) =>
                            setInterventionAction(event.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="intervention-priority">Priority</label>

                        <select
                          id="intervention-priority"
                          value={interventionPriority}
                          onChange={(event) =>
                            setInterventionPriority(event.target.value)
                          }
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div className="form-field">
                        <label htmlFor="intervention-due-date">Due Date</label>

                        <input
                          id="intervention-due-date"
                          type="date"
                          value={interventionDueDate}
                          onChange={(event) =>
                            setInterventionDueDate(event.target.value)
                          }
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="intervention-description">
                          Description
                        </label>

                        <textarea
                          id="intervention-description"
                          placeholder="Describe the intervention and expected action."
                          value={interventionDescription}
                          onChange={(event) =>
                            setInterventionDescription(event.target.value)
                          }
                          required
                          rows="4"
                        />
                      </div>
                    </div>

                    <div className="student-form-actions">
                      <button type="submit" disabled={creatingIntervention}>
                        {creatingIntervention
                          ? "Creating..."
                          : "Create Intervention"}
                      </button>
                    </div>

                    {createInterventionMessage && (
                      <p className="status-message">
                        {createInterventionMessage}
                      </p>
                    )}
                  </form>
                </section>
              )}

              {interventionsLoading && (
                <p className="status-message">Loading interventions...</p>
              )}

              {interventionsError && (
                <p className="error-message">{interventionsError}</p>
              )}

              {!interventionsLoading &&
                !interventionsError &&
                interventions.length === 0 && (
                  <p className="status-message">
                    No interventions have been created yet.
                  </p>
                )}

              {!interventionsLoading &&
                !interventionsError &&
                interventions.length > 0 && (
                  <div className="interventions-list">
                    {interventions.map((intervention) => (
                      <div key={intervention.id} className="intervention-card">
                        <div className="intervention-card-header">
                          <div>
                            <h3>{intervention.action}</h3>

                            <p>
                              <strong>{intervention.student_name}</strong> ·{" "}
                              {intervention.student_code}
                            </p>
                          </div>

                          <span
                            className={`priority-badge priority-${intervention.priority.toLowerCase()}`}
                          >
                            {intervention.priority}
                          </span>
                        </div>

                        <div className="intervention-details">
                          <p>
                            <strong>Risk Factor:</strong> {intervention.factor}
                          </p>

                          <p>
                            <strong>Description:</strong>{" "}
                            {intervention.description}
                          </p>

                          <p>
                            <strong>Due Date:</strong>{" "}
                            {intervention.due_date
                              ? new Date(
                                  `${intervention.due_date}T00:00:00`,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Not set"}
                          </p>
                        </div>

                        <div className="intervention-footer">
                          <div>
                            <strong>Status:</strong>{" "}
                            <span
                              className={`intervention-status status-${intervention.status
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {intervention.status}
                            </span>
                          </div>

                          <select
                            value={intervention.status}
                            disabled={
                              updatingInterventionId === intervention.id
                            }
                            onChange={(event) =>
                              handleInterventionStatusChange(
                                intervention.id,
                                event.target.value,
                              )
                            }
                          >
                            <option value="Pending">Pending</option>

                            <option value="In Progress">In Progress</option>

                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        {intervention.status === "Completed" && (
                          <div className="intervention-outcome-section">
                            <div className="intervention-outcome-header">
                              <div>
                                <h4>Intervention Outcome</h4>
                                <p>
                                  Record whether the intervention improved the
                                  student's academic situation.
                                </p>
                              </div>

                              {intervention.outcome && (
                                <span className="intervention-outcome-badge">
                                  {intervention.outcome}
                                </span>
                              )}
                            </div>

                            <div className="intervention-outcome-form">
                              <div className="form-field">
                                <label htmlFor={`outcome-${intervention.id}`}>
                                  Outcome
                                </label>

                                <select
                                  id={`outcome-${intervention.id}`}
                                  value={
                                    interventionOutcome[intervention.id] ??
                                    intervention.outcome ??
                                    ""
                                  }
                                  onChange={(event) =>
                                    setInterventionOutcome((current) => ({
                                      ...current,
                                      [intervention.id]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="">Select outcome</option>
                                  <option value="Improved">Improved</option>
                                  <option value="No Improvement">
                                    No Improvement
                                  </option>
                                  <option value="Needs Follow-up">
                                    Needs Follow-up
                                  </option>
                                </select>
                              </div>

                              <div className="form-field">
                                <label
                                  htmlFor={`outcome-date-${intervention.id}`}
                                >
                                  Outcome Date
                                </label>

                                <input
                                  id={`outcome-date-${intervention.id}`}
                                  type="date"
                                  value={
                                    interventionOutcomeDate[intervention.id] ??
                                    intervention.outcome_date ??
                                    ""
                                  }
                                  onChange={(event) =>
                                    setInterventionOutcomeDate((current) => ({
                                      ...current,
                                      [intervention.id]: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="form-field">
                                <label
                                  htmlFor={`outcome-notes-${intervention.id}`}
                                >
                                  Outcome Notes
                                </label>

                                <textarea
                                  id={`outcome-notes-${intervention.id}`}
                                  placeholder="Describe the student's response to the intervention."
                                  value={
                                    interventionOutcomeNotes[intervention.id] ??
                                    intervention.outcome_notes ??
                                    ""
                                  }
                                  onChange={(event) =>
                                    setInterventionOutcomeNotes((current) => ({
                                      ...current,
                                      [intervention.id]: event.target.value,
                                    }))
                                  }
                                  rows="3"
                                />
                              </div>

                              <button
                                type="button"
                                className="recommendation-action-button"
                                disabled={
                                  updatingInterventionOutcomeId ===
                                  intervention.id
                                }
                                onClick={() =>
                                  handleInterventionOutcomeChange(
                                    intervention.id,
                                  )
                                }
                              >
                                {updatingInterventionOutcomeId ===
                                intervention.id
                                  ? "Saving..."
                                  : intervention.outcome
                                    ? "Update Outcome"
                                    : "Record Outcome"}
                              </button>
                            </div>
                          </div>
                        )}

                        {intervention.outcome && (
                          <div className="intervention-recorded-outcome">
                            <strong>Recorded Outcome:</strong>{" "}
                            {intervention.outcome}
                            {intervention.outcome_date && (
                              <>
                                {" · "}
                                {new Date(
                                  `${intervention.outcome_date}T00:00:00`,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </section>
          )}

          {activeSection !== "dashboard" &&
            activeSection !== "students" &&
            activeSection !== "recommendations" &&
            activeSection !== "interventions" && (
              <section className="module-placeholder">
                <div className="module-placeholder-icon">✦</div>

                <h2>
                  {activeSection.charAt(0).toUpperCase() +
                    activeSection.slice(1)}
                </h2>

                <p>
                  This module is part of the EduPulse roadmap and will be
                  implemented in a future development phase.
                </p>

                <span className="module-placeholder-status">Coming soon</span>
              </section>
            )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
