"""
Settlements & Financial Serializers
Transactions, invoices, M-Pesa integration, reconciliation
"""
from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from .models import (
    Transaction, Invoice, LedgerEntry,
    Reconciliation, MPesaIntegration
)


class LedgerEntrySerializer(serializers.ModelSerializer):
    """Ledger entry serializer"""
    transaction_reference = serializers.CharField(source='transaction.transaction_reference', read_only=True)
    
    class Meta:
        model = LedgerEntry
        fields = [
            'id', 'entry_date', 'transaction', 'transaction_reference',
            'account_type', 'account_name', 'entry_type',
            'amount', 'currency', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MPesaIntegrationSerializer(serializers.ModelSerializer):
    """M-Pesa integration log serializer"""
    transaction_reference = serializers.CharField(source='transaction.transaction_reference', read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    
    class Meta:
        model = MPesaIntegration
        fields = [
            'id', 'transaction', 'transaction_reference',
            'mpesa_receipt_number', 'phone_number', 'amount',
            'request_payload', 'response_payload',
            'status', 'result_code', 'result_desc',
            'initiated_at', 'completed_at', 'duration_seconds',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'mpesa_receipt_number', 'response_payload',
            'status', 'result_code', 'result_desc',
            'initiated_at', 'completed_at', 'created_at', 'updated_at'
        ]
    
    def get_duration_seconds(self, obj):
        if obj.completed_at and obj.initiated_at:
            delta = obj.completed_at - obj.initiated_at
            return delta.total_seconds()
        return None


class TransactionSerializer(serializers.ModelSerializer):
    """Basic transaction serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'operator', 'operator_name', 'transaction_reference',
            'transaction_type', 'amount', 'currency', 'status',
            'payment_method', 'payment_reference',
            'initiated_at', 'completed_at',
            'description', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'transaction_reference', 'initiated_at', 'completed_at', 'created_at', 'updated_at']


class TransactionListSerializer(serializers.ModelSerializer):
    """Lightweight transaction serializer for lists"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_reference', 'operator', 'operator_name',
            'transaction_type', 'amount', 'currency', 'status',
            'status_display', 'payment_method', 'payment_reference',
            'initiated_at', 'completed_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'transaction_reference', 'initiated_at',
            'completed_at', 'created_at'
        ]
    
    def get_status_display(self, obj):
        status_colors = {
            'pending': '⏳ Pending',
            'completed': '✅ Completed',
            'failed': '❌ Failed',
            'refunded': '↩️ Refunded',
            'cancelled': '🚫 Cancelled'
        }
        return status_colors.get(obj.status, obj.status)


class TransactionDetailSerializer(serializers.ModelSerializer):
    """Comprehensive transaction serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    ledger_entries = LedgerEntrySerializer(many=True, read_only=True)
    mpesa_logs = MPesaIntegrationSerializer(many=True, read_only=True)
    duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_reference', 'operator', 'operator_name',
            'transaction_type', 'amount', 'currency', 'status',
            'payment_method', 'payment_reference',
            'initiated_at', 'completed_at', 'duration_minutes',
            'description', 'metadata',
            'ledger_entries', 'mpesa_logs',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'transaction_reference', 'initiated_at',
            'completed_at', 'created_at', 'updated_at'
        ]
    
    def get_duration_minutes(self, obj):
        if obj.completed_at and obj.initiated_at:
            delta = obj.completed_at - obj.initiated_at
            return int(delta.total_seconds() / 60)
        return None


class InitiateTransactionSerializer(serializers.Serializer):
    """Initiate transaction serializer"""
    operator_id = serializers.UUIDField(required=True)
    transaction_type = serializers.ChoiceField(
        choices=[
            ('screening_fee', 'Screening Fee'),
            ('license_fee', 'License Fee'),
            ('monthly_subscription', 'Monthly Subscription'),
            ('penalty', 'Penalty')
        ],
        required=True
    )
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=True)
    currency = serializers.ChoiceField(
        choices=[('KES', 'Kenyan Shilling'), ('USD', 'US Dollar')],
        default='KES'
    )
    payment_method = serializers.ChoiceField(
        choices=[
            ('mpesa', 'M-Pesa'),
            ('bank_transfer', 'Bank Transfer'),
            ('card', 'Card'),
            ('wallet', 'Wallet')
        ],
        required=True
    )
    description = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        if value > 1000000:
            raise serializers.ValidationError("Amount exceeds maximum limit.")
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    """Basic invoice serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'operator', 'operator_name',
            'billing_period_start', 'billing_period_end',
            'issue_date', 'due_date', 'total_amount', 'paid_amount',
            'currency', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'issue_date', 'created_at', 'updated_at']


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight invoice serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    days_until_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    amount_outstanding = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'operator', 'operator_name',
            'billing_period_start', 'billing_period_end',
            'issue_date', 'due_date', 'days_until_due', 'is_overdue',
            'total_amount', 'paid_amount', 'amount_outstanding',
            'currency', 'status', 'created_at'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'issue_date', 'created_at'
        ]
    
    def get_days_until_due(self, obj):
        if obj.due_date:
            delta = obj.due_date - timezone.now().date()
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        return obj.due_date < timezone.now().date() and obj.status not in ['paid', 'cancelled']
    
    def get_amount_outstanding(self, obj):
        return obj.total_amount - obj.paid_amount


