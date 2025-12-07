"""
Email Template Components and Rendering System
Reusable HTML components for professional email templates
"""
from typing import Dict, Any, Optional, List
from django.template import Template, Context
import logging

logger = logging.getLogger(__name__)


class EmailComponent:
    """Base class for email template components"""
    
    def render(self, **kwargs) -> str:
        """Render component to HTML"""
        raise NotImplementedError


class Header(EmailComponent):
    """Email header component with logo and branding"""
    
    def __init__(self, logo_url: str = None, company_name: str = "GRAK NSER", title: str = None):
        self.logo_url = logo_url or "https://grak.go.ke/logo.png"
        self.company_name = company_name
        self.title = title
    
    def render(self, **kwargs) -> str:
        template = """
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #003366; border-bottom: 4px solid #FF6B35;">
    <tr>
        <td style="padding: 20px; text-align: center;">
            {% if logo_url %}
            <img src="{{ logo_url }}" alt="{{ company_name }}" style="height: 50px; margin-bottom: 10px;">
            {% endif %}
            <h1 style="margin: 10px 0 0 0; color: #FFFFFF; font-size: 24px; font-weight: bold;">
                {{ company_name }}
            </h1>
            {% if title %}
            <p style="margin: 5px 0 0 0; color: #E8E8E8; font-size: 14px;">{{ title }}</p>
            {% endif %}
        </td>
    </tr>
</table>
"""
        t = Template(template)
        ctx = Context({
            'logo_url': self.logo_url,
            'company_name': self.company_name,
            'title': self.title
        })
        return t.render(ctx)


class Hero(EmailComponent):
    """Hero section with background color and main message"""
    
    def __init__(self, title: str, subtitle: str = None, bg_color: str = "#F5F5F5"):
        self.title = title
        self.subtitle = subtitle
        self.bg_color = bg_color
    
    def render(self, **kwargs) -> str:
        template = """
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{ bg_color }};">
    <tr>
        <td style="padding: 40px 20px; text-align: center;">
            <h2 style="margin: 0; color: #003366; font-size: 28px; font-weight: bold;">
                {{ title }}
            </h2>
            {% if subtitle %}
            <p style="margin: 10px 0 0 0; color: #666666; font-size: 16px;">{{ subtitle }}</p>
            {% endif %}
        </td>
    </tr>
</table>
"""
        t = Template(template)
        ctx = Context({
            'title': self.title,
            'subtitle': self.subtitle,
            'bg_color': self.bg_color
        })
        return t.render(ctx)


class TextBlock(EmailComponent):
    """Simple text block component"""
    
    def __init__(self, text: str, text_align: str = "left"):
        self.text = text
        self.text_align = text_align
    
    def render(self, **kwargs) -> str:
        template = """
<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td style="padding: 20px; text-align: {{ text_align }}; color: #333333; font-size: 14px; line-height: 1.6;">
            {{ text|safe }}
        </td>
    </tr>
</table>
"""
        t = Template(template)
        ctx = Context({
            'text': self.text,
            'text_align': self.text_align
        })
        return t.render(ctx)


class Alert(EmailComponent):
    """Alert box component (warning, info, success, error)"""
    
    def __init__(self, message: str, alert_type: str = "info", icon: str = "ℹ️"):
        self.message = message
        self.alert_type = alert_type  # info, success, warning, error
        self.icon = icon
        
        self.colors = {
            'info': ('#E3F2FD', '#0D47A1', '#1976D2'),
            'success': ('#E8F5E9', '#1B5E20', '#4CAF50'),
            'warning': ('#FFF3E0', '#E65100', '#FF9800'),
            'error': ('#FFEBEE', '#B71C1C', '#F44336')
        }
    
    def render(self, **kwargs) -> str:
        bg_color, border_color, text_color = self.colors.get(self.alert_type, self.colors['info'])
        
        template = """
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: {{ bg_color }}; border-left: 5px solid {{ border_color }};">
    <tr>
        <td style="padding: 15px 20px; color: {{ text_color }}; font-size: 14px;">
            <strong>{{ icon }} {{ message|safe }}</strong>
        </td>
    </tr>
</table>
"""
        t = Template(template)
        ctx = Context({
            'message': self.message,
            'icon': self.icon,
            'bg_color': bg_color,
            'border_color': border_color,
            'text_color': text_color
        })
        return t.render(ctx)


