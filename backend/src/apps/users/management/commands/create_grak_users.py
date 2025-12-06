"""
Management command to create GRAK admin and staff users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create GRAK admin and staff users'

    def handle(self, *args, **options):
        # Create GRAK Admin
        admin_data = {
            'phone_number': '+254700000001',
            'email': 'admin@grak.go.ke',
            'first_name': 'GRAK',
            'last_name': 'Administrator',
            'role': 'grak_admin',
            'verification_status': 'verified',
            'is_phone_verified': True,
            'is_email_verified': True,
            'is_active': True,
            'is_staff': True,
        }
        
        admin, created = User.objects.get_or_create(
            phone_number=admin_data['phone_number'],
            defaults=admin_data
        )
        
        if created:
            admin.set_password('GRAKAdmin@2024')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created GRAK Admin: {admin.phone_number}'))
            self.stdout.write(self.style.WARNING(f'  Password: GRAKAdmin@2024'))
        else:
            self.stdout.write(self.style.WARNING(f'✗ GRAK Admin already exists: {admin.phone_number}'))

        # Create GRAK Officer
        officer_data = {
            'phone_number': '+254700000002',
            'email': 'officer@grak.go.ke',
            'first_name': 'GRAK',
            'last_name': 'Officer',
            'role': 'grak_officer',
            'verification_status': 'verified',
            'is_phone_verified': True,
            'is_email_verified': True,
            'is_active': True,
            'is_staff': True,
        }
        
        officer, created = User.objects.get_or_create(
            phone_number=officer_data['phone_number'],
            defaults=officer_data
        )
        
        if created:
            officer.set_password('GRAKOfficer@2024')
            officer.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created GRAK Officer: {officer.phone_number}'))
            self.stdout.write(self.style.WARNING(f'  Password: GRAKOfficer@2024'))
        else:
            self.stdout.write(self.style.WARNING(f'✗ GRAK Officer already exists: {officer.phone_number}'))

        self.stdout.write(self.style.SUCCESS('\n=== GRAK Users Created ==='))
        self.stdout.write(self.style.SUCCESS('Admin Login:'))
        self.stdout.write(f'  Phone: +254700000001')
        self.stdout.write(f'  Password: GRAKAdmin@2024')
        self.stdout.write(self.style.SUCCESS('\nOfficer Login:'))
        self.stdout.write(f'  Phone: +254700000002')
        self.stdout.write(f'  Password: GRAKOfficer@2024')
