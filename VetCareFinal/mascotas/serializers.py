from rest_framework import serializers
from .models import Mascota, Veterinaria, Turno

class MascotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascota
        fields = '__all__'
        read_only_fields = ('dueño',)

class VeterinariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veterinaria
        fields = '__all__'

class TurnoSerializer(serializers.ModelSerializer):
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)
    veterinaria_nombre = serializers.CharField(source='veterinaria.nombre', read_only=True)

    class Meta:
        model = Turno
        fields = ['id', 'mascota', 'mascota_nombre', 'veterinaria', 'veterinaria_nombre', 'fecha_hora', 'motivo']