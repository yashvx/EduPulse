from statistics import pstdev

from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.assignment import Assignment
from app.models.exam import Exam
from app.models.student import Student


def _clamp(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return max(minimum, min(value, maximum))


def build_student_features(db: Session) -> list[dict]:
    """
    Build one academic intelligence feature row for every student.

    The original six ML features are preserved exactly so the existing
    trained risk model remains compatible.

    Additional intelligence metrics are included for analytics,
    explainability, recommendations, and future ML capabilities.
    """

    students = db.query(Student).all()

    feature_rows = []

    for student in students:
        attendance_records = (
            db.query(Attendance)
            .filter(Attendance.student_id == student.id)
            .all()
        )

        assignments = (
            db.query(Assignment)
            .filter(Assignment.student_id == student.id)
            .all()
        )

        exams = (
            db.query(Exam)
            .filter(Exam.student_id == student.id)
            .order_by(Exam.exam_date.asc())
            .all()
        )

        # -------------------------
        # Attendance
        # -------------------------

        total_attendance = len(attendance_records)

        present_count = sum(
            1
            for record in attendance_records
            if record.status.lower() == "present"
        )

        attendance_percentage = (
            (present_count / total_attendance) * 100
            if total_attendance
            else 0
        )

        # -------------------------
        # Assignments
        # -------------------------

        total_assignments = len(assignments)

        submitted_assignments = sum(
            1
            for assignment in assignments
            if assignment.submitted
        )

        assignment_completion_rate = (
            (submitted_assignments / total_assignments) * 100
            if total_assignments
            else 0
        )

        assignment_scores = [
            assignment.score
            for assignment in assignments
            if assignment.score is not None
        ]

        average_assignment_score = (
            sum(assignment_scores) / len(assignment_scores)
            if assignment_scores
            else 0
        )

        # -------------------------
        # Exams
        # -------------------------

        quiz_scores = []
        internal_scores = []
        other_exam_scores = []
        all_exam_scores = []

        for exam in exams:
            score = float(exam.score)
            all_exam_scores.append(score)

            exam_type = exam.exam_type.strip().lower()

            if exam_type == "quiz":
                quiz_scores.append(score)

            elif exam_type in {"internal", "internal assessment"}:
                internal_scores.append(score)

            else:
                other_exam_scores.append(score)

        average_quiz_score = (
            sum(quiz_scores) / len(quiz_scores)
            if quiz_scores
            else 0
        )

        average_internal_score = (
            sum(internal_scores) / len(internal_scores)
            if internal_scores
            else 0
        )

        # IMPORTANT:
        # Preserve the original ML definition:
        # average_exam_score only uses non-quiz/non-internal exams.
        average_exam_score = (
            sum(other_exam_scores) / len(other_exam_scores)
            if other_exam_scores
            else 0
        )

        # -------------------------
        # Recent Exam Intelligence
        # -------------------------

        recent_exam_score = (
            all_exam_scores[-1]
            if all_exam_scores
            else 0
        )

        exam_score_trend = (
            all_exam_scores[-1] - all_exam_scores[-2]
            if len(all_exam_scores) >= 2
            else 0
        )

        # -------------------------
        # Academic Consistency
        # -------------------------

        consistency_scores = assignment_scores + all_exam_scores

        if len(consistency_scores) >= 2:
            academic_consistency = _clamp(
                100 - (pstdev(consistency_scores) * 2)
            )
        elif len(consistency_scores) == 1:
            academic_consistency = 100
        else:
            academic_consistency = 0

        # -------------------------
        # Engagement Score
        # -------------------------

        engagement_score = 0

        engagement_values = []

        if total_attendance:
            engagement_values.append(attendance_percentage)

        if total_assignments:
            engagement_values.append(assignment_completion_rate)

        if engagement_values:
            engagement_score = (
                sum(engagement_values) / len(engagement_values)
            )

        # -------------------------
        # Academic Health Score
        # -------------------------

        health_values = []

        if total_attendance:
            health_values.append(attendance_percentage)

        if total_assignments:
            health_values.append(assignment_completion_rate)

        if assignment_scores:
            health_values.append(average_assignment_score)

        if all_exam_scores:
            health_values.append(
                sum(all_exam_scores) / len(all_exam_scores)
            )

        academic_health_score = (
            sum(health_values) / len(health_values)
            if health_values
            else 0
        )

        feature_rows.append(
            {
                # Identity
                "student_id": student.id,

                # Existing ML features
                "attendance_percentage": round(
                    attendance_percentage,
                    2,
                ),
                "assignment_completion_rate": round(
                    assignment_completion_rate,
                    2,
                ),
                "average_assignment_score": round(
                    average_assignment_score,
                    2,
                ),
                "average_quiz_score": round(
                    average_quiz_score,
                    2,
                ),
                "average_internal_score": round(
                    average_internal_score,
                    2,
                ),
                "average_exam_score": round(
                    average_exam_score,
                    2,
                ),

                # Academic intelligence features
                "recent_exam_score": round(
                    recent_exam_score,
                    2,
                ),
                "exam_score_trend": round(
                    exam_score_trend,
                    2,
                ),
                "academic_consistency": round(
                    academic_consistency,
                    2,
                ),
                "engagement_score": round(
                    engagement_score,
                    2,
                ),
                "academic_health_score": round(
                    academic_health_score,
                    2,
                ),

                # Data availability flags for explainability.
                # These are not ML model features.
                "has_assignment_score_data": bool(assignment_scores),
                "has_quiz_data": bool(quiz_scores),
                "has_internal_data": bool(internal_scores),
                "has_exam_data": bool(other_exam_scores),
            }
        )

    return feature_rows
