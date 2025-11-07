from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        super().ready()

        try:
            import apps.users.tasks  
        except Exception:
            # Avoid crashing app startup if optional dependencies are missing
            pass
