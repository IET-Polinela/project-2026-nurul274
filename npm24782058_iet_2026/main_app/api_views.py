from rest_framework import (
    permissions,
    viewsets,
    serializers,
    generics
)

from django.contrib.auth import (
    get_user_model
)

from rest_framework.exceptions import (
    PermissionDenied
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


        # admin hanya lihat non draft
        if user.is_staff:

            return Report.objects.exclude(
                status='DRAFT'
            )


        # citizen:
        # non draft + draft milik sendiri
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

        # semua endpoint wajib login
        if not (
            self.request.user
            and
            self.request.user.is_authenticated
        ):

            return [
                permissions.IsAuthenticated()
            ]


        # list detail
        if self.action in [

            'list',

            'retrieve'

        ]:

            return [
                permissions.IsAuthenticated()
            ]


        # create hanya citizen
        if self.action == 'create':

            if self.request.user.is_staff:

                raise PermissionDenied(
                    'Admin tidak boleh membuat laporan'
                )

            return [
                permissions.IsAuthenticated()
            ]


        # update delete
        if self.action in [

            'update',

            'partial_update',

            'destroy'

        ]:

            # admin tidak boleh edit delete
            if self.request.user.is_staff:

                raise PermissionDenied(
                    'Admin tidak boleh edit atau hapus laporan'
                )

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