from faststream.rabbit import RabbitExchange, ExchangeType

from notification_service.src.services.notification.booking_notifications import BookingNotificationsService
from notification_service.src.subscribers.main import broker, booking_notifications_queue

booking_exchange = RabbitExchange("booking_exchange", type=ExchangeType.TOPIC)


@broker.subscriber(queue=booking_notifications_queue,
                   exchange=booking_exchange)
async def get_booking_message(data: dict):

    if data["event"] == "booking_created":
        await BookingNotificationsService.booking_create(data)

    elif data["event"] == "booking_canceled":
        await BookingNotificationsService.booking_cancel(data)




