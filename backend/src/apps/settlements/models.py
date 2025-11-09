"""
Settlements & Financial Models
Automated financial reconciliation, invoicing, and M-Pesa integration
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal

from apps.core.models import (
    BaseModel, TimeStampedModel, UUIDModel,
    StatusChoices, CurrencyChoices, BaseModelManager, generate_reference_number
)


class Transaction(BaseModel):
    """Financial transactions"""
    transaction_reference = models.CharField(max_length=100, unique=True, db_index=True)
    operator = models.ForeignKey('operators.Operator', on_delete=models.PROTECT, related_name='transactions')
    
    # Transaction Details
    transaction_type = models.CharField(max_length=50, choices=[
        ('screening_fee', 'Screening Fee'),
        ('license_fee', 'License Fee'),
        ('monthly_subscription', 'Monthly Subscription'),
        ('penalty', 'Penalty'),
        ('refund', 'Refund')
    ], db_index=True)
    
    # Amount
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CurrencyChoices.choices, default=CurrencyChoices.KES)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled')
    ], default='pending', db_index=True)
    
    # Payment Details
    payment_method = models.CharField(max_length=50, choices=[
        ('mpesa', 'M-Pesa'),
        ('bank_transfer', 'Bank Transfer'),
        ('card', 'Card Payment'),
        ('wallet', 'Digital Wallet')
    ])
    payment_reference = models.CharField(max_length=255, blank=True, db_index=True)
    
    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    objects = BaseModelManager()
    
    class Meta:
        db_table = 'settlements_transactions'
        ordering = ['-initiated_at']
        indexes = [models.Index(fields=['operator', 'status'], name='trans_op_status_idx')]
    
    def __str__(self):
        return f"{self.transaction_reference} - {self.amount} {self.currency}"


class Invoice(BaseModel):
    """Generated invoices"""
    invoice_number = models.CharField(max_length=100, unique=True, db_index=True)
    operator = models.ForeignKey('operators.Operator', on_delete=models.PROTECT, related_name='invoices')
    
    # Invoice Details
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(db_index=True)
    
    # Amounts
    subtotal = models.DecimalField(max_digits=15, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CurrencyChoices.choices, default=CurrencyChoices.KES)
    
    # Line Items
    line_items = models.JSONField(default=list)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled')
    ], default='draft', db_index=True)
    
    # Payment
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_transaction = models.ForeignKey('Transaction', on_delete=models.SET_NULL, null=True, blank=True)
    
    objects = BaseModelManager()
    
    class Meta:
        db_table = 'settlements_invoices'
        ordering = ['-issue_date']
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"


class LedgerEntry(TimeStampedModel, UUIDModel):
    """Double-entry accounting ledger"""
    entry_date = models.DateField(db_index=True)
    transaction = models.ForeignKey('Transaction', on_delete=models.PROTECT, related_name='ledger_entries')
    
    # Account Details
    account_type = models.CharField(max_length=50, choices=[
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('revenue', 'Revenue'),
        ('expense', 'Expense')
    ])
    account_name = models.CharField(max_length=255)
    
    # Entry Type
    entry_type = models.CharField(max_length=10, choices=[('debit', 'Debit'), ('credit', 'Credit')])
    
    # Amount
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CurrencyChoices.choices, default=CurrencyChoices.KES)
    
    # Description
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'settlements_ledger_entries'
        ordering = ['-entry_date']


class Reconciliation(BaseModel):
    """Payment reconciliation records"""
    reconciliation_reference = models.CharField(max_length=100, unique=True, db_index=True)
    operator = models.ForeignKey('operators.Operator', on_delete=models.PROTECT, related_name='reconciliations')
    
    # Period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Amounts
    expected_amount = models.DecimalField(max_digits=15, decimal_places=2)
    received_amount = models.DecimalField(max_digits=15, decimal_places=2)
    variance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('matched', 'Matched'),
        ('variance', 'Variance Detected'),
        ('resolved', 'Resolved')
    ], default='pending', db_index=True)
    
    # Reconciliation Details
    reconciled_at = models.DateTimeField(null=True, blank=True)
    reconciled_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'settlements_reconciliations'
        ordering = ['-period_end']


class MPesaIntegration(TimeStampedModel, UUIDModel):
    """M-Pesa B2B integration logs"""
    transaction = models.ForeignKey('Transaction', on_delete=models.CASCADE, related_name='mpesa_logs')
    
    # M-Pesa Details
    mpesa_receipt_number = models.CharField(max_length=100, unique=True, db_index=True)
    phone_number = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Request/Response
    request_payload = models.JSONField(default=dict)
    response_payload = models.JSONField(default=dict)
    
    # Status
    status = models.CharField(max_length=20, default='pending')
    result_code = models.CharField(max_length=10, blank=True)
    result_desc = models.TextField(blank=True)
    
    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'settlements_mpesa_integration'
        ordering = ['-initiated_at']

