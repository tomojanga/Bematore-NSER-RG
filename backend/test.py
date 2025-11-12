import requests

# Get API key from the operator dashboard at /dashboard/api-keys/
api_key = 'your_actual_api_key_here'
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
        'national_id': '38450128'
    }
)

print(response.json())
