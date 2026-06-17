from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MascotaViewSet, 
    VeterinariaViewSet, 
    TurnoViewSet, 
    registrar_usuario, 
    login_usuario, 
    logout_usuario, 
    current_user,
    modificar_perfil,
    csrf_token
)

router = DefaultRouter()
router.register(r'mascotas', MascotaViewSet)
router.register(r'veterinarias', VeterinariaViewSet)
router.register(r'turnos', TurnoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', registrar_usuario, name='registrar_usuario'),
    path('csrf/', csrf_token, name='csrf_token'),
    path('login/', login_usuario, name='login_usuario'),
    path('logout/', logout_usuario, name='logout_usuario'),
    path('me/', current_user, name='current_user'),
    path('perfil/modificar/', modificar_perfil, name='modificar_perfil'),
]