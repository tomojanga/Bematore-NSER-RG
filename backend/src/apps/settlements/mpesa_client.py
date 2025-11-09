"""
M-Pesa Daraja API Integration
Direct implementation without external libraries
"""
import requests
import base64
from datetime import datetime
from typing import Dict, Optional
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class MpesaAPIException(Exception):
    """Custom exception for M-Pesa API errors"""
    pass


class MpesaClient:
    """
    Direct implementation of Safaricom M-Pesa Daraja API
    
    Supported Operations:
    - STK Push (Lipa Na M-Pesa Online)
    - B2C (Business to Customer)
    - B2B (Business to Business)
    - Transaction Status Query
    - Account Balance Query
    """
    
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.initiator_name = getattr(settings, 'MPESA_INITIATOR_NAME', 'testapi')
        self.security_credential = getattr(settings, 'MPESA_SECURITY_CREDENTIAL', '')
        
        # Use sandbox or production
        self.environment = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')
        if self.environment == 'production':
            self.base_url = "https://api.safaricom.co.ke"
        else:
            self.base_url = "https://sandbox.safaricom.co.ke"
    
    def get_access_token(self) -> str:
        """
        Generate OAuth access token
        Token is cached for 3600 seconds (1 hour)
        """
        cache_key = 'mpesa_access_token'
        token = cache.get(cache_key)
        
        if token:
            logger.debug("Using cached M-Pesa access token")
            return token
        
        try:
            api_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            response = requests.get(
                api_url,
                auth=(self.consumer_key, self.consumer_secret),
                timeout=30
            )
            response.raise_for_status()
            
            token = response.json()['access_token']
            # Cache for 55 minutes (token valid for 1 hour)
            cache.set(cache_key, token, 3300)
            
            logger.info("M-Pesa access token generated successfully")
            return token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get M-Pesa access token: {str(e)}")
            raise MpesaAPIException(f"Failed to authenticate with M-Pesa API: {str(e)}")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get authorization headers with access token"""
        access_token = self.get_access_token()
        return {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    
    def stk_push(
        self,
        phone_number: str,
        amount: int,
        account_reference: str,
        transaction_desc: str = "Payment"
    ) -> Dict:
        """
        Initiate STK Push (Lipa Na M-Pesa Online)
        
        Args:
            phone_number: Customer phone number (format: 254712345678)
            amount: Amount to charge (minimum 1 KES)
            account_reference: Account reference (max 12 characters)
            transaction_desc: Transaction description
            
        Returns:
            dict: Response with CheckoutRequestID and ResponseDescription
        """
        # Ensure phone number is in correct format
        if phone_number.startswith('+'):
            phone_number = phone_number[1:]
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        
        # Generate password
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode('utf-8')
        
        # Callback URL
        callback_url = getattr(
            settings,
            'MPESA_CALLBACK_URL',
            f"{settings.SITE_URL}/api/v1/settlements/mpesa/callback/"
        )
        
        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": self.shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference[:12],  # Max 12 chars
            "TransactionDesc": transaction_desc[:13]  # Max 13 chars
        }
        
        try:
            api_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            response = requests.post(
                api_url,
                json=payload,
                headers=self._get_headers(),
                timeout=60
            )
            response.raise_for_status()
            
            result = response.json()
            
            if result.get('ResponseCode') == '0':
                logger.info(f"STK Push initiated successfully: {result.get('CheckoutRequestID')}")
            else:
                logger.warning(f"STK Push failed: {result}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"STK Push request failed: {str(e)}")
            raise MpesaAPIException(f"STK Push failed: {str(e)}")
    
    def stk_query(self, checkout_request_id: str) -> Dict:
        """
        Query STK Push transaction status
        
        Args:
            checkout_request_id: The CheckoutRequestID from stk_push response
            
        Returns:
            dict: Transaction status
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode('utf-8')
        
        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        try:
            api_url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            response = requests.post(
                api_url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"STK Query failed: {str(e)}")
            raise MpesaAPIException(f"Failed to query transaction: {str(e)}")
    
    def b2c_payment(
        self,
        phone_number: str,
        amount: int,
        occasion: str = "Payment",
        command_id: str = "BusinessPayment"
    ) -> Dict:
        """
        B2C Payment (Business to Customer)
        
        Args:
            phone_number: Customer phone number (format: 254712345678)
            amount: Amount to send
            occasion: Occasion/reason for payment
            command_id: BusinessPayment, SalaryPayment, or PromotionPayment
            
        Returns:
            dict: Response with ConversationID and OriginatorConversationID
        """
        # Ensure phone number is in correct format
        if phone_number.startswith('+'):
            phone_number = phone_number[1:]
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        
        # Result URL
        result_url = getattr(
            settings,
            'MPESA_B2C_RESULT_URL',
            f"{settings.SITE_URL}/api/v1/settlements/mpesa/b2c/result/"
        )
        timeout_url = getattr(
            settings,
            'MPESA_B2C_TIMEOUT_URL',
            f"{settings.SITE_URL}/api/v1/settlements/mpesa/b2c/timeout/"
        )
        
        payload = {
            "InitiatorName": self.initiator_name,
            "SecurityCredential": self.security_credential,
            "CommandID": command_id,
            "Amount": amount,
            "PartyA": self.shortcode,
            "PartyB": phone_number,
            "Remarks": occasion[:100],
            "QueueTimeOutURL": timeout_url,
            "ResultURL": result_url,
            "Occasion": occasion[:100]
        }
        
        try:
            api_url = f"{self.base_url}/mpesa/b2c/v1/paymentrequest"
            response = requests.post(
                api_url,
                json=payload,
                headers=self._get_headers(),
                timeout=60
            )
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"B2C payment initiated: {result.get('ConversationID')}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"B2C payment failed: {str(e)}")
            raise MpesaAPIException(f"B2C payment failed: {str(e)}")
    
    def transaction_status(self, transaction_id: str) -> Dict:
        """
        Query transaction status
        
        Args:
            transaction_id: M-Pesa transaction ID
            
        Returns:
            dict: Transaction details
        """
        result_url = getattr(
            settings,
            'MPESA_STATUS_RESULT_URL',
            f"{settings.SITE_URL}/api/v1/settlements/mpesa/status/result/"
        )
        timeout_url = getattr(
            settings,
            'MPESA_STATUS_TIMEOUT_URL',
            f"{settings.SITE_URL}/api/v1/settlements/mpesa/status/timeout/"
        )
        
        payload = {
            "Initiator": self.initiator_name,
            "SecurityCredential": self.security_credential,
            "CommandID": "TransactionStatusQuery",
            "TransactionID": transaction_id,
            "PartyA": self.shortcode,
            "IdentifierType": "4",  # 4 = Organization shortcode
            "ResultURL": result_url,
            "QueueTimeOutURL": timeout_url,
            "Remarks": "Transaction Status Query",
            "Occasion": "Status Check"
        }
        
        try:
            api_url = f"{self.base_url}/mpesa/transactionstatus/v1/query"
            response = requests.post(
                api_url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Transaction status query failed: {str(e)}")
            raise MpesaAPIException(f"Failed to query transaction status: {str(e)}")
    
    def account_balance(self) -> Dict:
        """
        Query account balance
        
        Returns:
            dict: Account balance details
        """
        result_url = getattr(
            settings,
            'MPESA_BALANCE_RESULT_URL',
            f"{settings.SITE_URL}/api/v1/settlements/mpesa/balance/result/"
        )
        timeout_url = getattr(
            settings,
            'MPESA_BALANCE_TIMEOUT_URL',
            f"{settings.SITE_URL}/api/v1/settlements/mpesa/balance/timeout/"
        )
        
        payload = {
            "Initiator": self.initiator_name,
            "SecurityCredential": self.security_credential,
            "CommandID": "AccountBalance",
            "PartyA": self.shortcode,
            "IdentifierType": "4",  # 4 = Organization shortcode
            "Remarks": "Balance Query",
            "QueueTimeOutURL": timeout_url,
            "ResultURL": result_url
        }
        
        try:
            api_url = f"{self.base_url}/mpesa/accountbalance/v1/query"
            response = requests.post(
                api_url,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Account balance query failed: {str(e)}")
            raise MpesaAPIException(f"Failed to query account balance: {str(e)}")


# Singleton instance
mpesa_client = MpesaClient()
