"""
Screening & Risk Assessment Admin Interface
Super Admin features for assessment management, risk scoring, and behavioral analysis
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import (
    AssessmentSession, AssessmentQuestion, AssessmentResponse, RiskScore,
    BehavioralProfile
)


class AssessmentResponseInline(admin.TabularInline):
    """Inline assessment responses"""
    model = AssessmentResponse
    extra = 0
    fields = ('question', 'response_value', 'score', 'answered_at')
    readonly_fields = ('answered_at',)
    can_delete = False


@admin.register(AssessmentSession)
class AssessmentSessionAdmin(admin.ModelAdmin):
    """Assessment session management and review"""
    list_display = (
        'session_reference', 'user_phone', 'assessment_type_badge',
        'risk_level_badge', 'status_badge', 'started_at'
    )
    list_filter = (
        'assessment_type', 'risk_level', 'status', 'should_self_exclude',
        'started_at', 'completed_at'
    )
    search_fields = (
        'session_reference', 'user__phone_number', 'user__email',
        'bst_token__token_value'
    )
    readonly_fields = (
        'id', 'session_reference', 'started_at', 'completed_at',
        'assessment_summary', 'risk_analysis'
    )
    
    fieldsets = (
        (_('Session'), {
            'fields': ('session_reference', 'user', 'bst_token', 'operator')
        }),
        (_('Assessment'), {
            'fields': (
                'assessment_type', 'language', 'status', 'should_self_exclude'
            )
        }),
        (_('Scoring'), {
            'fields': (
                'raw_score', 'risk_level', 'ml_risk_prediction'
            )
        }),
        (_('Timeline'), {
            'fields': (
                'started_at', 'completed_at', 'next_assessment_due'
            ),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('assessment_summary',),
            'classes': ('collapse',)
        }),
        (_('Risk Analysis'), {
            'fields': ('risk_analysis',),
            'classes': ('collapse',)
        }),
        (_('System'), {
            'fields': ('id', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [AssessmentResponseInline]
    actions = ['mark_completed', 'trigger_exclusion', 'reschedule_assessment']
    
    def user_phone(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_phone.short_description = _('User')
    
    def assessment_type_badge(self, obj):
        colors = {
            'lie_bet': '#2166ac',
            'pgsi': '#7fbc41',
            'dsm5': '#b35806',
            'behavioral': '#fc8d59'
        }
        color = colors.get(obj.assessment_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_assessment_type_display()
        )
    assessment_type_badge.short_description = _('Type')
    
    def risk_level_badge(self, obj):
        if not obj.risk_level:
            return 'Pending'
        colors = {
            'low': '#7fbc41',
            'moderate': '#fc8d59',
            'high': '#d73026',
            'severe': '#8B0000'
        }
        color = colors.get(obj.risk_level, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_risk_level_display()
        )
    risk_level_badge.short_description = _('Risk Level')
    
    def status_badge(self, obj):
        colors = {
            'in_progress': '#fc8d59',
            'completed': '#7fbc41',
            'abandoned': '#cccccc'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = _('Status')
    
    def assessment_summary(self, obj):
        status = '✓ Completed' if obj.completed_at else '⏳ In Progress'
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Type:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '<p><strong>Raw Score:</strong> {}</p>'
            '<p><strong>Risk Level:</strong> {}</p>'
            '<p><strong>Self-Exclude:</strong> {}</p>'
            '</div>',
            obj.get_assessment_type_display(),
            status,
            obj.raw_score or 'N/A',
            obj.get_risk_level_display() if obj.risk_level else 'Pending',
            'Yes' if obj.should_self_exclude else 'No'
        )
    assessment_summary.short_description = _('Summary')
    
    def risk_analysis(self, obj):
        questions_answered = obj.responses.count()
        avg_score = 0
        if questions_answered > 0:
            avg_score = sum([r.score for r in obj.responses.all()]) / questions_answered
        
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Questions Answered:</strong> {}</p>'
            '<p><strong>Average Score:</strong> {:.2f}</p>'
            '<p><strong>ML Prediction:</strong> {}</p>'
            '<p><strong>Next Assessment Due:</strong> {}</p>'
            '</div>',
            questions_answered,
            avg_score,
            obj.ml_risk_prediction or 'N/A',
            obj.next_assessment_due.strftime('%Y-%m-%d') if obj.next_assessment_due else 'N/A'
        )
    risk_analysis.short_description = _('Risk Analysis')
    
    @admin.action(description=_('Mark as completed'))
    def mark_completed(self, request, queryset):
        updated = queryset.filter(status='in_progress').update(
            status='completed',
            completed_at=timezone.now()
        )
        self.message_user(request, _('%d assessments marked completed') % updated)
    
    @admin.action(description=_('Trigger self-exclusion'))
    def trigger_exclusion(self, request, queryset):
        updated = queryset.update(should_self_exclude=True)
        self.message_user(request, _('Self-exclusion flagged for %d assessments') % updated)
    
    @admin.action(description=_('Reschedule assessment'))
    def reschedule_assessment(self, request, queryset):
        from datetime import timedelta
        next_date = timezone.now() + timedelta(days=30)
        updated = queryset.update(next_assessment_due=next_date)
        self.message_user(request, _('%d assessments rescheduled') % updated)


@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    """Assessment question bank management"""
    list_display = (
        'question_code', 'assessment_type_badge', 'question_number',
        'response_type', 'max_score', 'is_active'
    )
    list_filter = ('assessment_type', 'is_active', 'response_type')
    search_fields = ('question_code', 'question_text_en', 'question_text_sw')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Question Details'), {
            'fields': ('question_code', 'assessment_type', 'question_number')
        }),
        (_('Content'), {
            'fields': ('question_text_en', 'question_text_sw')
        }),
        (_('Response Configuration'), {
            'fields': ('response_type', 'response_options', 'max_score')
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('System'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_questions', 'deactivate_questions']
    
    def assessment_type_badge(self, obj):
        colors = {
            'lie_bet': '#2166ac',
            'pgsi': '#7fbc41',
            'dsm5': '#b35806',
            'behavioral': '#fc8d59'
        }
        color = colors.get(obj.assessment_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_assessment_type_display()
        )
    assessment_type_badge.short_description = _('Type')
    
    @admin.action(description=_('Activate selected questions'))
    def activate_questions(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _('%d questions activated') % updated)
    
    @admin.action(description=_('Deactivate selected questions'))
    def deactivate_questions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _('%d questions deactivated') % updated)


@admin.register(AssessmentResponse)
class AssessmentResponseAdmin(admin.ModelAdmin):
    """View and analyze assessment responses"""
    list_display = (
        'session_reference', 'question_code', 'response_value',
        'score', 'answered_at'
    )
    list_filter = ('answered_at', 'session__assessment_type')
    search_fields = (
        'session__session_reference', 'question__question_code',
        'session__user__phone_number'
    )
    readonly_fields = ('answered_at',)
    
    fieldsets = (
        (_('Response'), {
            'fields': ('session', 'question', 'response_value')
        }),
        (_('Scoring'), {
            'fields': ('score',)
        }),
        (_('Timeline'), {
            'fields': ('answered_at',),
            'classes': ('collapse',)
        }),
    )
    
    def session_reference(self, obj):
        return obj.session.session_reference
    session_reference.short_description = _('Session')
    
    def question_code(self, obj):
        return obj.question.question_code
    question_code.short_description = _('Question')
    
    def has_add_permission(self, request):
        """Responses are auto-generated by assessment system"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep responses for audit"""
        return False


