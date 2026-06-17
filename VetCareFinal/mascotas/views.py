from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.sessions.models import Session
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.conf import settings
from .models import Mascota, Veterinaria, Turno, Perfil
from .serializers import MascotaSerializer, VeterinariaSerializer, TurnoSerializer
from datetime import datetime
from rest_framework.exceptions import ValidationError

class MascotaViewSet(viewsets.ModelViewSet):
    """ViewSet que limita las mascotas al usuario autenticado."""
    queryset = Mascota.objects.none()
    serializer_class = MascotaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        if user and user.is_authenticated:
            return Mascota.objects.filter(dueño=user)
        return Mascota.objects.none()

    def perform_create(self, serializer):
        serializer.save(dueño=self.request.user)

class VeterinariaViewSet(viewsets.ModelViewSet):
    queryset = Veterinaria.objects.all()
    serializer_class = VeterinariaSerializer


# 🚀 TU LÓGICA DE SEGURIDAD INTEGRADA EN EL VIEWSET OFICIAL
class TurnoViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Validaciones de negocio de Brenda antes de guardar en PostgreSQL."""
        user = self.request.user
        data = self.request.data

        mascota_id = data.get('mascota_id') or data.get('mascota')
        veterinaria_id = data.get('veterinaria_id') or data.get('veterinaria')
        
        # Aceptar tanto fecha_hora (ISO string) como fecha + hora separados
        fecha_hora_str = data.get('fecha_hora')
        fecha_str = data.get('fecha')
        hora_str = data.get('hora')

        if not mascota_id or not veterinaria_id:
            raise ValidationError({'message': 'Faltan campos obligatorios para agendar el turno.'})

        if not fecha_hora_str and (not fecha_str or not hora_str):
            raise ValidationError({'message': 'Faltan campos obligatorios para agendar el turno.'})

        try:
            if fecha_hora_str:
                # Formato ISO: 2026-06-20T09:00:00
                fecha_hora_combinada = datetime.fromisoformat(fecha_hora_str.replace('Z', '+00:00'))
            else:
                # Formato separado: YYYY-MM-DD HH:MM
                fecha_hora_combinada = datetime.strptime(f"{fecha_str} {hora_str}", "%Y-%m-%d %H:%M")
        except (ValueError, AttributeError):
            raise ValidationError({'message': 'Formato de fecha u hora inválido. Use YYYY-MM-DD y HH:MM o ISO format.'})

        try:
            mascota = Mascota.objects.get(pk=mascota_id, dueño=user)
        except Mascota.DoesNotExist:
            raise ValidationError({'message': 'Mascota no encontrada o no está asociada a tu cuenta.'})

        try:
            veterinaria = Veterinaria.objects.get(pk=veterinaria_id)
        except Veterinaria.DoesNotExist:
            raise ValidationError({'message': 'La veterinaria seleccionada no existe.'})

        if Turno.objects.filter(veterinaria=veterinaria, fecha_hora=fecha_hora_combinada).exists():
            raise ValidationError({'message': 'Este horario ya se encuentra reservado en esa veterinaria.'})

        serializer.save(mascota=mascota, veterinaria=veterinaria, fecha_hora=fecha_hora_combinada)


# --- VISTAS DE USUARIO Y LOGIN ---

@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_usuario(request):
    data = request.data
    fullname = data.get('fullName')
    email = data.get('email')
    telefono = data.get('phone')
    password = data.get('password')
    
    if not email or not password or not fullname:
        return Response({'message': 'Faltan campos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(email=email).exists():
        return Response({'message': 'Este correo electrónico ya está registrado.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        user = User.objects.create(username=email, email=email, first_name=fullname)
        user.set_password(password)
        user.save()
        Perfil.objects.create(user=user, telefono=telefono)
        return Response({'message': 'Usuario registrado con éxito.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': f'Error al registrar el usuario: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
@ensure_csrf_cookie
def csrf_token(request):
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login_usuario(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response({'message': 'Email y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response({'message': 'Email o contraseña incorrectos.'}, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    return Response({
        'message': 'Inicio de sesión correcto.',
        'first_name': user.first_name,
        'email': user.email,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_usuario(request):
    try:
        logout(request)
    except Exception:
        pass

    response = JsonResponse({'message': 'Sesión cerrada correctamente.'}, status=200)
    cookie_name = settings.SESSION_COOKIE_NAME
    cookie_path = getattr(settings, 'SESSION_COOKIE_PATH', '/') or '/'
    try:
        response.delete_cookie(cookie_name, path=cookie_path)
    except Exception:
        pass
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    try:
        perfil = Perfil.objects.filter(user=user).first()
        telefono = perfil.telefono if perfil else ''
    except Exception:
        telefono = ''

    data = {
        'first_name': user.first_name,
        'email': user.email,
        'phone': telefono,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def modificar_perfil(request):
    user = request.user
    data = request.data
    fullname = data.get('fullName')
    email = data.get('email')
    telefono = data.get('phone')

    try:
        if fullname:
            user.first_name = fullname
        if email:
            if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                return Response({'message': 'Este correo electrónico ya está en uso por otro usuario.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            user.username = email
        user.save()

        perfil, created = Perfil.objects.get_or_create(user=user)
        if telefono is not None:
            perfil.telefono = telefono
            perfil.save()

        return Response({'message': 'Perfil actualizado correctamente.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f'Error al actualizar el perfil: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)