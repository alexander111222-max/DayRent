docker run -d `
--name rabbitmq `
--hostname rabbitmq `
-p 15672:15672 `
-p 5672:5672 `
rabbitmq:4.0.9-management 