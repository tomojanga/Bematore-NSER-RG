"""
Settlements & Financial Views
Transactions, invoices, M-Pesa integration, reconciliation
"""
from rest_framework import status, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from decimal import Decimal

from .models import Transaction, Invoice, LedgerEntry, Reconciliation, MPesaIntegration
from .serializers import (
    TransactionSerializer, InvoiceSerializer, LedgerEntrySerializer,
    ReconciliationSerializer, MPesaIntegrationSerializer,
    InitiateTransactionSerializer, GenerateInvoiceSerializer,
    InitiateMPesaPaymentSerializer, MPesaCallbackSerializer
)
from apps.api.permissions import IsGRAKStaff, IsOperator
from apps.api.mixins import TimingMixin, SuccessResponseMixin


class TransactionViewSet(TimingMixin, viewsets.ModelViewSet):
    """Transaction management"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['grak_admin', 'grak_officer']:
            return Transaction.objects.select_related('operator', 'invoice').order_by('-created_at')
        elif user.role == 'operator_admin':
            from apps.operators.models import Operator
            try:
                operator = Operator.objects.get(contact_person_email=user.email)
                return Transaction.objects.filter(operator=operator).order_by('-created_at')
            except Operator.DoesNotExist:
                return Transaction.objects.none()
        
        return Transaction.objects.none()


class InitiateTransactionView(TimingMixin, SuccessResponseMixin, APIView):
    """Initiate new transaction"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        serializer = InitiateTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        txn = Transaction.objects.create(
            operator_id=serializer.validated_data['operator_id'],
            transaction_type=serializer.validated_data['transaction_type'],
            amount=serializer.validated_data['amount'],
            currency=serializer.validated_data.get('currency', 'KES'),
            description=serializer.validated_data.get('description'),
            status='pending'
        )
        
        return self.success_response(
            data=TransactionSerializer(txn).data,
            message='Transaction initiated',
            status_code=status.HTTP_201_CREATED
        )


class InvoiceViewSet(TimingMixin, viewsets.ModelViewSet):
    """Invoice management"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['grak_admin', 'grak_officer']:
            return Invoice.objects.select_related('operator').order_by('-invoice_date')
        elif user.role == 'operator_admin':
            from apps.operators.models import Operator
            try:
                operator = Operator.objects.get(contact_person_email=user.email)
                return Invoice.objects.filter(operator=operator).order_by('-invoice_date')
            except Operator.DoesNotExist:
                return Invoice.objects.none()
        
        return Invoice.objects.none()


class GenerateInvoiceView(TimingMixin, SuccessResponseMixin, APIView):
    """Generate invoice for operator"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request):
        serializer = GenerateInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Calculate amounts
        subtotal = serializer.validated_data['subtotal']
        vat_rate = Decimal('0.16')  # 16% VAT in Kenya
        vat_amount = subtotal * vat_rate
        total = subtotal + vat_amount
        
        invoice = Invoice.objects.create(
            operator_id=serializer.validated_data['operator_id'],
            invoice_date=timezone.now().date(),
            due_date=serializer.validated_data['due_date'],
            subtotal=subtotal,
            vat_amount=vat_amount,
            total_amount=total,
            currency=serializer.validated_data.get('currency', 'KES'),
            status='draft'
        )
        
        return self.success_response(
            data=InvoiceSerializer(invoice).data,
            message='Invoice generated',
            status_code=status.HTTP_201_CREATED
        )


class InitiateMPesaPaymentView(TimingMixin, SuccessResponseMixin, APIView):
    """Initiate M-Pesa payment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = InitiateMPesaPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create M-Pesa integration record
        mpesa = MPesaIntegration.objects.create(
            transaction_type=serializer.validated_data['transaction_type'],
            phone_number=serializer.validated_data['phone_number'],
            amount=serializer.validated_data['amount'],
            account_reference=serializer.validated_data.get('account_reference'),
            status='pending'
        )
        
        # Initiate STK push (async)
        from .tasks import initiate_stk_push
        initiate_stk_push.delay(str(mpesa.id))
        
        return self.success_response(
            data=MPesaIntegrationSerializer(mpesa).data,
            message='M-Pesa payment initiated'
        )


class MPesaCallbackView(TimingMixin, APIView):
    """M-Pesa callback handler"""
    permission_classes = []  # Public endpoint for M-Pesa callbacks
    
    def post(self, request):
        serializer = MPesaCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Process callback (async)
        from .tasks import process_mpesa_callback
        process_mpesa_callback.delay(serializer.validated_data)
        
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class ReconciliationViewSet(TimingMixin, viewsets.ModelViewSet):
    """Reconciliation management"""
    serializer_class = ReconciliationSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return Reconciliation.objects.select_related('operator').order_by('-reconciled_at')


class LedgerEntryViewSet(TimingMixin, viewsets.ReadOnlyModelViewSet):
    """Ledger entries (read-only)"""
    serializer_class = LedgerEntrySerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return LedgerEntry.objects.select_related('transaction').order_by('-entry_date')


class FinancialReportsView(TimingMixin, SuccessResponseMixin, APIView):
    """Financial reports"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        period = request.query_params.get('period', 'month')
        
        from datetime import timedelta
        if period == 'today':
            start_date = timezone.now().date()
        elif period == 'week':
            start_date = timezone.now().date() - timedelta(days=7)
        else:
            start_date = timezone.now().date() - timedelta(days=30)
        
        transactions = Transaction.objects.filter(created_at__date__gte=start_date)
        
        report = {
            'period': period,
            'total_transactions': transactions.count(),
            'total_amount': sum(t.amount for t in transactions),
            'successful_payments': transactions.filter(status='completed').count(),
            'pending_payments': transactions.filter(status='pending').count()
        }
        
        return self.success_response(data=report)


class SettlementStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """Settlement statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'total_transactions': Transaction.objects.count(),
            'total_invoices': Invoice.objects.count(),
            'pending_invoices': Invoice.objects.filter(status='pending').count(),
            'overdue_invoices': Invoice.objects.filter(
                due_date__lt=timezone.now().date(),
                status__in=['pending', 'sent']
            ).count(),
            'total_revenue': sum(
                t.amount for t in Transaction.objects.filter(
                    status='completed',
                    transaction_type='payment'
                )
            )
        }
        
        return self.success_response(data=stats)

class CompleteTransactionView(TimingMixin, SuccessResponseMixin, APIView):
    """Complete transaction"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        txn = Transaction.objects.get(pk=pk)
        txn.status = 'completed'
        txn.completed_at = timezone.now()
        txn.save()
        
        return self.success_response(message='Transaction completed')


class CancelTransactionView(TimingMixin, SuccessResponseMixin, APIView):
    """Cancel transaction"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        txn = Transaction.objects.get(pk=pk)
        txn.status = 'cancelled'
        txn.save()
        
        return self.success_response(message='Transaction cancelled')


class RefundTransactionView(TimingMixin, SuccessResponseMixin, APIView):
    """Refund transaction"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        original_txn = Transaction.objects.get(pk=pk)
        
        # Create refund transaction
        refund_txn = Transaction.objects.create(
            operator=original_txn.operator,
            transaction_type='refund',
            amount=original_txn.amount,
            currency=original_txn.currency,
            status='pending',
            reference_transaction=original_txn
        )
        
        return self.success_response(
            data=TransactionSerializer(refund_txn).data,
            message='Refund initiated'
        )


class SendInvoiceView(TimingMixin, SuccessResponseMixin, APIView):
    """Send invoice"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request, pk):
        invoice = Invoice.objects.get(pk=pk)
        
        # Send invoice (async)
        from .tasks import send_invoice_email
        send_invoice_email.delay(str(invoice.id))
        
        invoice.status = 'sent'
        invoice.sent_at = timezone.now()
        invoice.save()
        
        return self.success_response(message='Invoice sent')


class MarkInvoicePaidView(TimingMixin, SuccessResponseMixin, APIView):
    """Mark invoice as paid"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        invoice = Invoice.objects.get(pk=pk)
        invoice.status = 'paid'
        invoice.paid_at = timezone.now()
        invoice.save()
        
        return self.success_response(message='Invoice marked as paid')


class OverdueInvoicesView(TimingMixin, generics.ListAPIView):
    """Get overdue invoices"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        today = timezone.now().date()
        return Invoice.objects.filter(
            due_date__lt=today,
            status__in=['pending', 'sent']
        ).select_related('operator')


class MPesaSTKPushView(TimingMixin, SuccessResponseMixin, APIView):
    """Initiate M-Pesa STK push"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .serializers import InitiateMPesaPaymentSerializer
        serializer = InitiateMPesaPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        mpesa = MPesaIntegration.objects.create(
            transaction_type='stk_push',
            phone_number=serializer.validated_data['phone_number'],
            amount=serializer.validated_data['amount'],
            account_reference=serializer.validated_data.get('account_reference'),
            status='pending'
        )
        
        # Initiate STK push (async)
        from .tasks import initiate_stk_push
        initiate_stk_push.delay(str(mpesa.id))
        
        return self.success_response(
            data=MPesaIntegrationSerializer(mpesa).data,
            message='STK push initiated'
        )


