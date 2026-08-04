from faststream.rabbit import RabbitExchange, ExchangeType

from notification_service.src.services.notification.booking_notifications import BookingNotificationsService
from notification_service.src.subscribers.main import broker, booking_notifications_queue, notification_exchange


@broker.subscriber(queue=booking_notifications_queue, exchange=notification_exchange)
async def get_booking_notification(data: dict):

    if data["event"] == "booking_created":
        await BookingNotificationsService.booking_create(data)

    if data["event"] == "booking_cancelled":
        await BookingNotificationsService.booking_cancel(data)






