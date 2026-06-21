from rest_framework import serializers
from .models import Report

class ReportSerializer(
    serializers.ModelSerializer
):

    reporter = serializers.SerializerMethodField(
        read_only=True
    )

    is_owner = serializers.SerializerMethodField(
        read_only=True
    )

    class Meta:

        model = Report

        fields = [

            'id',
            'title',
            'category',
            'description',
            'location',
            'status',
            'reporter',
            'created_at',
            'updated_at',
            'is_owner'

        ]

        read_only_fields = [

            'reporter',
            'created_at',
            'updated_at',
            'is_owner'

        ]


    def get_reporter(
        self,
        obj
    ):

        request = self.context.get(
            'request'
        )

        # Sesuai instruksi untuk menyamarkan identitas pada feed publik
        if request:

            tab = request.query_params.get(
                'tab'
            )

            if tab == 'feed':

                return "Warga Anonim"

        return obj.reporter.username


    def get_is_owner(
        self,
        obj
    ):

        request = self.context.get(
            'request'
        )

        # Memeriksa apakah request ada dan user sudah login
        if (
            request and
            request.user and
            request.user.is_authenticated
        ):

            # Membandingkan reporter objek dengan user yang sedang login
            return (
                obj.reporter ==
                request.user
            )

        return False