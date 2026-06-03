from rest_framework import (
    permissions,
    viewsets,
    serializers,
    generics
)

from rest_framework.exceptions import (
    PermissionDenied
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
# REPORT
# =================================

class ReportViewSet(
    viewsets.ModelViewSet
):

    serializer_class = (
        ReportSerializer
    )


    def get_queryset(self):

        user = self.request.user


        if not user.is_authenticated:

            return Report.objects.none()


        # ADMIN hanya lihat non draft
        if user.is_staff:

            return Report.objects.exclude(
                status='DRAFT'
            )


        # citizen:
        # non draft + draft miliknya
        return (

            Report.objects.exclude(
                status='DRAFT'
            )

            |

            Report.objects.filter(
                reporter=user,
                status='DRAFT'
            )

        ).distinct()


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

            reporter=self.request.user

        )