class Button(EmailComponent):
    """Call-to-action button component"""
    
    def __init__(self, text: str, url: str, bg_color: str = "#FF6B35", text_color: str = "#FFFFFF"):
        self.text = text
        self.url = url
        self.bg_color = bg_color
        self.text_color = text_color
    
    def render(self, **kwargs) -> str:
        template = """
<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td style="padding: 20px; text-align: center;">
            <a href="{{ url }}" style="display: inline-block; padding: 12px 30px; background-color: {{ bg_color }}; color: {{ text_color }}; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
                {{ text }}
            </a>
        </td>
    </tr>
</table>
"""
        t = Template(template)
        ctx = Context({
            'text': self.text,
            'url': self.url,
            'bg_color': self.bg_color,
            'text_color': self.text_color
        })
        return t.render(ctx)


class InfoBox(EmailComponent):
    """Information box with title and content"""
    
    def __init__(self, title: str, items: List[tuple]):
        self.title = title
        self.items = items  # List of (label, value) tuples
    
    def render(self, **kwargs) -> str:
        items_html = ""
        for label, value in self.items:
            items_html += f"""
            <tr>
                <td style="padding: 10px 20px; border-bottom: 1px solid #EEEEEE; font-weight: bold; color: #666666; width: 30%;">
                    {label}
                </td>
                <td style="padding: 10px 20px; border-bottom: 1px solid #EEEEEE; color: #333333;">
                    {value}
                </td>
            </tr>
            """
        
        template = f"""
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #DDDDDD;">
    <tr>
        <td colspan="2" style="padding: 15px 20px; background-color: #F9F9F9; border-bottom: 2px solid #003366; font-weight: bold; color: #003366; font-size: 14px;">
            {self.title}
        </td>
    </tr>
    {items_html}
</table>
"""
        return template


class Divider(EmailComponent):
    """Horizontal divider component"""
    
    def __init__(self, color: str = "#DDDDDD", height: int = 1):
        self.color = color
        self.height = height
    
    def render(self, **kwargs) -> str:
        template = """
<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td style="height: {{ height }}px; background-color: {{ color }}; margin: 20px 0;"></td>
    </tr>
</table>
"""
        t = Template(template)
        ctx = Context({
            'color': self.color,
            'height': self.height
        })
        return t.render(ctx)


class Footer(EmailComponent):
    """Email footer component"""
    
    def __init__(self, company_name: str = "GRAK", support_email: str = "support@grak.go.ke", 
                 phone: str = "+254 XXX XXX XXX", website: str = "https://grak.go.ke"):
        self.company_name = company_name
        self.support_email = support_email
        self.phone = phone
        self.website = website
    
    def render(self, **kwargs) -> str:
        template = """
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F5F5; border-top: 1px solid #DDDDDD;">
    <tr>
        <td style="padding: 30px 20px; text-align: center; color: #666666; font-size: 12px;">
            <p style="margin: 0 0 5px 0;">
                <strong>{{ company_name }} - Gambling Regulatory Authority of Kenya</strong>
            </p>
            <p style="margin: 5px 0;">
                📧 {{ support_email }} | 📱 {{ phone }}
            </p>
            <p style="margin: 5px 0;">
                🌐 <a href="{{ website }}" style="color: #0066CC; text-decoration: none;">{{ website }}</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #999999; font-size: 11px;">
                This is an automated email. Please do not reply directly. For support, contact us via the channels above.
            </p>
        </td>
    </tr>
</table>
"""
        t = Template(template)
        ctx = Context({
            'company_name': self.company_name,
            'support_email': self.support_email,
            'phone': self.phone,
            'website': self.website
        })
        return t.render(ctx)


