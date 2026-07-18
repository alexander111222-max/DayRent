
class DayRentException(Exception):
    detail = "Произошла непредвиденная ошибка"

    def __init__(self, *args, **kwargs):
        super().__init__(self.detail, *args, **kwargs)



class ObjectNotFoundException(DayRentException):
    detail = "Обьект/ы не найден/ы"

class UserNotFoundException(DayRentException):
    detail = "Пользователь/и не найден/и"

class CategoryNotFoundException(DayRentException):
    detail = "Категория не найдена"

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

class UserAuthError(DayRentException):
    detail = "Пользователь не авторизирован"

# геокодер яндекс


class YandexGeocoderAddressNotFoundException(DayRentException):
    detail = "Адрес не найден"

class YandexGeocoderUnavailableException(DayRentException):
    detail = "Яндекс геокодер недоступен"






class BookingsAlreadyTakenError(DayRentException):
    detail = "Вещь уже забронирована на данный период"



class BookingForbiddenException(DayRentException):
    detail = "Невозможно забронировать собственную вещь"



class ItemInBasketNotFoundException(DayRentException):
    detail = "Такой вещи нет в вашей корзине"





class ForbiddenException(DayRentException):
    detail = "Доступ запрещен"



class BookingNotFoundException(DayRentException):
    detail = "Бронирование не найдено"

class MultipleBookingsFoundException(DayRentException):
    detail = "Слишком много таких броней не найдено"

class BookingCancelAccessDeniedException(DayRentException):
    detail = "Вы не можете отменить не свою бронь"

class WrongPasswordException(DayRentException):
    detail = "Пароль неверный"


class UserAlreadyExistsException(DayRentException):
    detail = "Пользователь уже существует"

class ObjectAlreadyExistsException(DayRentException):
    detail = "Такой объект уже существует"

class NoResultFoundException(DayRentException):
    detail = "Результатов не найдено"


class TokenExpiredException(DayRentException):
    detail = "Токен истёк"


class InvalidTokenException(DayRentException):
    detail = "Невалидный токен"