class InvoiceDetailSerializer(serializers.ModelSerializer):
    """Comprehensive invoice serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    payment_transaction_reference = serializers.CharField(
        source='payment_transaction.transaction_reference',
        read_only=True,
        allow_null=True
    )
    days_until_due = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    amount_outstanding = serializers.SerializerMethodField()
    payment_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'operator', 'operator_name',
            'billing_period_start', 'billing_period_end',
            'issue_date', 'due_date', 'days_until_due', 'is_overdue',
            'subtotal', 'tax_amount', 'total_amount',
            'paid_amount', 'amount_outstanding', 'payment_percentage',
            'currency', 'line_items', 'status',
            'paid_at', 'payment_transaction', 'payment_transaction_reference',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'issue_date', 'paid_at',
            'created_at', 'updated_at'
        ]
    
    def get_days_until_due(self, obj):
        if obj.due_date:
            delta = obj.due_date - timezone.now().date()
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        return obj.due_date < timezone.now().date() and obj.status not in ['paid', 'cancelled']
    
    def get_amount_outstanding(self, obj):
        return obj.total_amount - obj.paid_amount
    
    def get_payment_percentage(self, obj):
        if obj.total_amount > 0:
            return float((obj.paid_amount / obj.total_amount) * 100)
        return 0.0


class GenerateInvoiceSerializer(serializers.Serializer):
    """Generate invoice serializer"""
    operator_id = serializers.UUIDField(required=True)
    billing_period_start = serializers.DateField(required=True)
    billing_period_end = serializers.DateField(required=True)
    line_items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        required=True
    )
    tax_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('16.00'),  # VAT in Kenya
        min_value=0,
        max_value=100
    )
    due_days = serializers.IntegerField(default=30, min_value=1, max_value=90)
    
    def validate(self, attrs):
        # Validate billing period
        if attrs['billing_period_end'] <= attrs['billing_period_start']:
            raise serializers.ValidationError({
                "billing_period_end": "End date must be after start date."
            })
        
        # Validate line items
        line_items = attrs.get('line_items', [])
        required_fields = ['description', 'quantity', 'unit_price']
        
        for idx, item in enumerate(line_items):
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError({
                        "line_items": f"Item {idx + 1} missing required field: {field}"
                    })
            
            # Validate numeric values
            try:
                quantity = Decimal(str(item['quantity']))
                unit_price = Decimal(str(item['unit_price']))
                
                if quantity <= 0 or unit_price < 0:
                    raise serializers.ValidationError({
                        "line_items": f"Item {idx + 1} has invalid quantity or price."
                    })
            except (ValueError, TypeError):
                raise serializers.ValidationError({
                    "line_items": f"Item {idx + 1} has invalid numeric values."
                })
        
        return attrs


class InitiateMPesaPaymentSerializer(serializers.Serializer):
    """Initiate M-Pesa payment serializer"""
    phone_number = serializers.CharField(required=True, max_length=15)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=True)
    account_reference = serializers.CharField(max_length=50, required=True)
    transaction_desc = serializers.CharField(max_length=100, required=False, default="Payment")
    
    def validate_phone_number(self, value):
        # Remove any spaces or special characters
        cleaned = value.replace(' ', '').replace('+', '').replace('-', '')
        
        # Validate Kenyan phone number format
        if not cleaned.startswith('254') and not cleaned.startswith('0'):
            raise serializers.ValidationError("Phone number must be a valid Kenyan number.")
        
        # Convert to 254 format
        if cleaned.startswith('0'):
            cleaned = '254' + cleaned[1:]
        
        if len(cleaned) != 12:
            raise serializers.ValidationError("Invalid phone number length.")
        
        return cleaned
    
    def validate_amount(self, value):
        if value < 10:
            raise serializers.ValidationError("Amount must be at least KES 10.")
        if value > 150000:
            raise serializers.ValidationError("Amount exceeds maximum limit of KES 150,000.")
        return value


class MPesaSTKPushSerializer(serializers.Serializer):
    """M-Pesa STK Push serializer"""
    phone_number = serializers.CharField(required=True)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=True)
    transaction_id = serializers.UUIDField(required=True)
    account_reference = serializers.CharField(max_length=50, required=True)
    transaction_desc = serializers.CharField(max_length=100, required=False)
    
    def validate_phone_number(self, value):
        # Kenya phone number validation
        import re
        pattern = r'^254[17]\d{8}$'
        if not re.match(pattern, value.replace('+', '')):
            raise serializers.ValidationError(
                "Invalid phone number format. Use 254XXXXXXXXX format."
            )
        return value.replace('+', '')
    
    def validate_amount(self, value):
        if value < 1 or value > 150000:
            raise serializers.ValidationError(
                "Amount must be between KES 1 and KES 150,000."
            )
        return value


class MPesaB2BSerializer(serializers.Serializer):
    """M-Pesa B2B serializer"""
    initiator_name = serializers.CharField(required=True)
    security_credential = serializers.CharField(required=True)
    command_id = serializers.ChoiceField(
        choices=[
            ('BusinessPayment', 'Business Payment'),
            ('BusinessBuyGoods', 'Business Buy Goods'),
            ('DisburseFundsToBusiness', 'Disburse Funds to Business')
        ],
        default='BusinessPayment'
    )
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=True)
    party_a = serializers.CharField(required=True)  # Sender shortcode
    party_b = serializers.CharField(required=True)  # Receiver shortcode
    account_reference = serializers.CharField(max_length=50, required=True)
    remarks = serializers.CharField(max_length=100, required=False)


class MPesaCallbackSerializer(serializers.Serializer):
    """M-Pesa callback serializer"""
    Body = serializers.DictField(required=True)
    
    def validate_Body(self, value):
        # Validate M-Pesa callback structure
        if 'stkCallback' not in value and 'Result' not in value:
            raise serializers.ValidationError("Invalid M-Pesa callback format.")
        return value


class ReconciliationSerializer(serializers.ModelSerializer):
    """Reconciliation serializer"""
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    reconciled_by_name = serializers.CharField(
        source='reconciled_by.get_full_name',
        read_only=True,
        allow_null=True
    )
    variance_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Reconciliation
        fields = [
            'id', 'reconciliation_reference', 'operator', 'operator_name',
            'period_start', 'period_end',
            'expected_amount', 'received_amount', 'variance',
            'variance_percentage', 'status',
            'reconciled_at', 'reconciled_by', 'reconciled_by_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reconciliation_reference', 'variance',
            'reconciled_at', 'created_at', 'updated_at'
        ]
    
    def get_variance_percentage(self, obj):
        if obj.expected_amount > 0:
            return float((obj.variance / obj.expected_amount) * 100)
        return 0.0


class ReconcilePaymentsSerializer(serializers.Serializer):
    """Reconcile payments serializer"""
    operator_id = serializers.UUIDField(required=True)
    period_start = serializers.DateField(required=True)
    period_end = serializers.DateField(required=True)
    received_amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=True)
    
    def validate(self, attrs):
        if attrs['period_end'] <= attrs['period_start']:
            raise serializers.ValidationError({
                "period_end": "End date must be after start date."
            })
        
        if attrs['received_amount'] < 0:
            raise serializers.ValidationError({
                "received_amount": "Amount cannot be negative."
            })
        
        return attrs


class FinancialReportSerializer(serializers.Serializer):
    """Financial report serializer"""
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_transactions = serializers.IntegerField()
    successful_transactions = serializers.IntegerField()
    failed_transactions = serializers.IntegerField()
    total_refunds = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    by_operator = serializers.DictField()
    by_transaction_type = serializers.DictField()
    by_payment_method = serializers.DictField()
    outstanding_invoices = serializers.DecimalField(max_digits=15, decimal_places=2)
    collection_rate = serializers.FloatField()


class SettlementStatisticsSerializer(serializers.Serializer):
    """Settlement statistics serializer"""
    period = serializers.CharField()
    total_transactions = serializers.IntegerField()
    completed_transactions = serializers.IntegerField()
    pending_transactions = serializers.IntegerField()
    failed_transactions = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    invoices_issued = serializers.IntegerField()
    invoices_paid = serializers.IntegerField()
    invoices_overdue = serializers.IntegerField()
    mpesa_transactions = serializers.IntegerField()
    mpesa_success_rate = serializers.FloatField()
    reconciliation_status = serializers.DictField()
