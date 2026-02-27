
class DayRentException(Exception):
    detail = "Произошла непредвиденная ошибка"

    def __init__(self, *args, **kwargs):
        super().__init__(self.detail, *args, **kwargs)



class ObjectNotFoundException(DayRentException):
    detail = "Обьект/ы не найден/ы"

class UserNotFoundException(DayRentException):
    detail = "Пользователь/и не найден/и"


class UserLoginException(DayRentException):
    detail = "Не удалось войти"
