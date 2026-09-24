from pydantic import BaseModel


class StudentAnalyticsResponse(BaseModel):
    student_id: int

    # Core academic metrics
    attendance_percentage: float
    assignment_completion_rate: float
    assignment_average_score: float
    average_exam_score: float

    # Performance intelligence
    recent_exam_score: float
    exam_score_trend: float
    academic_consistency: float

    # Composite intelligence scores
    engagement_score: float
    academic_health_score: float

    # Existing risk indicator
    risk_level: str