class EmailTemplate:
    """Main email template builder"""
    
    def __init__(self, subject: str, preheader: str = None):
        self.subject = subject
        self.preheader = preheader or subject
        self.components: List[EmailComponent] = []
    
    def add_component(self, component: EmailComponent) -> 'EmailTemplate':
        """Add a component to the template"""
        self.components.append(component)
        return self
    
    def add_header(self, logo_url: str = None, company_name: str = "GRAK NSER", title: str = None) -> 'EmailTemplate':
        self.add_component(Header(logo_url, company_name, title))
        return self
    
    def add_hero(self, title: str, subtitle: str = None, bg_color: str = "#F5F5F5") -> 'EmailTemplate':
        self.add_component(Hero(title, subtitle, bg_color))
        return self
    
    def add_text(self, text: str, text_align: str = "left") -> 'EmailTemplate':
        self.add_component(TextBlock(text, text_align))
        return self
    
    def add_alert(self, message: str, alert_type: str = "info", icon: str = "ℹ️") -> 'EmailTemplate':
        self.add_component(Alert(message, alert_type, icon))
        return self
    
    def add_button(self, text: str, url: str, bg_color: str = "#FF6B35", text_color: str = "#FFFFFF") -> 'EmailTemplate':
        self.add_component(Button(text, url, bg_color, text_color))
        return self
    
    def add_info_box(self, title: str, items: List[tuple]) -> 'EmailTemplate':
        self.add_component(InfoBox(title, items))
        return self
    
    def add_divider(self, color: str = "#DDDDDD", height: int = 1) -> 'EmailTemplate':
        self.add_component(Divider(color, height))
        return self
    
    def add_footer(self, company_name: str = "GRAK", support_email: str = "support@grak.go.ke",
                  phone: str = "+254 XXX XXX XXX", website: str = "https://grak.go.ke") -> 'EmailTemplate':
        self.add_component(Footer(company_name, support_email, phone, website))
        return self
    
    def render(self) -> str:
        """Render complete email HTML"""
        components_html = "\n".join([c.render() for c in self.components])
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.subject}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #F0F0F0;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background-color: #FFFFFF;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        a {{
            color: #0066CC;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <span style="display:none;font-size:1px;color:#fefefe;line-height:1px;font-family:Arial,sans-serif;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        {self.preheader}
    </span>
    <div class="container">
        {components_html}
    </div>
