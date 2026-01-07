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
        admin, created = User.objects.get_or_create(
            phone_number='+254700000001',
            defaults={
                'email': 'admin@grak.go.ke',
                'first_name': 'GRAK',
                'last_name': 'Administrator',
                'role': 'grak_admin',
                'is_active': True,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('GRAKAdmin@2026')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created GRAK Admin: {admin.phone_number}'))
        else:
            self.stdout.write(self.style.WARNING(f'✗ GRAK Admin already exists: {admin.phone_number}'))

        # Create GRAK Officer
        officer, created = User.objects.get_or_create(
            phone_number='+254700000002',
            defaults={
                'email': 'officer@grak.go.ke',
                'first_name': 'GRAK',
                'last_name': 'Officer',
                'role': 'grak_officer',
                'is_active': True,
                'is_staff': True,
            }
        )
        if created:
            officer.set_password('GRAKOfficer@2026')
            officer.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created GRAK Officer: {officer.phone_number}'))
        else:
            self.stdout.write(self.style.WARNING(f'✗ GRAK Officer already exists: {officer.phone_number}'))

        self.stdout.write(self.style.SUCCESS('\n=== GRAK Credentials ==='))
        self.stdout.write(self.style.SUCCESS('Admin:'))
        self.stdout.write(self.style.SUCCESS('  Phone: +254700000001'))
        self.stdout.write(self.style.SUCCESS('  Password: GRAKAdmin@2026'))
        self.stdout.write(self.style.SUCCESS('\nOfficer:'))
        self.stdout.write(self.style.SUCCESS('  Phone: +254700000002'))
        self.stdout.write(self.style.SUCCESS('  Password: GRAKOfficer@2026'))
