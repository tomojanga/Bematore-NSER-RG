"""
Management command to seed notification templates
Usage: python manage.py seed_notification_templates
"""
from django.core.management.base import BaseCommand
from apps.notifications.models import NotificationTemplate


class Command(BaseCommand):
    help = 'Create default notification templates for the system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing templates before creating new ones',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n🚀 Seeding Notification Templates\n'))
        self.stdout.write('=' * 70)

        if options['clear']:
            count = NotificationTemplate.objects.count()
            NotificationTemplate.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {count} existing templates\n'))

        templates_data = [
            {
                'template_code': 'EXCLUSION_CONFIRM',
                'template_name': 'Self-Exclusion Confirmation',
                'template_type': 'email',
                'category': 'exclusion_confirmation',
                'subject_en': 'Your Self-Exclusion Has Been Registered',
                'subject_sw': 'Kujigeuza Kutoka Kwa Msingi Umesajiliwa',
                'subject_fr': 'Votre Auto-Exclusion a été Enregistrée',
                'subject_ar': 'تم تسجيل استبعادك الطوعي',
                'body_en': '''Dear {{user_name}},

Your self-exclusion has been successfully registered with the National Self-Exclusion Register (NSER).

Exclusion Details:
- Reference Number: {{exclusion_reference}}
- Period: {{exclusion_period}}
- Start Date: {{start_date}}
- Expiry Date: {{expiry_date}}

During this period, you will not be able to participate in gambling activities with any licensed operator in Kenya.

If you need support or have questions, please contact GRAK:
- Phone: +254 XXX XXX XXX
- Email: support@grak.go.ke

Thank you for taking this important step.

Best regards,
Gambling Regulatory Authority of Kenya (GRAK)''',
                'body_sw': '''Habari {{user_name}},

Kujigeuza mwenyewe kumesajiliwa kwa ushindi na hazina ya kujiondoa kwa serikali (NSER).

Maelezo ya Kujigeuza:
- Nambari ya Sanidi: {{exclusion_reference}}
- Kipindi: {{exclusion_period}}
- Tarehe ya Kuanza: {{start_date}}
- Tarehe ya Kumalizia: {{expiry_date}}

Wakati wa kipindi hiki, hautaweza kushiriki katika shughuli za kumimina na mpango wowote wa kimkakati nchini Kenya.

Ikiwa unahitaji msaada au maswali, tafadhali wasiliana na GRAK:
- Simu: +254 XXX XXX XXX
- Barua Pepe: support@grak.go.ke

Asante kwa hatua hii muhimu.

Karibu sana,
Kamisheni ya Serikali kwa Kumimina (GRAK)''',
                'body_fr': '''Cher {{user_name}},

Votre auto-exclusion a été enregistrée avec succès auprès du Registre national d'auto-exclusion (NSER).

Détails de l'exclusion:
- Numéro de référence: {{exclusion_reference}}
- Période: {{exclusion_period}}
- Date de début: {{start_date}}
- Date d'expiration: {{expiry_date}}

Pendant cette période, vous ne pourrez pas participer aux activités de jeu auprès d'aucun opérateur agréé au Kenya.

Si vous avez besoin d'aide ou avez des questions, veuillez contacter le GRAK:
- Téléphone: +254 XXX XXX XXX
- Email: support@grak.go.ke

Merci pour cette étape importante.

Cordialement,
Autorité de Régulation des Jeux du Kenya (GRAK)''',
                'body_ar': '''عزيزي {{user_name}},

تم تسجيل استبعادك الطوعي بنجاح في سجل الاستبعاد الطوعي الوطني (NSER).

تفاصيل الاستبعاد:
- رقم المرجع: {{exclusion_reference}}
- الفترة: {{exclusion_period}}
- تاريخ البداية: {{start_date}}
- تاريخ انتهاء الصلاحية: {{expiry_date}}

خلال هذه الفترة، لن تتمكن من المشاركة في أنشطة القمار مع أي مشغل مرخص في كينيا.

إذا كنت بحاجة إلى الدعم أو لديك أسئلة، يرجى التواصل مع GRAK:
- الهاتف: +254 XXX XXX XXX
- البريد الإلكتروني: support@grak.go.ke

شكراً على هذه الخطوة المهمة.

مع التحية،
هيئة تنظيم المقامرة بكينيا (GRAK)''',
                'variables': ['user_name', 'exclusion_reference', 'exclusion_period', 'start_date', 'expiry_date'],
                'is_active': True,
                'priority': 'high',
            },
            {
                'template_code': 'EXCLUSION_EXPIRY_REMINDER',
                'template_name': 'Self-Exclusion Expiry Reminder',
                'template_type': 'email',
                'category': 'exclusion_alerts',
                'subject_en': 'Your Self-Exclusion Expires in {{days_remaining}} Days',
                'subject_sw': 'Kujigeuza Kwako Kutakamilika Katika Siku {{days_remaining}}',
                'subject_fr': 'Votre Auto-Exclusion Expire dans {{days_remaining}} Jours',
                'subject_ar': 'ينتهي استبعادك الطوعي في {{days_remaining}} أيام',
                'body_en': '''Dear {{user_name}},

This is a reminder that your self-exclusion will expire on {{expiry_date}}.

Only {{days_remaining}} days remaining.

If you wish to extend your exclusion period or need more time to recover, please contact GRAK immediately.

Contact Information:
- Phone: +254 XXX XXX XXX
- Email: support@grak.go.ke

Best regards,
GRAK''',
                'body_sw': '''Habari {{user_name}},

Hii ni onyo kwamba kujigeuza kwako kutakamilika {{expiry_date}}.

Siku tu {{days_remaining}} zimebaki.

Ikiwa unataka kupanua kipindi chako cha kujigeuza au unahitaji wakati zaidi kupona, tafadhali wasiliana na GRAK sasa hivi.

Maelezo ya Kuwasiliana:
- Simu: +254 XXX XXX XXX
- Barua Pepe: support@grak.go.ke

Karibu sana,
GRAK''',
                'body_fr': '''Cher {{user_name}},

Ceci est un rappel que votre auto-exclusion expirera le {{expiry_date}}.

Il ne reste que {{days_remaining}} jours.

Si vous souhaitez prolonger votre période d'exclusion ou si vous avez besoin de plus de temps pour récupérer, veuillez contacter le GRAK immédiatement.

Informations de Contact:
- Téléphone: +254 XXX XXX XXX
- Email: support@grak.go.ke

Cordialement,
GRAK''',
                'body_ar': '''عزيزي {{user_name}},

هذا تذكير بانتهاء استبعادك الطوعي في {{expiry_date}}.

{{days_remaining}} يوم فقط متبقي.

إذا كنت تريد تمديد فترة استبعادك أو كنت بحاجة إلى مزيد من الوقت للشفاء، يرجى التواصل مع GRAK على الفور.

معلومات الاتصال:
- الهاتف: +254 XXX XXX XXX
- البريد الإلكتروني: support@grak.go.ke

مع التحية،
GRAK''',
                'variables': ['user_name', 'expiry_date', 'days_remaining'],
                'is_active': True,
                'priority': 'high',
            },
            {
                'template_code': 'ASSESSMENT_REMINDER',
                'template_name': 'Risk Assessment Reminder',
                'template_type': 'email',
                'category': 'assessment_reminder',
                'subject_en': 'Your Quarterly Risk Assessment is Due',
                'subject_sw': 'Tathmini Yako ya Hatari ya Robo Mwaka Inaeza Kufa',
                'subject_fr': 'Votre Évaluation du Risque Trimestrielle est Échue',
                'subject_ar': 'تقييمك الفصلي للمخاطر مستحق الآن',
                'body_en': '''Dear {{user_name}},

Your periodic gambling risk assessment is due on {{due_date}}.

Completing this assessment helps us:
- Monitor your gambling behavior
- Provide appropriate support
- Ensure responsible gambling practices

Please log in to your account and complete the assessment.

Best regards,
GRAK''',
                'body_sw': '''Habari {{user_name}},

Tathmini yako ya hatari ya kumimina ineza kufa {{due_date}}.

Kukamilisha tathmini hii inasaidia sisi:
- Kufuatilia tabia yako ya kumimina
- Kutoa msaada unaolingana
- Kuhakikisha kumimina kwa jukumu

Tafadhali ingia kwenye akaunti yako na kamata tathmini.

Karibu sana,
GRAK''',
                'variables': ['user_name', 'due_date'],
                'is_active': True,
                'priority': 'medium',
            },
            {
                'template_code': 'PASSWORD_RESET',
                'template_name': 'Password Reset Request',
                'template_type': 'email',
                'category': 'system_alert',
                'subject_en': 'Reset Your Password',
                'subject_sw': 'Badilisha Neno Lako la Siri',
                'subject_fr': 'Réinitialiser Votre Mot de Passe',
                'subject_ar': 'إعادة تعيين كلمة المرور الخاصة بك',
                'body_en': '''Dear {{user_name}},

We received a request to reset your password. Click the link below to proceed:

{{reset_url}}

This link will expire in 24 hours.

If you did not request this, please ignore this email.

Best regards,
GRAK Security Team''',
                'body_sw': '''Habari {{user_name}},

Tulikubaliana na ombi la kuongeza neno lako la siri. Bonyeza kiungo hapa chini ili kuendelea:

{{reset_url}}

Kiungo hiki kitakamilika katika saa 24.

Ikiwa haulitaki hili, tafadhali puuza barua pepe hii.

Karibu sana,
Timu ya Usalama wa GRAK''',
                'variables': ['user_name', 'reset_url'],
                'is_active': True,
                'priority': 'critical',
            },
            {
                'template_code': 'EMAIL_VERIFICATION',
                'template_name': 'Email Verification',
                'template_type': 'email',
                'category': 'system_alert',
                'subject_en': 'Verify Your Email Address',
                'subject_sw': 'Hakikisha Anwani Yako ya Barua Pepe',
                'subject_fr': 'Vérifiez Votre Adresse E-mail',
                'subject_ar': 'تحقق من عنوان بريدك الإلكتروني',
                'body_en': '''Dear {{user_name}},

Welcome to GRAK NSER! Please verify your email address to complete your registration.

Verification Code: {{verification_code}}

Best regards,
GRAK''',
                'body_sw': '''Habari {{user_name}},

Karibu kwenye GRAK NSER! Tafadhali hakikisha anwani yako ya barua pepe ili kumalizia usajili wako.

Nambari ya Uhakikaji: {{verification_code}}

Karibu sana,
GRAK''',
                'variables': ['user_name', 'verification_code'],
                'is_active': True,
                'priority': 'high',
            },
            {
                'template_code': 'EXCLUSION_CONFIRM_SMS',
                'template_name': 'Self-Exclusion Confirmation SMS',
                'template_type': 'sms',
                'category': 'exclusion_confirmation',
                'body_en': 'GRAK: Your self-exclusion (Ref: {{exclusion_ref}}) is active until {{expiry_date}}. For support, visit https://grak.go.ke or call +254 XXX XXX XXX',
                'body_sw': 'GRAK: Kujigeuza kwako (Ref: {{exclusion_ref}}) ni hai hadi {{expiry_date}}. Kwa msaada, tembelea https://grak.go.ke au piga simu +254 XXX XXX XXX',
                'variables': ['exclusion_ref', 'expiry_date'],
                'is_active': True,
                'priority': 'high',
            },
            {
                'template_code': 'EXCLUSION_EXPIRY_SMS',
                'template_name': 'Self-Exclusion Expiry SMS',
                'template_type': 'sms',
                'category': 'exclusion_alerts',
                'body_en': 'GRAK: Your self-exclusion expires in {{days_remaining}} days ({{expiry_date}}). Contact us before expiry if you wish to extend. +254 XXX XXX XXX',
                'body_sw': 'GRAK: Kujigeuza kwako kinaeza kufa katika siku {{days_remaining}} ({{expiry_date}}). Wasiliana nasi kabla ya kumalizia ikiwa unataka kupanua. +254 XXX XXX XXX',
                'variables': ['days_remaining', 'expiry_date'],
                'is_active': True,
                'priority': 'high',
            },
            {
                'template_code': 'ASSESSMENT_REMINDER_SMS',
                'template_name': 'Assessment Reminder SMS',
                'template_type': 'sms',
                'category': 'assessment_reminder',
                'body_en': 'GRAK: Your quarterly risk assessment is due by {{due_date}}. Complete it at https://citizen.bematore.com or call +254 XXX XXX XXX',
                'body_sw': 'GRAK: Tathmini yako ya hatari ya robo mwaka inaeza kufa {{due_date}}. Kamata hii kwenye https://citizen.bematore.com au piga simu +254 XXX XXX XXX',
                'variables': ['due_date'],
                'is_active': True,
                'priority': 'medium',
            },
        ]

        created_count = 0
        updated_count = 0

        for template_data in templates_data:
            template, created = NotificationTemplate.objects.update_or_create(
                template_code=template_data['template_code'],
                defaults=template_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✓ Created: {template_data["template_code"]}')
            else:
                updated_count += 1
                self.stdout.write(f'⟳ Updated: {template_data["template_code"]}')

        self.stdout.write('=' * 70)
        self.stdout.write(self.style.SUCCESS(
            f'\n✓ SUCCESS: Created {created_count} new templates, Updated {updated_count} existing\n'
        ))