@admin.register(RiskScore)
class RiskScoreAdmin(admin.ModelAdmin):
    """Historical risk score tracking"""
    list_display = (
        'user_phone', 'score_date', 'risk_level_badge',
        'risk_score', 'score_source', 'is_current'
    )
    list_filter = (
        'risk_level', 'is_current', 'score_date', 'score_source'
    )
    search_fields = (
        'user__phone_number', 'user__email', 'score_source',
        'bst_token__token_value'
    )
    readonly_fields = ('score_date',)
    
    fieldsets = (
        (_('Score'), {
            'fields': ('user', 'bst_token', 'risk_level', 'risk_score')
        }),
        (_('Source'), {
            'fields': ('score_source', 'score_date')
        }),
        (_('Status'), {
            'fields': ('is_current',)
        }),
    )
    
    actions = ['mark_current', 'mark_historical']
    
    def user_phone(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_phone.short_description = _('User')
    
    def risk_level_badge(self, obj):
        colors = {
            'low': '#7fbc41',
            'moderate': '#fc8d59',
            'high': '#d73026',
            'severe': '#8B0000'
        }
        color = colors.get(obj.risk_level, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_risk_level_display()
        )
    risk_level_badge.short_description = _('Level')
    
    @admin.action(description=_('Mark as current'))
    def mark_current(self, request, queryset):
        # First, mark all existing current scores as historical
        RiskScore.objects.filter(
            user__in=[obj.user for obj in queryset],
            is_current=True
        ).update(is_current=False)
        
        # Then mark selected as current
        updated = queryset.update(is_current=True)
        self.message_user(request, _('%d scores marked current') % updated)
    
    @admin.action(description=_('Mark as historical'))
    def mark_historical(self, request, queryset):
        updated = queryset.update(is_current=False)
        self.message_user(request, _('%d scores marked historical') % updated)


@admin.register(BehavioralProfile)
class BehavioralProfileAdmin(admin.ModelAdmin):
    """User behavioral profile and ML-powered analysis"""
    list_display = (
        'user_phone', 'total_bets_count', 'betting_frequency_daily',
        'overall_risk_score_badge', 'last_updated'
    )
    list_filter = ('last_updated',)
    search_fields = ('user__phone_number', 'user__email')
    readonly_fields = (
        'user', 'last_updated', 'behavioral_summary'
    )
    
    fieldsets = (
        (_('User'), {
            'fields': ('user',)
        }),
        (_('Betting Activity'), {
            'fields': (
                'total_bets_count', 'total_amount_wagered',
                'betting_frequency_daily'
            )
        }),
        (_('Risk Indicators'), {
            'fields': (
                'late_night_betting_count', 'loss_chasing_score',
                'overall_risk_score'
            )
        }),
        (_('ML Features'), {
            'fields': (
                'consecutive_losses_count', 'max_bet_increase_percent',
                'frequent_session_switches', 'rapid_bet_escalation_score'
            ),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('behavioral_summary',),
            'classes': ('collapse',)
        }),
    )
    
    def user_phone(self, obj):
        return obj.user.phone_number if obj.user else 'N/A'
    user_phone.short_description = _('User')
    
    def overall_risk_score_badge(self, obj):
        score = obj.overall_risk_score
        if score < 30:
            color = '#7fbc41'
            label = 'Low'
        elif score < 60:
            color = '#fc8d59'
            label = 'Moderate'
        else:
            color = '#d73026'
            label = 'High'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{} ({:.1f})</span>',
            color, label, score
        )
    overall_risk_score_badge.short_description = _('Overall Risk')
    
    def behavioral_summary(self, obj):
        return format_html(
            '<div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px;">'
            '<p><strong>Total Bets:</strong> {}</p>'
            '<p><strong>Total Wagered:</strong> ${:,.2f}</p>'
            '<p><strong>Daily Frequency:</strong> {:.2f}</p>'
            '<p><strong>Late Night Bets:</strong> {}</p>'
            '<p><strong>Loss Chasing Score:</strong> {:.2f}</p>'
            '<p><strong>Overall Risk:</strong> {:.2f}%</p>'
            '</div>',
            obj.total_bets_count,
            float(obj.total_amount_wagered),
            float(obj.betting_frequency_daily),
            obj.late_night_betting_count,
            float(obj.loss_chasing_score),
            float(obj.overall_risk_score)
        )
    behavioral_summary.short_description = _('Summary')
    
    def has_add_permission(self, request):
        """Profiles are auto-generated"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Keep behavioral data for analysis"""
        return False
