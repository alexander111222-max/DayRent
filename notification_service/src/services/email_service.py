import resend

from notification_service.utils.config import settings

resend.api_key = settings.RESEND_API_KEY




class EmailService:


    @classmethod
    async def sent_to_email(cls, email: str, subject: str, html: str):
        r = resend.Emails.send({
            "from": "info@day-rent.ru",
            "to": email,
            "subject": subject,
            "html": html
        })



