from rest_framework import serializers
from .models import Mascota, Veterinaria, Turno

class MascotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascota
        fields = '__all__'

class VeterinariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veterinaria
        fields = '__all__'

class TurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = '__all__'