from notification_service.src.services.email_service import EmailService
from pathlib import Path

class BookingNotificationsService:

    @staticmethod
    def get_email_template(filename: str, **kwargs) -> str:
        template = Path(__file__).parent / "templates" / filename
        html = template.read_text(encoding="utf-8")
        for key, value in kwargs.items():
            html = html.replace(f"{{{{ {key} }}}}", str(value))
        return html

    @classmethod
    async def booking_create(cls, data: dict):
        subject = "Новое бронирование"
        html = cls.get_email_template(
            "booking_created_for_owner.html",
            date_from=data["booking"]["date_from"],
            date_to=data["booking"]["date_to"],
            booking_id=data["booking"]["id"],
            renter_email=data["renter"]["email"],
        )
        await EmailService.sent_to_email(data["owner"]["email"], subject, html)

        html = cls.get_email_template(
            "booking_created_for_renter.html",
            date_from=data["booking"]["date_from"],
            date_to=data["booking"]["date_to"],
            owner_email=data["owner"]["email"],
        )
        await EmailService.sent_to_email(data["renter"]["email"], subject, html)


    @classmethod
    async def booking_cancel(cls, data: dict):
        subject = "Отмена брони"
        message_html_to_owner = (f"<p>Произошла отмена брони с"
                        f"<strong>{data["booking"]["date_from"]}</strong> по <strong>{data["booking"]["date_to"]}</strong>"
                        f"<br>Пожалуйста перейдите на сайт для просмотра подробностей</p>")
        await EmailService.sent_to_email(data["owner"]["email"], subject, message_html_to_owner)

