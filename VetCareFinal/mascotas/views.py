from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes # <-- AGREGÁ ESTA LÍNEA
from rest_framework.permissions import AllowAny
from .models import Mascota, Veterinaria, Turno
from .serializers import MascotaSerializer, VeterinariaSerializer, TurnoSerializer

class MascotaViewSet(viewsets.ModelViewSet):
    queryset = Mascota.objects.all()
    serializer_class = MascotaSerializer

class VeterinariaViewSet(viewsets.ModelViewSet):
    queryset = Veterinaria.objects.all()
    serializer_class = VeterinariaSerializer

class TurnoViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer

# --- VISTA PARA REGISTRAR USUARIOS DESDE EL FRONTEND ---

@api_view(['POST'])
@permission_classes([AllowAny])  # Permite que usuarios no logueados accedan a registrarse
def registrar_usuario(request):
    data = request.data
    
    # Extraemos las variables que configuramos en el formulario de React
    fullname = data.get('fullName')
    email = data.get('email')
    telefono = data.get('phone')
    password = data.get('password')
    
    # Validaciones rápidas de seguridad en el servidor
    if not email or not password or not fullname:
        return Response({'message': 'Faltan campos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(email=email).exists():
        return Response({'message': 'Este correo electrónico ya está registrado.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        # 1. Creamos el usuario base de Django (usamos el mail como username obligatorio)
        user = User.objects.create(
            username=email,
            email=email,
            first_name=fullname
        )
        
        # 2. Encriptamos la contraseña de forma segura (Hasheo automático)
        user.set_password(password)
        user.save()
        
        # 3. Guardamos el teléfono en el Perfil asociado que agregamos en el models.py
        Perfil.objects.create(user=user, telefono=telefono)
        
        return Response({'message': 'Usuario registrado con éxito.'}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'message': f'Error al registrar el usuario: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)