</body>
</html>
"""
        return html


# Template Factory Functions
def create_exclusion_confirmation_email(user_name: str, exclusion_ref: str, start_date: str, 
                                       expiry_date: str, period: str, company_name: str = "NSER") -> str:
    """Create self-exclusion confirmation email (multi-country compatible)"""
    
    template = EmailTemplate(
        subject=f"Self-Exclusion Confirmation - {company_name}",
        preheader=f"Your self-exclusion has been registered - Reference {exclusion_ref}"
    )
    
    template.add_header(title="Self-Exclusion Confirmation", company_name=company_name) \
        .add_hero("Exclusion Registration Confirmed") \
        .add_text(f"Dear {user_name},<br><br>Your self-exclusion has been successfully registered.") \
        .add_alert(
            f"Your exclusion is now active. You cannot access gambling services during this period.",
            alert_type="info",
            icon="✓"
        ) \
        .add_info_box("Exclusion Details", [
            ("Reference Number", exclusion_ref),
            ("Exclusion Period", period),
            ("Start Date", start_date),
            ("Expiry Date", expiry_date)
        ]) \
        .add_text(
            "During this period, you will not be able to participate in gambling activities with any licensed operator."
        ) \
        .add_divider() \
        .add_text(
            "<strong>Need Support?</strong><br>If you have questions or need to modify your exclusion, please contact our support team."
        ) \
        .add_footer(company_name=company_name)
    
    return template.render()


def create_exclusion_expiry_reminder_email(user_name: str, days_remaining: int, expiry_date: str, 
                                          company_name: str = "NSER", portal_url: str = None) -> str:
    """Create exclusion expiry reminder email (multi-country compatible)"""
    
    if portal_url is None:
        portal_url = "https://portal.example.com/dashboard/exclusion"
    
    template = EmailTemplate(
        subject=f"Your Self-Exclusion Expires in {days_remaining} Days",
        preheader=f"Important: Your self-exclusion will expire on {expiry_date}"
    )
    
    template.add_header(title="Exclusion Expiry Reminder", company_name=company_name) \
        .add_hero(f"Your Exclusion Expires Soon") \
        .add_text(f"Dear {user_name},<br><br>This is a reminder that your self-exclusion will expire on {expiry_date}.") \
        .add_alert(
            f"⏰ Only {days_remaining} days remaining. Once expired, you may access gambling services again.",
            alert_type="warning",
            icon="⚠️"
        ) \
        .add_text(
            "If you wish to extend your exclusion period or need more time to recover, please contact our support team immediately."
        ) \
        .add_button("Update Your Exclusion", portal_url) \
        .add_divider() \
        .add_text(
            "<strong>Important:</strong> If you do not wish to resume gambling after your exclusion expires, " +
            "you can register for a new self-exclusion at any time."
        ) \
        .add_footer(company_name=company_name)
    
    return template.render()


def create_assessment_reminder_email(user_name: str, assessment_due_date: str, 
                                    company_name: str = "NSER", portal_url: str = None) -> str:
    """Create assessment reminder email (multi-country compatible)"""
    
    if portal_url is None:
        portal_url = "https://portal.example.com/dashboard/assessment"
    
    template = EmailTemplate(
        subject="Your Risk Assessment is Due",
        preheader=f"Please complete your gambling risk assessment by {assessment_due_date}"
    )
    
    template.add_header(title="Assessment Reminder", company_name=company_name) \
        .add_hero("Risk Assessment Due") \
        .add_text(f"Dear {user_name},<br><br>Your periodic gambling risk assessment is due.") \
        .add_alert(
            f"📋 Due Date: {assessment_due_date}",
            alert_type="info",
            icon="ℹ️"
        ) \
        .add_text(
            "This assessment helps us ensure responsible gambling practices and provide appropriate support."
        ) \
        .add_button("Complete Assessment", portal_url) \
        .add_footer(company_name=company_name)
    
    return template.render()


def create_password_reset_email(user_name: str, reset_url: str, expiry_hours: int = 24, 
                               company_name: str = "NSER") -> str:
    """Create password reset email (multi-country compatible)"""
    
    template = EmailTemplate(
        subject="Reset Your Password",
        preheader="Click the link below to reset your password"
    )
    
    template.add_header(title="Password Reset", company_name=company_name) \
        .add_hero("Password Reset Request") \
        .add_text(f"Dear {user_name},<br><br>We received a request to reset your password.") \
        .add_alert(
            f"This link will expire in {expiry_hours} hours. If you didn't request this, please ignore this email.",
            alert_type="info",
            icon="🔐"
        ) \
        .add_button("Reset Password", reset_url) \
        .add_text(
            "If the button above doesn't work, copy and paste this link in your browser:<br>" +
            f'<code style="background-color: #F0F0F0; padding: 10px; display: block; margin: 10px 0; overflow-wrap: break-word;">{reset_url}</code>'
        ) \
        .add_footer(company_name=company_name)
    
    return template.render()


def create_compliance_notice_email(user_name: str, notice_title: str, notice_content: str, 
                                  action_url: str = None, company_name: str = "NSER") -> str:
    """Create compliance notice email (multi-country compatible)"""
    
    template = EmailTemplate(
        subject=f"Important Compliance Notice: {notice_title}",
        preheader=notice_title
    )
    
    template.add_header(title="Compliance Notice", company_name=company_name) \
        .add_hero(notice_title) \
        .add_alert(
            f"📌 This is an important notice from {company_name}.",
            alert_type="warning",
            icon="⚠️"
        ) \
        .add_text(notice_content)
    
    if action_url:
        template.add_button("View Details", action_url)
    
    template.add_divider() \
        .add_text(
            "<strong>Questions?</strong><br>Please contact our support team"
        ) \
        .add_footer(company_name=company_name)
    
    return template.render()


def create_system_alert_email(alert_title: str, alert_message: str, severity: str = "info",
                             company_name: str = "NSER") -> str:
    """Create system alert email (multi-country compatible)"""
    
    alert_colors = {
        'critical': '🔴',
        'warning': '🟠',
        'info': '🔵'
    }
    
    template = EmailTemplate(
        subject=f"System Alert: {alert_title}",
        preheader=alert_title
    )
    
    template.add_header(title="System Alert", company_name=company_name) \
        .add_hero(alert_title) \
        .add_alert(
            alert_message,
            alert_type=severity,
            icon=alert_colors.get(severity, 'ℹ️')
        ) \
        .add_footer(company_name=company_name)
    
    return template.render()
