from pathlib import Path

from notification_service.src.services.email_service import EmailService


class VerifyEmailNotificationsService:

    @staticmethod
    def get_email_template(filename: str, **kwargs) -> str:
        template = Path(__file__).parent / "templates" / filename
        html = template.read_text(encoding="utf-8")
        for key, value in kwargs.items():
            html = html.replace(f"{{{{ {key} }}}}", str(value))
        return html

    @classmethod
    async def send_code_for_verify(cls, data: dict):
        subject = "Код подтверждения"
        html = cls.get_email_template(
            filename="verification_code.html",
            code=data["code"]
        )
        await EmailService.sent_to_email(data["email"], subject, html)


