from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from mascotas.models import Perfil, Mascota, Veterinaria

VETERINARIAS = [
    {"nombre": "Veterinaria Palermo", "direccion": "Av. Santa Fe 3950, Palermo", "telefono": "011-4821-3950"},
    {"nombre": "Clínica Veterinaria Belgrano", "direccion": "Av. Libertador 5200, Belgrano", "telefono": "011-4789-5200"},
    {"nombre": "Vet Care Recoleta", "direccion": "Av. Las Heras 2102, Recoleta", "telefono": "011-4806-2102"},
    {"nombre": "Veterinaria Animals", "direccion": "Av. Corrientes 3200, Balvanera", "telefono": "011-4862-3200"},
    {"nombre": "Clínica Pet Wellness", "direccion": "Av. Palermo 1500, Palermo", "telefono": "011-4777-1500"},
    {"nombre": "Vet Express Caballito", "direccion": "Av. Rivadavia 4500, Caballito", "telefono": "011-4901-4500"},
    {"nombre": "Centro Veterinario Núñez", "direccion": "Av. Monroe 2800, Núñez", "telefono": "011-4703-2800"},
    {"nombre": "Pet Care Villa Urquiza", "direccion": "Av. Gral. Paz 5800, Villa Urquiza", "telefono": "011-4523-5800"},
]


class Command(BaseCommand):
    help = "Siembra datos de prueba: veterinarias, usuario demo y mascota"

    def handle(self, *args, **options):
        for v in VETERINARIAS:
            Veterinaria.objects.get_or_create(nombre=v["nombre"], defaults=v)
        self.stdout.write(self.style.SUCCESS(f"Se crearon {len(VETERINARIAS)} veterinarias"))

        if not User.objects.filter(username="macarena@test.com").exists():
            user = User.objects.create_user(
                username="macarena@test.com",
                email="macarena@test.com",
                password="123456",
                first_name="Macarena",
            )
            Perfil.objects.get_or_create(user=user, telefono="011-5555-1234")
            Mascota.objects.get_or_create(
                nombre="Galia",
                especie="Perro",
                raza="Caniche",
                edad=3,
                peso=5.5,
                tipo_pelo="Rizado",
                color_pelo="Blanco",
                dueño=user,
            )
            self.stdout.write(self.style.SUCCESS("Usuario Macarena y mascota Galia creados"))
        else:
            self.stdout.write("El usuario Macarena ya existe, se omite")
