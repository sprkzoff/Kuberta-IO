from django.urls import path

from .views import TextGenGet

urlpatterns = [
    path(
        'textgen',
        TextGenGet.as_view(),
        name='text_gen'
    ),
]