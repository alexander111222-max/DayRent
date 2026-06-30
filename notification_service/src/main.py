from faststream import FastStream

from notification_service.src.subscribers.main import broker
import notification_service.src.subscribers.bookings
app = FastStream(broker)





