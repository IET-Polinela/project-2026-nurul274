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

    is_admin = serializers.SerializerMethodField(
        read_only=True
    )
    
    report_time = serializers.SerializerMethodField(
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
            'report_time',
            'created_at',
            'updated_at',
            'is_owner',
            'is_admin'
            

        ]

        read_only_fields = [

            'reporter',
            'created_at',
            'updated_at',
            'is_owner',
            'is_admin',
            'report_time'

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
            return obj.reporter == request.user
        
        return False


    def get_is_admin(
        self,
        obj
    ):
        request = self.context.get(
            'request'
        )
        
        # Memeriksa apakah user adalah admin/staff
        if (
            request and
            request.user and
            request.user.is_authenticated
        ):

            return (
                request.user.is_staff or
                request.user.is_superuser
            )
        
        return False


    def get_report_time(
        self,
        obj
    ):
        # Return created_at dalam format ISO
        return obj.created_at.isoformat()