class MPesaB2BView(TimingMixin, SuccessResponseMixin, APIView):
    """M-Pesa B2B payment"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        mpesa = MPesaIntegration.objects.create(
            transaction_type='b2b',
            amount=request.data['amount'],
            account_reference=request.data.get('account_reference'),
            status='pending'
        )
        
        # Initiate B2B (async)
        from .tasks import initiate_b2b_payment
        initiate_b2b_payment.delay(str(mpesa.id))
        
        return self.success_response(
            data=MPesaIntegrationSerializer(mpesa).data,
            message='B2B payment initiated'
        )


class MPesaQueryView(TimingMixin, SuccessResponseMixin, APIView):
    """Query M-Pesa transaction"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        checkout_request_id = request.data.get('checkout_request_id')
        
        # Query M-Pesa (async)
        from .tasks import query_mpesa_transaction
        task = query_mpesa_transaction.delay(checkout_request_id)
        
        return self.success_response(
            data={'task_id': task.id},
            message='Query initiated'
        )


class MPesaTransactionStatusView(TimingMixin, SuccessResponseMixin, APIView):
    """Get M-Pesa transaction status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        mpesa_id = request.query_params.get('mpesa_id')
        mpesa = MPesaIntegration.objects.get(id=mpesa_id)
        
        return self.success_response(
            data=MPesaIntegrationSerializer(mpesa).data
        )


class ReconcilePaymentsView(TimingMixin, SuccessResponseMixin, APIView):
    """Reconcile payments"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        # Reconcile payments (async)
        from .tasks import reconcile_payments
        task = reconcile_payments.delay()
        
        return self.success_response(
            data={'task_id': task.id},
            message='Reconciliation started'
        )


class ResolveReconciliationView(TimingMixin, SuccessResponseMixin, APIView):
    """Resolve reconciliation"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    @transaction.atomic
    def post(self, request, pk):
        reconciliation = Reconciliation.objects.get(pk=pk)
        reconciliation.status = 'resolved'
        reconciliation.resolved_at = timezone.now()
        reconciliation.resolved_by = request.user
        reconciliation.save()
        
        return self.success_response(message='Reconciliation resolved')


class ReconciliationVariancesView(TimingMixin, generics.ListAPIView):
    """Get reconciliation variances"""
    serializer_class = ReconciliationSerializer
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get_queryset(self):
        return Reconciliation.objects.filter(
            variance_amount__gt=0
        ).select_related('operator')


class FinancialReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Financial report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def post(self, request):
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        # Generate report (async)
        from .tasks import generate_financial_report
        task = generate_financial_report.delay(start_date, end_date)
        
        return self.success_response(
            data={'task_id': task.id},
            message='Report generation started'
        )


class RevenueReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Revenue report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        period = request.query_params.get('period', 'month')
        
        from datetime import timedelta
        if period == 'today':
            start_date = timezone.now().date()
        elif period == 'week':
            start_date = timezone.now().date() - timedelta(days=7)
        else:
            start_date = timezone.now().date() - timedelta(days=30)
        
        transactions = Transaction.objects.filter(
            created_at__date__gte=start_date,
            status='completed',
            transaction_type='payment'
        )
        
        report = {
            'period': period,
            'total_revenue': sum(t.amount for t in transactions),
            'transaction_count': transactions.count()
        }
        
        return self.success_response(data=report)


class OperatorBillingReportView(TimingMixin, SuccessResponseMixin, APIView):
    """Operator billing report"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        operator_id = request.query_params.get('operator_id')
        
        invoices = Invoice.objects.filter(operator_id=operator_id)
        
        report = {
            'total_invoices': invoices.count(),
            'total_amount': sum(i.total_amount for i in invoices),
            'paid': invoices.filter(status='paid').count(),
            'unpaid': invoices.filter(status__in=['pending', 'sent']).count()
        }
        
        return self.success_response(data=report)


class RevenueStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """Revenue statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        today = timezone.now().date()
        
        stats = {
            'today': sum(
                t.amount for t in Transaction.objects.filter(
                    created_at__date=today,
                    status='completed',
                    transaction_type='payment'
                )
            ),
            'this_month': 0,
            'this_year': 0
        }
        
        return self.success_response(data=stats)


class TransactionStatisticsView(TimingMixin, SuccessResponseMixin, APIView):
    """Transaction statistics"""
    permission_classes = [IsAuthenticated, IsGRAKStaff]
    
    def get(self, request):
        stats = {
            'total': Transaction.objects.count(),
            'completed': Transaction.objects.filter(status='completed').count(),
            'pending': Transaction.objects.filter(status='pending').count(),
            'failed': Transaction.objects.filter(status='failed').count()
        }
        
        return self.success_response(data=stats)
