from sqlalchemy.orm import Session

from app.ml.feature_builder import build_student_features
from app.services.academic_validation import validate_student_exists


def get_student_analytics(db: Session, student_id: int):
    validate_student_exists(db, student_id)

    feature_rows = build_student_features(db)

    features = next(
        (
            row
            for row in feature_rows
            if row["student_id"] == student_id
        ),
        None,
    )

    if features is None:
        return {
            "student_id": student_id,
            "attendance_percentage": 0,
            "assignment_completion_rate": 0,
            "assignment_average_score": 0,
            "average_exam_score": 0,
            "recent_exam_score": 0,
            "exam_score_trend": 0,
            "academic_consistency": 0,
            "engagement_score": 0,
            "academic_health_score": 0,
            "risk_level": "No Data",
        }

    # Preserve the existing rule-based risk indicator.
    has_attendance_data = features["attendance_percentage"] > 0
    has_assignment_data = features["assignment_completion_rate"] > 0
    has_exam_data = features.get("has_exam_data", False)

    if not (
        has_attendance_data
        or has_assignment_data
        or has_exam_data
    ):
        risk_level = "No Data"

    elif (
        (
            has_attendance_data
            and features["attendance_percentage"] < 60
        )
        or (
            has_assignment_data
            and features["assignment_completion_rate"] < 60
        )
        or (
            has_exam_data
            and features["average_exam_score"] < 50
        )
    ):
        risk_level = "High"

    elif (
        (
            has_attendance_data
            and features["attendance_percentage"] < 75
        )
        or (
            has_assignment_data
            and features["assignment_completion_rate"] < 75
        )
        or (
            has_exam_data
            and features["average_exam_score"] < 65
        )
    ):
        risk_level = "Medium"

    else:
        risk_level = "Low"

    return {
        "student_id": student_id,
        "attendance_percentage": features[
            "attendance_percentage"
        ],
        "assignment_completion_rate": features[
            "assignment_completion_rate"
        ],
        "assignment_average_score": features[
            "average_assignment_score"
        ],
        "average_exam_score": features[
            "average_exam_score"
        ],
        "recent_exam_score": features[
            "recent_exam_score"
        ],
        "exam_score_trend": features[
            "exam_score_trend"
        ],
        "academic_consistency": features[
            "academic_consistency"
        ],
        "engagement_score": features[
            "engagement_score"
        ],
        "academic_health_score": features[
            "academic_health_score"
        ],
        "risk_level": risk_level,
    }
