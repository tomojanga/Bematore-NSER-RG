"""
Settlements & Financial Admin Interface
Super Admin features for transaction tracking, invoicing, and financial reconciliation
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.utils import timezone
from .models import Transaction, Invoice


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Financial transaction management"""
    list_display = (
        'transaction_reference', 'operator_name', 'transaction_type_badge',
        'amount_display', 'status_badge', 'initiated_at'
    )
    list_filter = (
        'transaction_type', 'status', 'payment_method', 'currency', 'initiated_at'
    )
    search_fields = (
        'transaction_reference', 'operator__name', 'payment_reference'
    )
    readonly_fields = (
        'transaction_reference', 'initiated_at', 'completed_at', 'transaction_summary'
    )
    
    fieldsets = (
        (_('Transaction Reference'), {
            'fields': ('transaction_reference', 'operator')
        }),
        (_('Details'), {
            'fields': (
                'transaction_type', 'payment_method', 'payment_reference'
            )
        }),
        (_('Amount'), {
            'fields': ('amount', 'currency')
        }),
        (_('Status'), {
            'fields': ('status',)
        }),
        (_('Timestamps'), {
            'fields': ('initiated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
        (_('Description'), {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        (_('Summary'), {
            'fields': ('transaction_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_completed', 'mark_failed', 'process_refund']
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
    def transaction_type_badge(self, obj):
        colors = {
            'screening_fee': '#2166ac',
            'license_fee': '#7fbc41',
            'monthly_subscription': '#b35806',
            'penalty': '#d73026',
            'refund': '#fc8d59'
        }
        color = colors.get(obj.transaction_type, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_transaction_type_display()
        )
    transaction_type_badge.short_description = _('Type')
    
    def amount_display(self, obj):
        return format_html(
            '<strong>{} {:,.2f}</strong>',
            obj.currency, float(obj.amount)
        )
    amount_display.short_description = _('Amount')
    
    def status_badge(self, obj):
        colors = {
            'pending': '#999999',
            'completed': '#7fbc41',
            'failed': '#d73026',
            'refunded': '#fc8d59',
            'cancelled': '#cccccc'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def transaction_summary(self, obj):
        return format_html(
            '<div>'
            '<p><strong>Reference:</strong> {}</p>'
            '<p><strong>Type:</strong> {}</p>'
            '<p><strong>Amount:</strong> {} {:,.2f}</p>'
            '<p><strong>Method:</strong> {}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '</div>',
            obj.transaction_reference,
            obj.get_transaction_type_display(),
            obj.currency,
            float(obj.amount),
            obj.get_payment_method_display(),
            obj.get_status_display()
        )
    transaction_summary.short_description = _('Summary')
    
    @admin.action(description=_('Mark as completed'))
    def mark_completed(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='completed',
            completed_at=timezone.now()
        )
        self.message_user(request, _('%d transactions marked completed') % updated)
    
    @admin.action(description=_('Mark as failed'))
    def mark_failed(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='failed')
        self.message_user(request, _('%d transactions marked failed') % updated)
    
    @admin.action(description=_('Process refund'))
    def process_refund(self, request, queryset):
        updated = queryset.filter(status='completed').update(status='refunded')
        self.message_user(request, _('%d refunds processed') % updated)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Invoice management and tracking"""
    list_display = (
        'invoice_number', 'operator_name', 'total_amount_display',
        'status_badge', 'due_date_badge', 'overdue_indicator'
    )
    list_filter = ('status', 'issue_date', 'due_date', 'currency')
    search_fields = ('invoice_number', 'operator__name')
    readonly_fields = (
        'invoice_number', 'issue_date', 'invoice_summary'
    )
    
    fieldsets = (
        (_('Invoice Details'), {
            'fields': ('invoice_number', 'operator')
        }),
        (_('Period'), {
            'fields': ('billing_period_start', 'billing_period_end', 'issue_date', 'due_date')
        }),
        (_('Amounts'), {
            'fields': (
                'subtotal', 'tax_amount', 'total_amount', 'paid_amount', 'currency'
            )
        }),
        (_('Items'), {
            'fields': ('line_items',),
            'classes': ('collapse',)
        }),
        (_('Status'), {
            'fields': ('status',)
        }),
        (_('Summary'), {
            'fields': ('invoice_summary',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_issued', 'mark_paid', 'mark_cancelled']
    
    def operator_name(self, obj):
        return obj.operator.name
    operator_name.short_description = _('Operator')
    
    def total_amount_display(self, obj):
        return format_html(
            '<strong>{} {:,.2f}</strong>',
            obj.currency, float(obj.total_amount)
        )
    total_amount_display.short_description = _('Total')
    
    def status_badge(self, obj):
        colors = {
            'draft': '#999999',
            'issued': '#fc8d59',
            'paid': '#7fbc41',
            'overdue': '#d73026',
            'cancelled': '#cccccc'
        }
        color = colors.get(obj.status, '#cccccc')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def due_date_badge(self, obj):
        today = timezone.now().date()
        if obj.due_date < today and obj.status != 'paid':
            return format_html(
                '<span style="color: red; font-weight: bold;">{} (OVERDUE)</span>',
                obj.due_date.strftime('%Y-%m-%d')
            )
        return obj.due_date.strftime('%Y-%m-%d')
    due_date_badge.short_description = _('Due Date')
    
    def overdue_indicator(self, obj):
        today = timezone.now().date()
        if obj.due_date < today and obj.status != 'paid':
            return format_html('<span style="color: red; font-weight: bold;">⚠ OVERDUE</span>')
        return '—'
    overdue_indicator.short_description = _('Status')
    
    def invoice_summary(self, obj):
        balance = obj.total_amount - obj.paid_amount
        return format_html(
            '<div>'
            '<p><strong>Period:</strong> {} to {}</p>'
            '<p><strong>Subtotal:</strong> {} {:,.2f}</p>'
            '<p><strong>Tax:</strong> {} {:,.2f}</p>'
            '<p><strong>Total:</strong> {} {:,.2f}</p>'
            '<p><strong>Paid:</strong> {} {:,.2f}</p>'
            '<p><strong>Balance:</strong> {} {:,.2f}</p>'
            '</div>',
            obj.billing_period_start,
            obj.billing_period_end,
            obj.currency,
            float(obj.subtotal),
            obj.currency,
            float(obj.tax_amount),
            obj.currency,
            float(obj.total_amount),
            obj.currency,
            float(obj.paid_amount),
            obj.currency,
            float(balance)
        )
    invoice_summary.short_description = _('Summary')
    
    @admin.action(description=_('Mark as issued'))
    def mark_issued(self, request, queryset):
        updated = queryset.filter(status='draft').update(status='issued')
        self.message_user(request, _('%d invoices marked issued') % updated)
    
    @admin.action(description=_('Mark as paid'))
    def mark_paid(self, request, queryset):
        for invoice in queryset.filter(status__in=['issued', 'overdue']):
            invoice.paid_amount = invoice.total_amount
            invoice.status = 'paid'
            invoice.save()
        self.message_user(request, _('%d invoices marked paid') % queryset.count())
    
    @admin.action(description=_('Mark as cancelled'))
    def mark_cancelled(self, request, queryset):
        updated = queryset.exclude(status='paid').update(status='cancelled')
        self.message_user(request, _('%d invoices cancelled') % updated)
