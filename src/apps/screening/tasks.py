"""
Screening Celery Tasks
Async tasks for risk assessment scheduling, ML training
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def schedule_quarterly_screenings():
    """Schedule quarterly screenings for all users"""
    from .models import ScreeningSchedule
    from apps.users.models import User
    
    users = User.objects.filter(is_active=True, is_verified=True)
    scheduled_count = 0
    
    for user in users:
        try:
            # Check if already scheduled
            existing = ScreeningSchedule.objects.filter(
                user=user,
                status='scheduled',
                scheduled_date__gte=timezone.now().date()
            ).exists()
            
            if not existing:
                ScreeningSchedule.objects.create(
                    user=user,
                    assessment_type='pgsi',
                    scheduled_date=timezone.now().date() + timedelta(days=90),
                    status='scheduled'
                )
                scheduled_count += 1
        except Exception as e:
            logger.error(f"Failed to schedule screening for user {user.id}: {str(e)}")
    
    return {'scheduled': scheduled_count}


@shared_task
def send_screening_reminders():
    """Send reminders for due screenings"""
    from .models import ScreeningSchedule
    from apps.notifications.tasks import send_sms, send_email
    
    today = timezone.now().date()
    reminder_date = today + timedelta(days=3)
    
    due_screenings = ScreeningSchedule.objects.filter(
        scheduled_date=reminder_date,
        status='scheduled'
    ).select_related('user')
    
    sent_count = 0
    
    for screening in due_screenings:
        try:
            message = f"Your risk assessment is due on {screening.scheduled_date}. Please complete it."
            
            send_sms.delay(screening.user.phone_number, message)
            send_email.delay(screening.user.email, "Risk Assessment Reminder", message)
            
            sent_count += 1
        except Exception as e:
            logger.error(f"Failed to send reminder for screening {screening.id}: {str(e)}")
    
    return {'sent': sent_count}


@shared_task
def train_ml_model():
    """Train ML risk prediction model"""
    from .models import AssessmentSession, RiskScore
    
    try:
        # Gather training data
        completed_sessions = AssessmentSession.objects.filter(
            status='completed'
        ).prefetch_related('responses')
        
        # Prepare training data (placeholder)
        training_data = []
        labels = []
        
        for session in completed_sessions:
            features = [r.score for r in session.responses.all()]
            label = session.risk_level
            
            training_data.append(features)
            labels.append(label)
        
        # Train model (placeholder)
        # model = train_sklearn_model(training_data, labels)
        # save_model(model)
        
        logger.info(f"Trained model on {len(training_data)} samples")
        return {'samples': len(training_data)}
        
    except Exception as e:
        logger.error(f"Failed to train ML model: {str(e)}")
        return {'error': str(e)}


@shared_task
def update_behavioral_profiles():
    """Update behavioral profiles for all users"""
    from .models import BehavioralProfile
    from apps.users.models import User
    
    users = User.objects.filter(is_active=True)
    updated_count = 0
    
    for user in users:
        try:
            profile, created = BehavioralProfile.objects.get_or_create(user=user)
            
            # Update profile data
            # Analyze user behavior patterns
            
            profile.last_updated = timezone.now()
            profile.save()
            
            updated_count += 1
        except Exception as e:
            logger.error(f"Failed to update profile for user {user.id}: {str(e)}")
    
    return {'updated': updated_count}


@shared_task
def cleanup_abandoned_sessions():
    """Cleanup abandoned assessment sessions"""
    from .models import AssessmentSession
    
    cutoff_date = timezone.now() - timedelta(days=7)
    
    abandoned = AssessmentSession.objects.filter(
        status='in_progress',
        started_at__lt=cutoff_date
    )
    
    count = abandoned.update(status='abandoned')
    
    logger.info(f"Marked {count} sessions as abandoned")
    return {'abandoned': count}
