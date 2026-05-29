from django.db import models
from django.contrib.auth.models import User

# --- MODELO AGREGADO PARA EL REGISTRO ---
class Perfil(models.Model):
    # Vinculamos el perfil 1 a 1 con el usuario nativo de Django
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.email}"
    
class Mascota(models.Model):
    nombre = models.CharField(max_length=100)
    especie = models.CharField(max_length=100) 
    raza = models.CharField(max_length=100)
    edad = models.IntegerField()
    peso = models.FloatField()
    tipo_pelo = models.CharField(max_length=100)
    color_pelo = models.CharField(max_length=100)
    dueño = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mascotas')
    
    def __str__(self):
        return f"{self.nombre} ({self.especie})"

class Veterinaria(models.Model):
    nombre = models.CharField(max_length=200)
    direccion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre

class Turno(models.Model):
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='turnos')
    veterinaria = models.ForeignKey(Veterinaria, on_delete=models.CASCADE, related_name='turnos')
    fecha_hora = models.DateTimeField()
    motivo = models.CharField(max_length=255)
    
    class Meta:
        unique_together = ['veterinaria', 'fecha_hora']

    def __str__(self):
        return f"Turno: {self.mascota.nombre} en {self.veterinaria.nombre}"