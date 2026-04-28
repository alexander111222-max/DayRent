
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

class MultipleObjectsFoundException(DayRentException):
    detail = "Слишком много обьектов для удаления/обновления"


class ItemNotFoundException(DayRentException):
    detail = "Отсутствует вещь для удаления"

class MultipleItemFoundException(DayRentException):
    detail = "Слишком много вещей для удаления/обновления"


class UserLocationNotReadyException(DayRentException):
    detail = "Локация пользователя ещё не готова"



# геокодер яндекс


class YandexGeocoderAddressNotFoundException(DayRentException):
    detail = "Адрес не найден"

class YandexGeocoderUnavailableException(DayRentException):
    detail = "Яндекс геокодер недоступен"
