from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MascotaViewSet, VeterinariaViewSet, TurnoViewSet, registrar_usuario # <-- 1. IMPORTAMOS LA FUNCIÓN

router = DefaultRouter()
router.register(r'mascotas', MascotaViewSet)
router.register(r'veterinarias', VeterinariaViewSet)
router.register(r'turnos', TurnoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', registrar_usuario, name='registrar_usuario'), # <-- 2. AGREGAMOS LA RUTA DE REGISTRO
]