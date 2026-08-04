from faststream import FastStream

from notification_service.src.subscribers.main import broker
import notification_service.src.subscribers.booking
import notification_service.src.subscribers.email_verify
app = FastStream(broker)





