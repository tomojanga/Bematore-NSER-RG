"""
Screening & Risk Assessment Models
Comprehensive gambling risk assessment system with Lie/Bet, PGSI, DSM-5
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from decimal import Decimal

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel,
    StatusChoices, RiskLevelChoices, AssessmentTypeChoices,
    LanguageChoices, BaseModelManager, generate_reference_number
)


class AssessmentSession(BaseModel):
    """Main assessment session tracking"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='assessment_sessions', db_index=True)
    bst_token = models.ForeignKey('bst.BSTToken', on_delete=models.PROTECT, related_name='assessments', null=True, blank=True)
    session_reference = models.CharField(max_length=50, unique=True, db_index=True)
    assessment_type = models.CharField(max_length=20, choices=AssessmentTypeChoices.choices, db_index=True)
    started_at = models.DateTimeField(auto_now_add=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='in_progress', db_index=True)
    raw_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    risk_level = models.CharField(max_length=20, choices=RiskLevelChoices.choices, null=True, blank=True, db_index=True)
    operator = models.ForeignKey('operators.Operator', on_delete=models.SET_NULL, null=True, blank=True)
    language = models.CharField(max_length=10, choices=LanguageChoices.choices, default=LanguageChoices.ENGLISH)
    should_self_exclude = models.BooleanField(default=False)
    next_assessment_due = models.DateTimeField(null=True, blank=True, db_index=True)
    ml_risk_prediction = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    objects = BaseModelManager()
    
    class Meta:
        db_table = 'screening_assessment_sessions'
        ordering = ['-started_at']
        indexes = [models.Index(fields=['user', 'assessment_type'], name='assess_user_type_idx')]
    
    def __str__(self):
        return f"{self.assessment_type} - {self.user}"


class AssessmentQuestion(TimeStampedModel, UUIDModel):
    """Question bank for assessments"""
    question_code = models.CharField(max_length=50, unique=True, db_index=True)
    assessment_type = models.CharField(max_length=20, choices=AssessmentTypeChoices.choices, db_index=True)
    question_number = models.PositiveSmallIntegerField(db_index=True)
    question_text_en = models.TextField()
    question_text_sw = models.TextField(blank=True)
    response_type = models.CharField(max_length=20, default='yes_no')
    response_options = models.JSONField(default=dict, blank=True)
    max_score = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        db_table = 'screening_assessment_questions'
        ordering = ['assessment_type', 'question_number']


class AssessmentResponse(BaseModel):
    """Individual question responses"""
    session = models.ForeignKey('AssessmentSession', on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey('AssessmentQuestion', on_delete=models.PROTECT)
    response_value = models.CharField(max_length=255)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'screening_assessment_responses'
        unique_together = [['session', 'question']]


class RiskScore(BaseModel):
    """Historical risk scores"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='risk_scores', db_index=True)
    bst_token = models.ForeignKey('bst.BSTToken', on_delete=models.PROTECT, null=True, blank=True)
    score_date = models.DateTimeField(default=timezone.now, db_index=True)
    risk_level = models.CharField(max_length=20, choices=RiskLevelChoices.choices, db_index=True)
    risk_score = models.DecimalField(max_digits=5, decimal_places=2)
    score_source = models.CharField(max_length=50)
    is_current = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        db_table = 'screening_risk_scores'
        ordering = ['-score_date']


class BehavioralProfile(BaseModel):
    """ML-powered behavioral analysis"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, primary_key=True)
    total_bets_count = models.PositiveIntegerField(default=0)
    total_amount_wagered = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    betting_frequency_daily = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    late_night_betting_count = models.PositiveIntegerField(default=0)
    loss_chasing_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overall_risk_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    anomaly_flags = ArrayField(models.CharField(max_length=100), default=list, blank=True)
    last_analyzed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'screening_behavioral_profiles'


class ScreeningSchedule(BaseModel):
    """Automated quarterly screening schedule"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='screening_schedules', db_index=True)
    schedule_type = models.CharField(max_length=20, db_index=True)
    due_date = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, default='pending', db_index=True)
    assessment_session = models.OneToOneField('AssessmentSession', on_delete=models.SET_NULL, null=True, blank=True)
    is_compliant = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'screening_schedules'
        ordering = ['due_date']

