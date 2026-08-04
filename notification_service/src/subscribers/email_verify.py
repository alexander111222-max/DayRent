from notification_service.src.services.notification.verify_email_notification import VerifyEmailNotificationsService
from notification_service.src.subscribers.main import email_verified_notifications_queue, broker, notification_exchange


@broker.subscriber(queue=email_verified_notifications_queue, exchange=notification_exchange)
async def get_booking_notification(data: dict):

    if data["event"] == "send_verify_code":
        await VerifyEmailNotificationsService.send_code_for_verify(data)
