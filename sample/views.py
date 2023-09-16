from django.shortcuts import render, redirect

from .models import Brand, Menu, Basket


def brand_list_view(request):
    brand_objects_all = Brand.objects.all()
    context = {
        'brand_list': brand_objects_all,
    }
    return render(request, 'sample/brand_list.html', context)


def menu_list_view(request, brand_id):
    brand_menu_list = Menu.objects.filter(brand_id=brand_id)
    print(brand_menu_list)
    context = {
        'menu_list': brand_menu_list,
    }

    return render(request, 'sample/menu_list.html', context)


def menu_detail_view(request, menu_id):
    menu = Menu.objects.get(id=menu_id)
    context = {
        'menu': menu,
    }

    return render(request, 'sample/menu_detail.html', context)


def basket_detail_view(request, basket_id):
    basket = Basket.objects.get(id=basket_id)
    context = {
        'basket': basket,
    }
    return render(request, 'sample/basket_detail.html', context)


def basket_add_view(request):
    menu_id = request.POST.get('menu_id')
    menu = Menu.objects.get(id=menu_id)

    # 브랜드, 사용자, 장바구니 상태(결제 전)
    basket, created = Basket.objects.get_or_create(
        brand=menu.brand,
        user=request.user,
        status='0',
    )

    # Todo 메뉴/장바구니 모델 생성 후 변경 필요
    basket.menu.add(menu)
    return redirect('sample:basket_detail', basket.id)
