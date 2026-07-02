from rest_framework import (
    permissions,
    viewsets,
    serializers,
    generics,
    status
)

from rest_framework.response import Response

from rest_framework.exceptions import (
    PermissionDenied
)

from rest_framework.pagination import (
    PageNumberPagination
)

from django.contrib.auth import (
    get_user_model
)

User = get_user_model()

from .models import Report
from .serializers import ReportSerializer
from .permissions import (
    IsOwnerAndDraftOrReadOnly
)


class ReportPagination(
    PageNumberPagination
):

    page_size = 10

    page_size_query_param = (
        'page_size'
    )

    max_page_size = 100


# =================================
# REGISTER
# =================================

class RegisterSerializer(
    serializers.Serializer
):

    username = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    def validate_username(self, value):

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                "Username sudah digunakan."
            )

        return value

    def validate_email(self, value):

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "Email sudah digunakan."
            )

        return value


class RegisterView(
    generics.CreateAPIView
):

    serializer_class = (
        RegisterSerializer
    )

    permission_classes = [
        permissions.AllowAny
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        User.objects.create_user(

            username=serializer.validated_data[
                "username"
            ],

            email=serializer.validated_data[
                "email"
            ],

            password=serializer.validated_data[
                "password"
            ]

        )

        return Response(
            {
                "message": "Registrasi berhasil"
            },
            status=status.HTTP_201_CREATED
        )


# =================================
# REPORT
# =================================

class ReportViewSet(
    viewsets.ModelViewSet
):

    serializer_class = (
        ReportSerializer
    )

    pagination_class = (
        ReportPagination
    )

    def get_queryset(self):

        # Base Query: Semua laporan diurutkan dari yang terbaru
        queryset = Report.objects.all().order_by(
            "-updated_at"
        )

        # Ambil parameter tab dari URL
        tab = self.request.query_params.get(
            "tab"
        )

        # =================================
        # FEED PUBLIK
        # =================================
        if tab == "feed":

            # Guest
            if not self.request.user.is_authenticated:

                return queryset.exclude(
                    status="DRAFT"
                )

            # User Login
            return queryset.exclude(
                status="DRAFT"
            ).exclude(
                reporter=self.request.user
            )

        # =================================
        # Selain Feed wajib login
        # =================================
        if not self.request.user.is_authenticated:

            return Report.objects.none()

        # =================================
        # Detail / Edit / Delete
        # =================================
        if self.action in [

            "retrieve",
            "update",
            "partial_update",
            "destroy"

        ]:

            return queryset.filter(
                reporter=self.request.user
            )

        # =================================
        # Laporan Saya
        # =================================
        if tab == "my_reports":

            return queryset.filter(
                reporter=self.request.user
            )

        # =================================
        # Default
        # =================================
        return queryset.filter(
            reporter=self.request.user
        )

    def get_permissions(self):

        if self.action == "list":

            tab = self.request.query_params.get("tab")

            if tab == "feed":
                return [permissions.AllowAny()]

        if not self.request.user.is_authenticated:
            return [permissions.IsAuthenticated()]

        # ADMIN DILARANG CREATE
        if (

            self.action == 'create'

            and

            self.request.user.is_staff

        ):

            raise PermissionDenied(
                'Admin tidak boleh membuat laporan'
            )

        # ADMIN DILARANG UPDATE
        if (

            self.action in [

                'update',
                'partial_update'

            ]

            and

            self.request.user.is_staff

        ):

            raise PermissionDenied(
                'Admin tidak boleh edit laporan'
            )

        # ADMIN DILARANG DELETE
        if (

            self.action == 'destroy'

            and

            self.request.user.is_staff

        ):

            raise PermissionDenied(
                'Admin tidak boleh hapus laporan'
            )

        if self.action in [

            'update',
            'partial_update',
            'destroy'

        ]:

            return [

                permissions.IsAuthenticated(),

                IsOwnerAndDraftOrReadOnly()

            ]

        return [

            permissions.IsAuthenticated()

        ]

    def perform_create(
        self,
        serializer
    ):

        serializer.save(

            reporter=self.request.user,

            status=self.request.data.get(
                'status',
                'DRAFT'
            )

        )
