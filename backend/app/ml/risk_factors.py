def analyze_risk_factors(features: dict) -> list[dict]:
    """
    Identify measurable academic factors that may contribute
    to a student's predicted academic risk.

    This is an explanation layer separate from the ML model.
    It does not change the model prediction.
    """

    factors = []

    attendance = features["attendance_percentage"]
    assignment_completion = features["assignment_completion_rate"]
    assignment_score = features["average_assignment_score"]
    quiz_score = features["average_quiz_score"]
    internal_score = features["average_internal_score"]
    exam_score = features["average_exam_score"]

    has_assignment_score_data = features.get(
        "has_assignment_score_data",
        assignment_score > 0,
    )
    has_quiz_data = features.get(
        "has_quiz_data",
        quiz_score > 0,
    )
    has_internal_data = features.get(
        "has_internal_data",
        internal_score > 0,
    )
    has_exam_data = features.get(
        "has_exam_data",
        exam_score > 0,
    )

    # -------------------------
    # Attendance
    # -------------------------

    if attendance < 60:
        factors.append(
            {
                "factor": "Attendance",
                "severity": "High",
                "value": attendance,
                "message": "Attendance is critically low.",
            }
        )
    elif attendance < 75:
        factors.append(
            {
                "factor": "Attendance",
                "severity": "Medium",
                "value": attendance,
                "message": "Attendance is below the recommended level.",
            }
        )

    # -------------------------
    # Assignment completion
    # -------------------------

    if assignment_completion < 60:
        factors.append(
            {
                "factor": "Assignment Completion",
                "severity": "High",
                "value": assignment_completion,
                "message": "A large proportion of assignments are incomplete.",
            }
        )
    elif assignment_completion < 75:
        factors.append(
            {
                "factor": "Assignment Completion",
                "severity": "Medium",
                "value": assignment_completion,
                "message": "Assignment completion needs improvement.",
            }
        )

    # -------------------------
    # Assignment performance
    # -------------------------

    if has_assignment_score_data and assignment_score < 50:
        factors.append(
            {
                "factor": "Assignment Performance",
                "severity": "High",
                "value": assignment_score,
                "message": "Assignment scores are significantly below average.",
            }
        )
    elif has_assignment_score_data and assignment_score < 65:
        factors.append(
            {
                "factor": "Assignment Performance",
                "severity": "Medium",
                "value": assignment_score,
                "message": "Assignment scores could be improved.",
            }
        )

    # -------------------------
    # Quiz performance
    # -------------------------

    if has_quiz_data and quiz_score < 50:
        factors.append(
            {
                "factor": "Quiz Performance",
                "severity": "High",
                "value": quiz_score,
                "message": "Quiz performance is significantly below average.",
            }
        )
    elif has_quiz_data and quiz_score < 65:
        factors.append(
            {
                "factor": "Quiz Performance",
                "severity": "Medium",
                "value": quiz_score,
                "message": "Quiz performance needs improvement.",
            }
        )

    # -------------------------
    # Internal assessment
    # -------------------------

    if has_internal_data and internal_score < 50:
        factors.append(
            {
                "factor": "Internal Assessment",
                "severity": "High",
                "value": internal_score,
                "message": "Internal assessment performance is critically low.",
            }
        )
    elif has_internal_data and internal_score < 65:
        factors.append(
            {
                "factor": "Internal Assessment",
                "severity": "Medium",
                "value": internal_score,
                "message": "Internal assessment performance needs improvement.",
            }
        )

    # -------------------------
    # Exam performance
    # -------------------------

    if has_exam_data and exam_score < 50:
        factors.append(
            {
                "factor": "Exam Performance",
                "severity": "High",
                "value": exam_score,
                "message": "Exam performance is significantly below average.",
            }
        )
    elif has_exam_data and exam_score < 65:
        factors.append(
            {
                "factor": "Exam Performance",
                "severity": "Medium",
                "value": exam_score,
                "message": "Exam performance needs improvement.",
            }
        )

    # Highest severity factors first.
    severity_order = {
        "High": 0,
        "Medium": 1,
    }

    factors.sort(
        key=lambda item: severity_order[item["severity"]]
    )

    return factors
