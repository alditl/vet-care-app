from django.contrib import admin
from .models import Mascota, Veterinaria, Turno, Perfil

# Registramos los modelos para que aparezcan en el panel
admin.site.register(Perfil)
admin.site.register(Mascota)
admin.site.register(Veterinaria)
admin.site.register(Turno)