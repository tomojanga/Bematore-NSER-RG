"""
Settlements & Financial API URLs
Transactions, invoices, M-Pesa, reconciliation
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'settlements'

# Router for ViewSets
router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'ledger', views.LedgerEntryViewSet, basename='ledger')
router.register(r'reconciliations', views.ReconciliationViewSet, basename='reconciliation')

urlpatterns = [
    # Transaction Management
    path('transactions/initiate/', views.InitiateTransactionView.as_view(), name='initiate_transaction'),
    path('transactions/<uuid:pk>/complete/', views.CompleteTransactionView.as_view(), name='complete_transaction'),
    path('transactions/<uuid:pk>/cancel/', views.CancelTransactionView.as_view(), name='cancel_transaction'),
    path('transactions/<uuid:pk>/refund/', views.RefundTransactionView.as_view(), name='refund_transaction'),
    
    # Invoice Management
    path('invoices/generate/', views.GenerateInvoiceView.as_view(), name='generate_invoice'),
    path('invoices/<uuid:pk>/send/', views.SendInvoiceView.as_view(), name='send_invoice'),
    path('invoices/<uuid:pk>/mark-paid/', views.MarkInvoicePaidView.as_view(), name='mark_invoice_paid'),
    path('invoices/overdue/', views.OverdueInvoicesView.as_view(), name='overdue_invoices'),
    
    # M-Pesa Integration
    path('mpesa/stk-push/', views.MPesaSTKPushView.as_view(), name='mpesa_stk_push'),
    path('mpesa/b2b/', views.MPesaB2BView.as_view(), name='mpesa_b2b'),
    path('mpesa/callback/', views.MPesaCallbackView.as_view(), name='mpesa_callback'),
    path('mpesa/query/', views.MPesaQueryView.as_view(), name='mpesa_query'),
    path('mpesa/status/', views.MPesaTransactionStatusView.as_view(), name='mpesa_status'),
    
    # Reconciliation
    path('reconcile/', views.ReconcilePaymentsView.as_view(), name='reconcile_payments'),
    path('reconciliations/<uuid:pk>/resolve/', views.ResolveReconciliationView.as_view(), name='resolve_reconciliation'),
    path('reconciliations/variances/', views.ReconciliationVariancesView.as_view(), name='reconciliation_variances'),
    
    # Reports
    path('reports/financial/', views.FinancialReportView.as_view(), name='financial_report'),
    path('reports/revenue/', views.RevenueReportView.as_view(), name='revenue_report'),
    path('reports/operator-billing/', views.OperatorBillingReportView.as_view(), name='operator_billing'),
    
    # Statistics
    path('statistics/', views.SettlementStatisticsView.as_view(), name='statistics'),
    path('statistics/revenue/', views.RevenueStatisticsView.as_view(), name='revenue_stats'),
    path('statistics/transactions/', views.TransactionStatisticsView.as_view(), name='transaction_stats'),
    
    # Router URLs
    path('', include(router.urls)),
]
