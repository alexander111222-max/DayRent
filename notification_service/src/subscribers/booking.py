from faststream.rabbit import RabbitExchange, ExchangeType

from notification_service.src.services.notification.booking_notifications import BookingNotificationsService
from notification_service.src.services.notification.verify_email_notification import VerifyEmailNotificationsService

from notification_service.src.subscribers.main import broker, booking_notifications_queue, \
    email_verified_notifications_queue

notification_exchange = RabbitExchange("notification_exchange", type=ExchangeType.TOPIC)

@broker.subscriber(queue=booking_notifications_queue, exchange=notification_exchange)
@broker.subscriber(queue=email_verified_notifications_queue, exchange=notification_exchange)
async def handle_notification(data: dict):

    if data["event"] == "booking_created":
        await BookingNotificationsService.booking_create(data)

    if data["event"] == "booking_cancelled":
        await BookingNotificationsService.booking_cancel(data)

    if data["event"] == "send_verify_code":
        await VerifyEmailNotificationsService.send_code_for_verify(data)






