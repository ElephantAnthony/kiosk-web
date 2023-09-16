from django.urls import path

from .views import brand_list_view, menu_list_view, menu_detail_view, basket_detail_view, basket_add_view

app_name = "sample"

urlpatterns = [
    path('brands/', brand_list_view, name='brand_list'),
    path('brands/<int:brand_id>/', menu_list_view, name='menu_list'),
    path('menu/<int:menu_id>/', menu_detail_view, name='menu_detail'),
    path('basket/<int:basket_id>/', basket_detail_view, name='basket_detail'),
    path('basket/add/', basket_add_view, name='basket_add'),
]
