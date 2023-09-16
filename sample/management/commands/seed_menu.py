from django.core.management.base import BaseCommand

from ...models import Brand, Menu

set_dict = {
    '더블 치즈 버거 세트': ['double cheese set', 6700],
    '치즈 버거 세트': ['cheese burger set', 5500],
}

single_dict = {
    '더블 치즈 버거': ['DoubleCheese', 5100],
    '치즈 버거': ['Cheese', 2900]
}

brand_list = [
    '맥도날드',
    '메가커피'
]

menu_list = [
    ['맥도날드', '세트', '더블 치즈 버거 세트', 'double cheese set', 6700],
    ['맥도날드', '세트', '치즈 버거 세트', 'cheese burger set', 5500],
    ['맥도날드', '세트', '더블 치즈 버거', 'DoubleCheese', 5100],
    ['맥도날드', '세트', '치즈 버거', 'Cheese', 2900],
]


class Command(BaseCommand):
    model_name = f'{Brand}, {Menu}'
    help = f'이 명령은 {model_name}를 생성합니다.'

    def handle(self, *args, **options):

        for brand in brand_list:
            Brand.objects.update_or_create(
                name=brand,
                defaults={
                    'name': brand,
                }
            )

        for menu in menu_list:
            brand = Brand.objects.get(name=menu[0])
            Menu.objects.create(
                name=menu[2],
                price=menu[-1],
                group=menu[1],
                brand=brand,
            )

        self.stdout.write(self.style.SUCCESS(f'{self.model_name}가 생성되었습니다.'))
