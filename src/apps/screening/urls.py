"""
Screening & Risk Assessment API URLs
Lie/Bet, PGSI, DSM-5, ML predictions, behavioral analysis
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'screening'

# Router for ViewSets
router = DefaultRouter()
router.register(r'sessions', views.AssessmentSessionViewSet, basename='session')
router.register(r'questions', views.AssessmentQuestionViewSet, basename='question')
router.register(r'responses', views.AssessmentResponseViewSet, basename='response')
router.register(r'risk-scores', views.RiskScoreViewSet, basename='risk_score')
router.register(r'schedules', views.ScreeningScheduleViewSet, basename='schedule')

urlpatterns = [
    # Assessment Sessions
    path('start/', views.StartAssessmentView.as_view(), name='start_assessment'),
    path('sessions/<uuid:pk>/submit/', views.SubmitAssessmentView.as_view(), name='submit_assessment'),
    path('sessions/<uuid:pk>/complete/', views.CompleteAssessmentView.as_view(), name='complete_assessment'),
    path('sessions/<uuid:pk>/abandon/', views.AbandonAssessmentView.as_view(), name='abandon_assessment'),
    
    # Assessment Types
    path('liebet/start/', views.StartLieBetAssessmentView.as_view(), name='start_liebet'),
    path('pgsi/start/', views.StartPGSIAssessmentView.as_view(), name='start_pgsi'),
    path('dsm5/start/', views.StartDSM5AssessmentView.as_view(), name='start_dsm5'),
    
    # Questions
    path('questions/type/<str:assessment_type>/', views.QuestionsByTypeView.as_view(), name='questions_by_type'),
    path('questions/next/', views.NextQuestionView.as_view(), name='next_question'),
    
    # Responses
    path('respond/', views.RespondToQuestionView.as_view(), name='submit_response'),
    path('responses/batch/', views.BatchSubmitResponsesView.as_view(), name='batch_submit_responses'),
    
    # Risk Scoring
    path('risk/calculate/', views.CalculateRiskScoreView.as_view(), name='calculate_risk'),
    path('risk/current/', views.CurrentRiskScoreView.as_view(), name='current_risk'),
    path('risk/history/', views.RiskScoreHistoryView.as_view(), name='risk_history'),
    path('risk/trends/', views.RiskTrendsView.as_view(), name='risk_trends'),
    
    # Behavioral Analysis
    path('behavioral/profile/', views.BehavioralProfileView.as_view(), name='behavioral_profile'),
    path('behavioral/analyze/', views.AnalyzeBehaviorView.as_view(), name='analyze_behavior'),
    path('behavioral/update/', views.UpdateBehavioralProfileView.as_view(), name='update_behavioral'),
    
    # ML Predictions
    path('ml/predict/', views.MLRiskPredictionView.as_view(), name='ml_predict'),
    path('ml/train/', views.TriggerMLTrainingView.as_view(), name='ml_train'),
    
    # Scheduling
    path('schedule/quarterly/', views.ScheduleQuarterlyScreeningView.as_view(), name='schedule_quarterly'),
    path('schedule/due/', views.DueScreeningsView.as_view(), name='due_screenings'),
    path('schedule/overdue/', views.OverdueScreeningsView.as_view(), name='overdue_screenings'),
    
    # User-Facing
    path('my-assessments/', views.MyAssessmentsView.as_view(), name='my_assessments'),
    path('my-risk/', views.MyRiskProfileView.as_view(), name='my_risk_profile'),
    path('recommendations/', views.GetRecommendationsView.as_view(), name='recommendations'),
    
    # Statistics
    path('statistics/', views.ScreeningStatisticsView.as_view(), name='statistics'),
    path('statistics/completion-rate/', views.CompletionRateView.as_view(), name='completion_rate'),
    path('statistics/risk-distribution/', views.RiskDistributionView.as_view(), name='risk_distribution'),
    
    # Admin
    path('trigger-quarterly/', views.TriggerQuarterlyScreeningView.as_view(), name='trigger_quarterly'),
    path('send-reminders/', views.SendAssessmentRemindersView.as_view(), name='send_reminders'),
    
    # Router URLs
    path('', include(router.urls)),
]
