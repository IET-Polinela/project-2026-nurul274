import random
from django.core.management.base import BaseCommand
from faker import Faker
from django.contrib.auth import get_user_model
from main_app.models import Report

# Ambil custom user model
User = get_user_model()

# Faker Indonesia
fake = Faker('id_ID')


class Command(BaseCommand):
    help = 'Generate contextual fake reports'

    def add_arguments(self, parser):
        parser.add_argument('num_records', type=int, help='Jumlah data')

    def handle(self, *args, **kwargs):
        num_records = kwargs['num_records']

        users = list(User.objects.all())

        # Cegah error kalau user kosong
        if not users:
            self.stdout.write(self.style.ERROR('User belum ada! Buat dulu superuser.'))
            return

        context_data = {
            'Jalan Rusak': {
                'titles': [
                    'Lubang Besar di Tengah Jalan',
                    'Aspal Mengelupas Parah',
                    'Jalan Bergelombang Bahayakan Motor',
                    'Ambles di Dekat Drainase'
                ],
                'desc': 'Ditemukan kerusakan jalan yang cukup dalam. Mohon segera diperbaiki sebelum memakan korban jiwa atau merusak kendaraan warga.'
            },
            'Sampah': {
                'titles': [
                    'Tumpukan Sampah Liar',
                    'Bau Menyengat Sampah Menumpuk',
                    'TPS Melebihi Kapasitas',
                    'Sampah Menutup Saluran Air'
                ],
                'desc': 'Warga mengeluhkan penumpukan sampah yang belum diangkut selama lebih dari 3 hari.'
            },
            'Lampu Mati': {
                'titles': [
                    'Penerangan Jalan Umum Mati',
                    'Lampu Jalan Berkedip',
                    'Kabel Lampu Putus',
                    'Area Gelap Rawan Kriminalitas'
                ],
                'desc': 'Lampu jalan mati total dan membahayakan pengguna jalan.'
            },
            'Drainase': {
                'titles': [
                    'Saluran Air Mampet',
                    'Drainase Meluap Saat Hujan',
                    'Tutup Got Pecah',
                    'Penyumbatan Karena Sedimen'
                ],
                'desc': 'Saluran air tersumbat dan menyebabkan banjir.'
            },
            'Keamanan': {
                'titles': [
                    'Aksi Vandalisme',
                    'Pencurian Kabel',
                    'Kerumunan Mencurigakan',
                    'Gangguan Ketertiban'
                ],
                'desc': 'Diperlukan patroli tambahan karena aktivitas mencurigakan.'
            }
        }

        status_choices = ['REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']

        for _ in range(num_records):
            category = random.choice(list(context_data.keys()))

            title_template = random.choice(context_data[category]['titles'])
            description_base = context_data[category]['desc']

            Report.objects.create(
                user=random.choice(users),  # 🔥 INI FIX UTAMA
                title=f"{title_template} - {fake.street_name()}",
                category=category,
                description=f"{description_base} Lokasi detail: {fake.street_address()}",
                location=f"Kecamatan {fake.city()}, {fake.address()}",
                status=random.choice(status_choices),
            )

        self.stdout.write(self.style.SUCCESS(f'Berhasil membuat {num_records} laporan!'))