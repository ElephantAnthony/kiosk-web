from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Brand(models.Model):
    name = models.CharField(max_length=50)

    # img

    def __str__(self):
        return self.name


class Menu(models.Model):
    name = models.CharField(max_length=50)
    price = models.IntegerField()
    group = models.CharField(max_length=50)
    # img

    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name='menu_brand',
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.name

# Todo  메뉴, 장바구나 모델 필요. 수량 필드 추가
# class BasketMenu(models.Model):
# pass

class Basket(models.Model):
    name = models.CharField(max_length=50)
    status = models.CharField(max_length=50)

    menu = models.ManyToManyField(
        Menu,
        related_name='basket_menu'
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name='basket_brand'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='basket_user'
    )

    def __str__(self):
        return self.name
