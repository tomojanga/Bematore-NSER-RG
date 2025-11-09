# Create GRAK Admin and Staff Users

## Quick Setup

Run this command to create GRAK admin and officer accounts:

```bash
python src/manage.py create_grak_admin
```

## Created Accounts

### GRAK Administrator
- **Phone**: +254700000001
- **Email**: admin@grak.go.ke
- **Password**: GRAKAdmin@2024
- **Role**: grak_admin
- **Permissions**: Full system access

### GRAK Officer
- **Phone**: +254700000002
- **Email**: officer@grak.go.ke
- **Password**: GRAKOfficer@2024
- **Role**: grak_officer
- **Permissions**: Standard staff access

## Login to GRAK Portal

1. Go to http://localhost:3002
2. Use phone number and password above
3. Access dashboard and manage operators

## Manual Creation (Alternative)

If you prefer to create manually via Django shell:

```python
python src/manage.py shell

from django.contrib.auth import get_user_model
User = get_user_model()

# Create Admin
admin = User.objects.create(
    phone_number='+254700000001',
    email='admin@grak.go.ke',
    first_name='GRAK',
    last_name='Administrator',
    role='grak_admin',
    is_active=True,
    is_verified=True,
    is_staff=True,
    is_superuser=True
)
admin.set_password('GRAKAdmin@2024')
admin.save()

# Create Officer
officer = User.objects.create(
    phone_number='+254700000002',
    email='officer@grak.go.ke',
    first_name='GRAK',
    last_name='Officer',
    role='grak_officer',
    is_active=True,
    is_verified=True,
    is_staff=True
)
officer.set_password('GRAKOfficer@2024')
officer.save()
```

## Change Password

To change password later:

```bash
python src/manage.py shell

from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(phone_number='+254700000001')
user.set_password('NewPassword123')
user.save()
```

## Security Notes

⚠️ **IMPORTANT**: Change these default passwords in production!

1. Run the command to create users
2. Login to GRAK portal
3. Change passwords immediately
4. Store credentials securely
