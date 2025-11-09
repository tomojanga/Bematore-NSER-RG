"""
Screening & Risk Assessment Serializers
Lie/Bet, PGSI, DSM-5 assessments with ML predictions
"""
from rest_framework import serializers
from django.utils import timezone
from .models import (
    AssessmentSession, AssessmentQuestion, AssessmentResponse,
    RiskScore, BehavioralProfile, ScreeningSchedule
)


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    """Assessment question serializer with multi-language support"""
    question_text = serializers.SerializerMethodField()
    
    class Meta:
        model = AssessmentQuestion
        fields = [
            'id', 'question_code', 'assessment_type',
            'question_number', 'question_text',
            'response_type', 'response_options', 'max_score',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_question_text(self, obj):
        request = self.context.get('request')
        language = 'en'
        
        if request and hasattr(request.user, 'language'):
            language = request.user.language
        
        return getattr(obj, f'question_text_{language}', obj.question_text_en)


class AssessmentResponseSerializer(serializers.ModelSerializer):
    """Assessment response serializer"""
    question_text = serializers.CharField(source='question.question_text_en', read_only=True)
    
    class Meta:
        model = AssessmentResponse
        fields = [
            'id', 'session', 'question', 'question_text',
            'response_value', 'score', 'answered_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'score', 'answered_at', 'created_at', 'updated_at'
        ]
    
    def validate(self, attrs):
        question = attrs.get('question')
        response_value = attrs.get('response_value')
        
        # Validate response against question's response options
        if question and question.response_options:
            valid_options = question.response_options.get('options', [])
            if valid_options and response_value not in [opt['value'] for opt in valid_options]:
                raise serializers.ValidationError({
                    "response_value": f"Invalid response. Must be one of: {', '.join([opt['value'] for opt in valid_options])}"
                })
        
        return attrs


class RiskScoreSerializer(serializers.ModelSerializer):
    """Risk score serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    risk_level_display = serializers.SerializerMethodField()
    days_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = RiskScore
        fields = [
            'id', 'user', 'user_name', 'bst_token',
            'score_date', 'risk_level', 'risk_level_display',
            'risk_score', 'score_source', 'is_current',
            'days_ago', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_risk_level_display(self, obj):
        risk_levels = {
            'none': 'No Risk',
            'low': 'Low Risk',
            'mild': 'Mild Risk',
            'moderate': 'Moderate Risk',
            'high': 'High Risk',
            'severe': 'Severe Risk',
            'critical': 'Critical Risk'
        }
        return risk_levels.get(obj.risk_level, obj.risk_level)
    
    def get_days_ago(self, obj):
        if obj.score_date:
            delta = timezone.now().date() - obj.score_date
            return delta.days
        return None


class BehavioralProfileSerializer(serializers.ModelSerializer):
    """Behavioral profile serializer with ML insights"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    risk_level = serializers.SerializerMethodField()
    days_since_analysis = serializers.SerializerMethodField()
    
    class Meta:
        model = BehavioralProfile
        fields = [
            'user', 'user_name',
            'total_bets_count', 'total_amount_wagered',
            'betting_frequency_daily', 'late_night_betting_count',
            'loss_chasing_score', 'overall_risk_score',
            'anomaly_flags', 'risk_level', 'days_since_analysis',
            'last_analyzed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'user', 'total_bets_count', 'total_amount_wagered',
            'betting_frequency_daily', 'late_night_betting_count',
            'loss_chasing_score', 'overall_risk_score',
            'anomaly_flags', 'last_analyzed_at', 'created_at', 'updated_at'
        ]
    
    def get_risk_level(self, obj):
        score = obj.overall_risk_score
        if score >= 80:
            return 'critical'
        elif score >= 60:
            return 'high'
        elif score >= 40:
            return 'moderate'
        elif score >= 20:
            return 'low'
        else:
            return 'none'
    
    def get_days_since_analysis(self, obj):
        if obj.last_analyzed_at:
            delta = timezone.now() - obj.last_analyzed_at
            return delta.days
        return None


class ScreeningScheduleSerializer(serializers.ModelSerializer):
    """Screening schedule serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    
    class Meta:
        model = ScreeningSchedule
        fields = [
            'id', 'user', 'user_name', 'schedule_type',
            'due_date', 'status', 'assessment_session',
            'is_compliant', 'is_overdue', 'days_until_due',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'assessment_session', 'is_compliant',
            'created_at', 'updated_at'
        ]
    
    def get_is_overdue(self, obj):
        return obj.due_date < timezone.now().date() and obj.status == 'pending'
    
    def get_days_until_due(self, obj):
        if obj.due_date:
            delta = obj.due_date - timezone.now().date()
            return delta.days
        return None


class AssessmentSessionListSerializer(serializers.ModelSerializer):
    """Lightweight assessment session serializer for lists"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    duration = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = AssessmentSession
        fields = [
            'id', 'session_reference', 'user', 'user_name',
            'assessment_type', 'started_at', 'completed_at',
            'status', 'risk_level', 'raw_score',
            'duration', 'completion_percentage',
            'created_at'
        ]
        read_only_fields = [
            'id', 'session_reference', 'started_at', 'completed_at',
            'raw_score', 'risk_level', 'created_at'
        ]
    
    def get_duration(self, obj):
        if obj.completed_at and obj.started_at:
            delta = obj.completed_at - obj.started_at
            minutes = int(delta.total_seconds() / 60)
            return f"{minutes} minutes"
        return None
    
    def get_completion_percentage(self, obj):
        if obj.assessment_type:
            # Get total questions for assessment type
            total_questions = AssessmentQuestion.objects.filter(
                assessment_type=obj.assessment_type,
                is_active=True
            ).count()
            
            answered_questions = obj.responses.count()
            
            if total_questions > 0:
                return int((answered_questions / total_questions) * 100)
        return 0


class AssessmentSessionDetailSerializer(serializers.ModelSerializer):
    """Comprehensive assessment session serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    operator_name = serializers.CharField(source='operator.name', read_only=True, allow_null=True)
    responses = AssessmentResponseSerializer(many=True, read_only=True)
    duration = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()
    answered_questions = serializers.SerializerMethodField()
    risk_assessment = serializers.SerializerMethodField()
    
    class Meta:
        model = AssessmentSession
        fields = [
            'id', 'session_reference', 'user', 'user_name',
            'bst_token', 'operator', 'operator_name',
            'assessment_type', 'language',
            'started_at', 'completed_at', 'status',
            'raw_score', 'risk_level', 'should_self_exclude',
            'next_assessment_due', 'ml_risk_prediction',
            'responses', 'duration', 'completion_percentage',
            'total_questions', 'answered_questions', 'risk_assessment',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'session_reference', 'started_at', 'completed_at',
            'raw_score', 'risk_level', 'should_self_exclude',
            'next_assessment_due', 'ml_risk_prediction',
            'created_at', 'updated_at'
        ]
    
    def get_duration(self, obj):
        if obj.completed_at and obj.started_at:
            delta = obj.completed_at - obj.started_at
            return int(delta.total_seconds())
        return None
    
    def get_completion_percentage(self, obj):
        total = self.get_total_questions(obj)
        answered = self.get_answered_questions(obj)
        
        if total > 0:
            return int((answered / total) * 100)
        return 0
    
    def get_total_questions(self, obj):
        if obj.assessment_type:
            return AssessmentQuestion.objects.filter(
                assessment_type=obj.assessment_type,
                is_active=True
            ).count()
        return 0
    
    def get_answered_questions(self, obj):
        return obj.responses.count()
    
    def get_risk_assessment(self, obj):
        if obj.risk_level:
            risk_messages = {
                'none': 'No gambling problem identified. Continue practicing responsible gambling.',
                'low': 'Low risk level. Monitor your gambling habits and set limits.',
                'mild': 'Mild risk detected. Consider setting stricter limits on your gambling.',
                'moderate': 'Moderate risk level. We recommend seeking guidance and setting firm limits.',
                'high': 'High risk detected. We strongly recommend self-exclusion and professional help.',
                'severe': 'Severe gambling problem identified. Immediate self-exclusion recommended. Professional help is available.',
                'critical': 'Critical level. Immediate self-exclusion required. Please seek professional help urgently.'
            }
            
            return {
                'level': obj.risk_level,
                'score': float(obj.raw_score) if obj.raw_score else 0,
                'message': risk_messages.get(obj.risk_level, ''),
                'should_self_exclude': obj.should_self_exclude,
                'ml_prediction': float(obj.ml_risk_prediction) if obj.ml_risk_prediction else None
            }
        return None


class StartAssessmentSerializer(serializers.Serializer):
    """Start assessment serializer"""
    assessment_type = serializers.ChoiceField(
        choices=[
            ('lie_bet', 'Lie/Bet'),
            ('pgsi', 'PGSI'),
            ('dsm5', 'DSM-5')
        ],
        required=True
    )
    language = serializers.ChoiceField(
        choices=[
            ('en', 'English'),
            ('sw', 'Swahili')
        ],
        default='en'
    )
    operator_id = serializers.UUIDField(required=False, allow_null=True)


class SubmitResponseSerializer(serializers.Serializer):
    """Submit single response serializer"""
    session_id = serializers.UUIDField(required=True)
    question_id = serializers.UUIDField(required=True)
    response_value = serializers.CharField(required=True)
    
    def validate_session_id(self, value):
        if not AssessmentSession.objects.filter(id=value, status='in_progress').exists():
            raise serializers.ValidationError(
                "Session not found or already completed."
            )
        return value
    
    def validate_question_id(self, value):
        if not AssessmentQuestion.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Question not found or inactive.")
        return value


class BatchSubmitResponsesSerializer(serializers.Serializer):
    """Batch submit responses serializer"""
    session_id = serializers.UUIDField(required=True)
    responses = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=20
    )
    
    def validate_responses(self, value):
        for response in value:
            if 'question_id' not in response or 'response_value' not in response:
                raise serializers.ValidationError(
                    "Each response must include 'question_id' and 'response_value'."
                )
        return value


class CalculateRiskScoreSerializer(serializers.Serializer):
    """Calculate risk score serializer"""
    session_id = serializers.UUIDField(required=True)
    
    def validate_session_id(self, value):
        session = AssessmentSession.objects.filter(id=value).first()
        if not session:
            raise serializers.ValidationError("Session not found.")
        
        if session.status != 'in_progress':
            raise serializers.ValidationError("Session is not in progress.")
        
        # Check if all questions are answered
        total_questions = AssessmentQuestion.objects.filter(
            assessment_type=session.assessment_type,
            is_active=True
        ).count()
        
        answered = session.responses.count()
        
        if answered < total_questions:
            raise serializers.ValidationError(
                f"All questions must be answered. {answered}/{total_questions} answered."
            )
        
        return value


class RiskScoreCalculationResponseSerializer(serializers.Serializer):
    """Risk score calculation response"""
    session_id = serializers.UUIDField()
    raw_score = serializers.FloatField()
    risk_level = serializers.CharField()
    risk_score = serializers.FloatField()
    should_self_exclude = serializers.BooleanField()
    ml_prediction = serializers.FloatField(allow_null=True)
    recommendations = serializers.ListField(child=serializers.CharField())
    next_assessment_due = serializers.DateField(allow_null=True)


class MLRiskPredictionSerializer(serializers.Serializer):
    """ML risk prediction serializer"""
    user_id = serializers.UUIDField(required=False)
    behavioral_data = serializers.JSONField(required=False)
    assessment_responses = serializers.JSONField(required=False)
    
    def validate(self, attrs):
        if not attrs.get('user_id') and not attrs.get('behavioral_data'):
            raise serializers.ValidationError(
                "Either user_id or behavioral_data is required."
            )
        return attrs


class MLPredictionResponseSerializer(serializers.Serializer):
    """ML prediction response"""
    predicted_risk_score = serializers.FloatField()
    predicted_risk_level = serializers.CharField()
    confidence_score = serializers.FloatField()
    contributing_factors = serializers.ListField(child=serializers.DictField())
    model_version = serializers.CharField()
    prediction_timestamp = serializers.DateTimeField()


class AnalyzeBehaviorSerializer(serializers.Serializer):
    """Analyze behavior serializer"""
    user_id = serializers.UUIDField(required=True)
    betting_data = serializers.JSONField(required=True)
    
    def validate_betting_data(self, value):
        required_fields = ['total_bets', 'total_amount_wagered', 'betting_frequency']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(
                    f"betting_data must include '{field}'."
                )
        return value


class RecommendationsSerializer(serializers.Serializer):
    """Risk-based recommendations serializer"""
    risk_level = serializers.CharField()
    recommendations = serializers.ListField(child=serializers.CharField())
    resources = serializers.ListField(child=serializers.DictField())
    should_self_exclude = serializers.BooleanField()
    helpline_numbers = serializers.ListField(child=serializers.DictField())
    support_services = serializers.ListField(child=serializers.DictField())


class ScreeningStatisticsSerializer(serializers.Serializer):
    """Screening statistics serializer"""
    period = serializers.CharField()
    total_assessments = serializers.IntegerField()
    completed_assessments = serializers.IntegerField()
    abandoned_assessments = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    average_duration_seconds = serializers.FloatField()
    by_assessment_type = serializers.DictField()
    by_risk_level = serializers.DictField()
    high_risk_count = serializers.IntegerField()
    self_exclusion_recommendations = serializers.IntegerField()
    trend_percentage = serializers.FloatField()


class RiskDistributionSerializer(serializers.Serializer):
    """Risk distribution statistics"""
    none = serializers.IntegerField()
    low = serializers.IntegerField()
    mild = serializers.IntegerField()
    moderate = serializers.IntegerField()
    high = serializers.IntegerField()
    severe = serializers.IntegerField()
    critical = serializers.IntegerField()
    total = serializers.IntegerField()
    percentages = serializers.DictField()
