import requests

# Get API key from the operator dashboard at /dashboard/api-keys/
api_key = 'pk_live_iOx6wHVJfBKgYsV7V0Pf9gVsZ0R7PcpvptIm2rLjdwY'
endpoint = 'https://api-bematore.onrender.com/api/v1/nser/lookup/'

# IMPORTANT: Use X-API-Key header, NOT Authorization header
response = requests.post(
    endpoint,
    headers={
        'X-API-Key': api_key,  # Use X-API-Key header for API key authentication
        'Content-Type': 'application/json'
    },
    json={
        'phone_number': '+254736887811',
        'national_id': '38450128',
        'operator_id': 'b8d32313-44d5-43b9-a079-7cdf911344f7'  # Replace with actual operator ID
    }
)

print(response.json())
