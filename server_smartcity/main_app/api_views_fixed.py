from rest_framework import (
    permissions,
    viewsets,
    serializers,
    generics,
    status as http_status
)

from rest_framework.decorators import action
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

    username = serializers.CharField()

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )


class RegisterView(
    generics.CreateAPIView
):

    serializer_class = (
        RegisterSerializer
    )

    def perform_create(
        self,
        serializer
    ):

        User.objects.create_user(

            username=serializer.validated_data[
                'username'
            ],

            email=serializer.validated_data[
                'email'
            ],

            password=serializer.validated_data[
                'password'
            ]

        )


# =================================
# PROFILE
# =================================

class UserProfileSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = User

        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name'
        ]

        read_only_fields = [
            'id',
            'username'
        ]


class ProfileView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = (
        UserProfileSerializer
    )

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_object(self):

        return self.request.user


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

        if not self.request.user.is_authenticated:

            return Report.objects.none()

        # Ambil parameter tab dari URL
        tab = self.request.query_params.get(
            'tab',
            None
        )

        # Base Query: Semua laporan diurutkan dari yang terbaru
        queryset = Report.objects.all().order_by(
            '-updated_at'
        )

        # Filtering berdasarkan tab
        if tab == 'my_reports':

            # Hanya laporan milik user yang login
            return queryset.filter(
                reporter=self.request.user
            )

        elif tab == 'feed':

            # Laporan publik selain DRAFT
            return queryset.exclude(
                status='DRAFT'
            ).exclude(
                reporter=self.request.user
            )

    def get_permissions(self):

        # wajib login
        if not self.request.user.is_authenticated:

            return [
                permissions.IsAuthenticated()
            ]

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

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[
            permissions.IsAuthenticated
        ]
    )
    def update_status(
        self,
        request,
        pk=None
    ):

        report = self.get_object()

        new_status = request.data.get(
            'status'
        )

        if not new_status:

            return Response(
                {
                    'error': 'Status field required'
                },
                status=http_status.HTTP_400_BAD_REQUEST
            )

        # USER BIASA HANYA BOLEH KIRIM DRAFT
        if not request.user.is_staff:

            if (
                report.reporter == request.user and
                report.status == 'DRAFT' and
                new_status == 'REPORTED'
            ):

                report.status = 'REPORTED'
                report.save()

                serializer = self.get_serializer(
                    report
                )

                return Response(
                    serializer.data,
                    status=http_status.HTTP_200_OK
                )

            return Response(
                {
                    'error': 'Akses ditolak'
                },
                status=http_status.HTTP_403_FORBIDDEN
            )

        # KHUSUS ADMIN
        valid_transitions = {
            'REPORTED': 'VERIFIED',
            'VERIFIED': 'IN_PROGRESS',
            'IN_PROGRESS': 'RESOLVED'
        }

        if (
            report.status in valid_transitions and
            valid_transitions[report.status] == new_status
        ):

            report.status = new_status
            report.save()

            serializer = self.get_serializer(
                report
            )

            return Response(
                serializer.data,
                status=http_status.HTTP_200_OK
            )

        return Response(
            {
                'error': 'Status transition tidak valid'
            },
            status=http_status.HTTP_400_BAD_REQUEST
        )
