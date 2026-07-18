from faststream.rabbit import RabbitBroker, RabbitQueue

broker = RabbitBroker("amqp://guest:guest@localhost:5672/")

booking_notifications_queue = RabbitQueue(name="notification", routing_key="booking.#")

