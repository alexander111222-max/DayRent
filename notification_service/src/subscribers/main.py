from faststream.rabbit import RabbitBroker, RabbitQueue, RabbitExchange, ExchangeType

broker = RabbitBroker("amqp://guest:guest@localhost:5672/")

booking_notifications_queue = RabbitQueue(name="notification", routing_key="booking.#")

email_verified_notifications_queue = RabbitQueue(name="notification", routing_key="email.#")

notification_exchange = RabbitExchange("notification_exchange", type=ExchangeType.TOPIC)