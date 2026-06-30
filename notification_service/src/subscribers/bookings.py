from notification_service.src.services.notification.booking_notifications import BookingNotificationsService
from notification_service.src.subscribers.main import broker


@broker.subscriber("bookings")
async def get_booking_message(data: dict):

    if data["event"] == "booking_created":
        await BookingNotificationsService.booking_create(data)

    elif data["event"] == "booking_canceled":
        await BookingNotificationsService.booking_cancel(data)


