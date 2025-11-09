"""
Screening & Risk Assessment Views
Lie/Bet, PGSI, DSM-5 assessments with ML predictions
"""
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction

from .models import (
    AssessmentSession, AssessmentQuestion, AssessmentResponse,
    RiskScore, BehavioralProfile, ScreeningSchedule
)
from .serializers import (
    AssessmentSessionListSerializer, AssessmentSessionDetailSerializer,
    AssessmentQuestionSerializer, AssessmentResponseSerializer,
    RiskScoreSerializer, BehavioralProfileSerializer,
    ScreeningScheduleSerializer, StartAssessmentSerializer,
    SubmitResponseSerializer, BatchSubmitResponsesSerializer,
    CalculateRiskScoreSerializer, MLRiskPredictionSerializer
)
from apps.api.permissions import IsGRAKStaff, CanScreenUser
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class AssessmentSessionViewSet(TimingMixin, viewsets.ModelViewSet):
    """Assessment session CRUD"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AssessmentSessionListSerializer
        return AssessmentSessionDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['grak_admin', 'grak_officer']:
            return AssessmentSession.objects.select_related('user', 'operator').prefetch_related('responses')
        
        return AssessmentSession.objects.filter(user=user).select_related('operator')


class StartAssessmentView(TimingMixin, SuccessResponseMixin, APIView):
    """Start new assessment session"""
    permission_classes = [IsAuthenticated, CanScreenUser]
    
    @transaction.atomic
    def post(self, request):
        serializer = StartAssessmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create session
        session = AssessmentSession.objects.create(
            user=request.user,
            assessment_type=serializer.validated_data['assessment_type'],
            language=serializer.validated_data.get('language', 'en'),
            operator_id=serializer.validated_data.get('operator_id'),
            started_at=timezone.now(),
            status='in_progress'
        )
        
        # Get questions for this assessment type
        questions = AssessmentQuestion.objects.filter(
            assessment_type=session.assessment_type,
            is_active=True
        ).order_by('question_number')
        
        return self.success_response(
            data={
                'session': AssessmentSessionDetailSerializer(session).data,
                'questions': AssessmentQuestionSerializer(questions, many=True, context={'request': request}).data
            },
            message='Assessment started',
            status_code=status.HTTP_201_CREATED
        )


class SubmitResponseView(TimingMixin, SuccessResponseMixin, APIView):
    """Submit single assessment response"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = SubmitResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session = AssessmentSession.objects.get(id=serializer.validated_data['session_id'])
        
        if session.user != request.user:
            return self.error_response(
                message='Not authorized',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        question = AssessmentQuestion.objects.get(id=serializer.validated_data['question_id'])
        
        # Calculate score based on response
        response_value = serializer.validated_data['response_value']
        score = 0
        
        if question.response_options and 'options' in question.response_options:
            for option in question.response_options['options']:
                if option['value'] == response_value:
                    score = option.get('score', 0)
                    break
        
        # Create or update response
        response, created = AssessmentResponse.objects.update_or_create(
            session=session,
            question=question,
            defaults={
                'response_value': response_value,
                'score': score,
                'answered_at': timezone.now()
            }
        )
        
        return self.success_response(
            data=AssessmentResponseSerializer(response).data,
            message='Response recorded'
        )


class BatchSubmitResponsesView(TimingMixin, SuccessResponseMixin, APIView):
    """Submit multiple responses at once"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = BatchSubmitResponsesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session = AssessmentSession.objects.get(id=serializer.validated_data['session_id'])
        
        if session.user != request.user:
            return self.error_response(
                message='Not authorized',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        responses_data = serializer.validated_data['responses']
        created_responses = []
        
        for resp_data in responses_data:
            question = AssessmentQuestion.objects.get(id=resp_data['question_id'])
            response_value = resp_data['response_value']
            
            # Calculate score
            score = 0
            if question.response_options and 'options' in question.response_options:
                for option in question.response_options['options']:
                    if option['value'] == response_value:
                        score = option.get('score', 0)
                        break
            
            response, _ = AssessmentResponse.objects.update_or_create(
                session=session,
                question=question,
                defaults={
                    'response_value': response_value,
                    'score': score,
                    'answered_at': timezone.now()
                }
            )
            created_responses.append(response)
        
        return self.success_response(
            data={
                'responses': AssessmentResponseSerializer(created_responses, many=True).data,
                'count': len(created_responses)
            },
            message=f'{len(created_responses)} responses recorded'
        )


class CalculateRiskScoreView(TimingMixin, SuccessResponseMixin, APIView):
    """Calculate risk score for completed assessment"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        serializer = CalculateRiskScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session = AssessmentSession.objects.get(id=serializer.validated_data['session_id'])
        
        if session.user != request.user and request.user.role not in ['grak_admin', 'grak_officer']:
            return self.error_response(
                message='Not authorized',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate total score
        responses = session.responses.all()
        total_score = sum(r.score for r in responses)
        
        # Determine risk level based on assessment type
        risk_level = 'none'
        should_self_exclude = False
        
        if session.assessment_type == 'lie_bet':
            if total_score >= 1:
                risk_level = 'high'
                should_self_exclude = True
        elif session.assessment_type == 'pgsi':
            if total_score == 0:
                risk_level = 'none'
            elif total_score <= 2:
                risk_level = 'low'
            elif total_score <= 7:
                risk_level = 'moderate'
            else:
                risk_level = 'high'
                should_self_exclude = True
        elif session.assessment_type == 'dsm5':
            if total_score <= 1:
                risk_level = 'none'
            elif total_score <= 3:
                risk_level = 'mild'
            elif total_score <= 5:
                risk_level = 'moderate'
            else:
                risk_level = 'severe'
                should_self_exclude = True
        
        # Update session
        session.raw_score = total_score
        session.risk_level = risk_level
        session.should_self_exclude = should_self_exclude
        session.status = 'completed'
        session.completed_at = timezone.now()
        
        # Calculate next assessment date
        from datetime import timedelta
        if risk_level in ['high', 'severe']:
            session.next_assessment_due = timezone.now().date() + timedelta(days=30)
        else:
            session.next_assessment_due = timezone.now().date() + timedelta(days=90)
        
        session.save()
        
        # Create risk score record
        risk_score = RiskScore.objects.create(
            user=session.user,
            bst_token_id=session.bst_token_id,
            score_date=timezone.now().date(),
            risk_level=risk_level,
            risk_score=total_score,
            score_source=session.assessment_type,
            is_current=True
        )
        
        # Mark previous scores as not current
        RiskScore.objects.filter(
            user=session.user,
            is_current=True
        ).exclude(id=risk_score.id).update(is_current=False)
        
        return self.success_response(
            data={
                'session_id': str(session.id),
                'raw_score': float(total_score),
                'risk_level': risk_level,
                'risk_score': float(total_score),
                'should_self_exclude': should_self_exclude,
                'ml_prediction': None,
                'recommendations': self._get_recommendations(risk_level),
                'next_assessment_due': str(session.next_assessment_due)
            },
            message='Risk score calculated'
        )
    
    def _get_recommendations(self, risk_level):
        recommendations = {
            'none': ['Continue practicing responsible gambling', 'Set personal limits'],
            'low': ['Monitor your gambling habits', 'Set spending limits', 'Take regular breaks'],
            'mild': ['Consider setting stricter limits', 'Seek guidance if concerned', 'Use responsible gambling tools'],
            'moderate': ['Strongly recommend setting firm limits', 'Consider professional guidance', 'Use self-exclusion tools'],
            'high': ['Self-exclusion strongly recommended', 'Seek professional help', 'Contact support services'],
            'severe': ['Immediate self-exclusion recommended', 'Professional help essential', 'Contact crisis helpline'],
            'critical': ['URGENT: Seek immediate professional help', 'Self-exclude immediately', 'Emergency support available']
        }
        return recommendations.get(risk_level, [])


class MLRiskPredictionView(TimingMixin, SuccessResponseMixin, APIView):
    """Get ML-based risk prediction"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        serializer = MLRiskPredictionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Placeholder for ML prediction
        # In production, this would call actual ML model
        prediction = {
            'predicted_risk_score': 0.65,
            'predicted_risk_level': 'moderate',
            'confidence_score': 0.82,
            'contributing_factors': [
                {'factor': 'betting_frequency', 'weight': 0.35},
                {'factor': 'loss_chasing', 'weight': 0.28},
                {'factor': 'late_night_betting', 'weight': 0.22}
            ],
            'model_version': 'v1.0.0',
            'prediction_timestamp': timezone.now().isoformat()
        }
        
        return self.success_response(data=prediction)


class MyAssessmentsView(TimingMixin, generics.ListAPIView):
    """Get current user's assessments"""
    serializer_class = AssessmentSessionListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AssessmentSession.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


class ScheduledScreeningsView(TimingMixin, generics.ListAPIView):
    """Get scheduled screenings"""
    serializer_class = ScreeningScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return ScreeningSchedule.objects.select_related('user').all()
        
        return ScreeningSchedule.objects.filter(user=self.request.user)


class RiskScoreViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Risk score history"""
    serializer_class = RiskScoreSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return RiskScore.objects.select_related('user').order_by('-score_date')
        
        return RiskScore.objects.filter(user=self.request.user).order_by('-score_date')


class BehavioralProfileViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Behavioral profiles"""
    serializer_class = BehavioralProfileSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return BehavioralProfile.objects.select_related('user')


class ScreeningStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """Screening statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        from datetime import timedelta
        today = timezone.now().date()
        
        stats = {
            'total_assessments': AssessmentSession.objects.count(),
            'completed_today': AssessmentSession.objects.filter(
                completed_at__date=today
            ).count(),
            'high_risk_users': RiskScore.objects.filter(
                risk_level__in=['high', 'severe', 'critical'],
                is_current=True
            ).count(),
            'by_assessment_type': {},
            'by_risk_level': {},
            'completion_rate': 0
        }
        
        return self.success_response(data=stats)

class AssessmentQuestionViewSet(TimingMixin, viewsets.ModelViewSet):
    """Assessment questions"""
    serializer_class = AssessmentQuestionSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return AssessmentQuestion.objects.filter(is_active=True).order_by('question_number')


class AssessmentResponseViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Assessment responses"""
    serializer_class = AssessmentResponseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return AssessmentResponse.objects.select_related('session', 'question').all()
        return AssessmentResponse.objects.filter(session__user=self.request.user)


class ScreeningScheduleViewSet(TimingMixin, viewsets.ModelViewSet):
    """Screening schedules"""
    serializer_class = ScreeningScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role in ['grak_admin', 'grak_officer']:
            return ScreeningSchedule.objects.select_related('user').all()
        return ScreeningSchedule.objects.filter(user=self.request.user)


# Missing views
class RespondToQuestionView(TimingMixin, SuccessResponseMixin, APIView):
    """Submit single assessment response"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        from .serializers import SubmitResponseSerializer
        
        serializer = SubmitResponseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        session_id = serializer.validated_data['session_id']
        question_id = serializer.validated_data['question_id']
        response_value = serializer.validated_data['response_value']
        
        # Get session and verify ownership
        session = AssessmentSession.objects.get(id=session_id, user=request.user)
        question = AssessmentQuestion.objects.get(id=question_id)
        
        # Verify question belongs to assessment type
        if question.assessment_type != session.assessment_type:
            return Response({
                'success': False,
                'error': {'question_id': 'Question does not belong to this assessment type'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate score based on response
        score = 0
        if question.response_type == 'yes_no':
            score = question.max_score if response_value.lower() == 'yes' else 0
        elif question.response_type == 'frequency':
            # PGSI scoring: never=0, sometimes=1, most_of_time=2, almost_always=3
            score_map = {'never': 0, 'sometimes': 1, 'most_of_time': 2, 'almost_always': 3}
            score = score_map.get(response_value, 0)
        
        # Create or update response
        response_obj, created = AssessmentResponse.objects.update_or_create(
            session=session,
            question=question,
            defaults={
                'response_value': response_value,
                'score': score
            }
        )
        
        return self.success_response(
            data=AssessmentResponseSerializer(response_obj).data,
            message='Response recorded successfully'
        )


class SubmitAssessmentView(TimingMixin, SuccessResponseMixin, APIView):
    """Submit assessment responses"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        session = AssessmentSession.objects.get(pk=pk, user=request.user)
        # Process submission
        return self.success_response(message='Assessment submitted')


class CompleteAssessmentView(TimingMixin, SuccessResponseMixin, APIView):
    """Complete assessment"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, pk):
        session = AssessmentSession.objects.get(pk=pk, user=request.user)
        session.status = 'completed'
        session.completed_at = timezone.now()
        session.save()
        
        return self.success_response(message='Assessment completed')


class AbandonAssessmentView(TimingMixin, SuccessResponseMixin, APIView):
    """Abandon assessment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        session = AssessmentSession.objects.get(pk=pk, user=request.user)
        session.status = 'abandoned'
        session.save()
        
        return self.success_response(message='Assessment abandoned')


class StartLieBetAssessmentView(TimingMixin, SuccessResponseMixin, APIView):
    """Start Lie/Bet assessment"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        import uuid
        session = AssessmentSession.objects.create(
            user=request.user,
            session_reference=f'LB-{uuid.uuid4().hex[:12].upper()}',
            assessment_type='lie_bet',
            status='in_progress',
            started_at=timezone.now()
        )
        
        questions = AssessmentQuestion.objects.filter(
            assessment_type='lie_bet',
            is_active=True
        ).order_by('question_number')
        
        return self.success_response(
            data={
                'session': AssessmentSessionDetailSerializer(session).data,
                'questions': AssessmentQuestionSerializer(questions, many=True, context={'request': request}).data
            },
            status_code=status.HTTP_201_CREATED
        )


class StartPGSIAssessmentView(TimingMixin, SuccessResponseMixin, APIView):
    """Start PGSI assessment"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        import uuid
        session = AssessmentSession.objects.create(
            user=request.user,
            session_reference=f'PGSI-{uuid.uuid4().hex[:12].upper()}',
            assessment_type='pgsi',
            status='in_progress',
            started_at=timezone.now()
        )
        
        questions = AssessmentQuestion.objects.filter(
            assessment_type='pgsi',
            is_active=True
        ).order_by('question_number')
        
        return self.success_response(
            data={
                'session': AssessmentSessionDetailSerializer(session).data,
                'questions': AssessmentQuestionSerializer(questions, many=True, context={'request': request}).data
            },
            status_code=status.HTTP_201_CREATED
        )


class StartDSM5AssessmentView(TimingMixin, SuccessResponseMixin, APIView):
    """Start DSM-5 assessment"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        import uuid
        session = AssessmentSession.objects.create(
            user=request.user,
            session_reference=f'DSM5-{uuid.uuid4().hex[:12].upper()}',
            assessment_type='dsm5',
            status='in_progress',
            started_at=timezone.now()
        )
        
        questions = AssessmentQuestion.objects.filter(
            assessment_type='dsm5',
            is_active=True
        ).order_by('question_number')
        
        return self.success_response(
            data={
                'session': AssessmentSessionDetailSerializer(session).data,
                'questions': AssessmentQuestionSerializer(questions, many=True, context={'request': request}).data
            },
            status_code=status.HTTP_201_CREATED
        )


class QuestionsByTypeView(TimingMixin, SuccessResponseMixin, APIView):
    """Get questions by assessment type"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, assessment_type):
        questions = AssessmentQuestion.objects.filter(
            assessment_type=assessment_type,
            is_active=True
        ).order_by('question_number')
        
        return self.success_response(
            data=AssessmentQuestionSerializer(questions, many=True, context={'request': request}).data
        )


class NextQuestionView(TimingMixin, SuccessResponseMixin, APIView):
    """Get next question"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        session = AssessmentSession.objects.get(pk=session_id, user=request.user)
        
        answered = session.responses.values_list('question_id', flat=True)
        next_question = AssessmentQuestion.objects.filter(
            assessment_type=session.assessment_type,
            is_active=True
        ).exclude(id__in=answered).order_by('question_number').first()
        
        if next_question:
            return self.success_response(
                data=AssessmentQuestionSerializer(next_question, context={'request': request}).data
            )
        
        return self.success_response(data=None, message='Assessment complete')


class CurrentRiskScoreView(TimingMixin, SuccessResponseMixin, APIView):
    """Get current risk score"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        risk_score = RiskScore.objects.filter(
            user=request.user,
            is_current=True
        ).first()
        
        if risk_score:
            return self.success_response(data=RiskScoreSerializer(risk_score).data)
        
        return self.success_response(data=None, message='No current risk score')


class RiskScoreHistoryView(TimingMixin, generics.ListAPIView):
    """Risk score history"""
    serializer_class = RiskScoreSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RiskScore.objects.filter(user=self.request.user).order_by('-score_date')


class RiskTrendsView(TimingMixin, SuccessResponseMixin, APIView):
    """Risk trends"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        scores = RiskScore.objects.filter(user=request.user).order_by('score_date')[:12]
        
        trends = {
            'trend_direction': 'stable',
            'scores': RiskScoreSerializer(scores, many=True).data
        }
        
        return self.success_response(data=trends)


class BehavioralProfileView(TimingMixin, SuccessResponseMixin, APIView):
    """Get behavioral profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = BehavioralProfile.objects.filter(user=request.user).first()
        
        if profile:
            return self.success_response(data=BehavioralProfileSerializer(profile).data)
        
        return self.success_response(data=None)


class AnalyzeBehaviorView(TimingMixin, SuccessResponseMixin, APIView):
    """Analyze behavior"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        
        # Analyze behavior (placeholder)
        analysis = {
            'risk_indicators': [],
            'patterns': [],
            'recommendations': []
        }
        
        return self.success_response(data=analysis)


class UpdateBehavioralProfileView(TimingMixin, SuccessResponseMixin, APIView):
    """Update behavioral profile"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        user_id = request.data.get('user_id')
        
        # Update profile (placeholder)
        return self.success_response(message='Behavioral profile updated')


class TriggerMLTrainingView(TimingMixin, SuccessResponseMixin, APIView):
    """Trigger ML model training"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import train_ml_model
        task = train_ml_model.delay()
        
        return self.success_response(data={'task_id': task.id}, message='ML training started')


class ScheduleQuarterlyScreeningView(TimingMixin, SuccessResponseMixin, APIView):
    """Schedule quarterly screening"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        user_id = request.data.get('user_id')
        
        from datetime import timedelta
        scheduled_date = timezone.now().date() + timedelta(days=90)
        
        schedule = ScreeningSchedule.objects.create(
            user_id=user_id,
            scheduled_date=scheduled_date,
            assessment_type='pgsi',
            status='scheduled'
        )
        
        return self.success_response(
            data=ScreeningScheduleSerializer(schedule).data,
            status_code=status.HTTP_201_CREATED
        )


class DueScreeningsView(TimingMixin, generics.ListAPIView):
    """Due screenings"""
    serializer_class = ScreeningScheduleSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        today = timezone.now().date()
        return ScreeningSchedule.objects.filter(
            scheduled_date__lte=today,
            status='scheduled'
        ).select_related('user')


class OverdueScreeningsView(TimingMixin, generics.ListAPIView):
    """Overdue screenings"""
    serializer_class = ScreeningScheduleSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        today = timezone.now().date()
        return ScreeningSchedule.objects.filter(
            scheduled_date__lt=today,
            status='scheduled'
        ).select_related('user')


class MyRiskProfileView(TimingMixin, SuccessResponseMixin, APIView):
    """Get user's risk profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        current_risk = RiskScore.objects.filter(
            user=request.user,
            is_current=True
        ).first()
        
        profile = {
            'current_risk': RiskScoreSerializer(current_risk).data if current_risk else None,
            'last_assessment': None,
            'next_assessment_due': None
        }
        
        return self.success_response(data=profile)


class GetRecommendationsView(TimingMixin, SuccessResponseMixin, APIView):
    """Get recommendations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        recommendations = [
            'Set spending limits',
            'Take regular breaks',
            'Consider self-exclusion if concerned'
        ]
        
        return self.success_response(data={'recommendations': recommendations})


class CompletionRateView(TimingMixin, SuccessResponseMixin, APIView):
    """Assessment completion rate"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        total = AssessmentSession.objects.count()
        completed = AssessmentSession.objects.filter(status='completed').count()
        rate = (completed / total * 100) if total > 0 else 0
        
        return self.success_response(data={'completion_rate': rate})


class RiskDistributionView(TimingMixin, SuccessResponseMixin, APIView):
    """Risk level distribution"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        distribution = {}
        for level in ['none', 'low', 'mild', 'moderate', 'high', 'severe', 'critical']:
            distribution[level] = RiskScore.objects.filter(
                risk_level=level,
                is_current=True
            ).count()
        
        return self.success_response(data=distribution)


class TriggerQuarterlyScreeningView(TimingMixin, SuccessResponseMixin, APIView):
    """Trigger quarterly screening for all users"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import schedule_quarterly_screenings
        task = schedule_quarterly_screenings.delay()
        
        return self.success_response(data={'task_id': task.id}, message='Quarterly screening triggered')


class SendAssessmentRemindersView(TimingMixin, SuccessResponseMixin, APIView):
    """Send assessment reminders"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        from .tasks import send_screening_reminders
        task = send_screening_reminders.delay()
        
        return self.success_response(data={'task_id': task.id}, message='Reminders queued')
