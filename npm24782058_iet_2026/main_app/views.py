from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Report


# LIST (ADMIN vs USER)
class ReportListView(ListView):
    model = Report
    template_name = 'home.html'
    context_object_name = 'reports'

    def get_queryset(self):
        # admin lihat semua
        if self.request.user.is_authenticated and self.request.user.is_admin:
            return Report.objects.all()
        
        # user biasa lihat miliknya saja
        if self.request.user.is_authenticated:
            return Report.objects.filter(user=self.request.user)
        
        return Report.objects.none()


# DETAIL (SEMUA USER LOGIN)
class ReportDetailView(LoginRequiredMixin, DetailView):
    model = Report
    template_name = 'detail_report.html'


# CREATE (CITIZEN)
class ReportCreateView(LoginRequiredMixin, CreateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'add_report.html'
    success_url = reverse_lazy('home')

    def dispatch(self, request, *args, **kwargs):
        # admin tidak boleh create
        if request.user.is_admin:
            messages.error(request, "Admin tidak boleh membuat laporan!")
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        form.instance.user = self.request.user
        messages.success(self.request, "Laporan berhasil ditambahkan!")
        return super().form_valid(form)


# UPDATE (CITIZEN ONLY - MILIK SENDIRI)
class ReportUpdateView(LoginRequiredMixin, UpdateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'edit_report.html'
    success_url = reverse_lazy('home')

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()

        # hanya pemilik laporan
        if obj.user != request.user:
            messages.error(request, "Anda tidak punya akses!")
            return redirect('home')

        # admin tidak boleh edit
        if request.user.is_admin:
            messages.error(request, "Admin tidak boleh edit laporan!")
            return redirect('home')

        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diupdate!")
        return super().form_valid(form)


# DELETE (ADMIN + PEMILIK)
class ReportDeleteView(LoginRequiredMixin, DeleteView):
    model = Report
    template_name = 'delete_report.html'
    success_url = reverse_lazy('home')

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()

        # boleh jika admin ATAU pemilik
        if not request.user.is_admin and obj.user != request.user:
            messages.error(request, "Tidak bisa hapus laporan orang lain!")
            return redirect('home')

        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, "Laporan berhasil dihapus!")
        return super().delete(request, *args, **kwargs)


# UPDATE STATUS (ADMIN ONLY)
class ReportUpdateStatusView(View):

    def post(self, request, pk):

        # belum login
        if not request.user.is_authenticated:
            messages.error(request, "Silakan login terlebih dahulu!")
            return redirect('login')

        # bukan admin
        if not request.user.is_admin:
            messages.error(request, "Akses ditolak! Hanya admin yang bisa verifikasi.")
            return redirect('home')

        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')

        valid_transitions = {
            'REPORTED': 'VERIFIED',
            'VERIFIED': 'IN_PROGRESS',
            'IN_PROGRESS': 'RESOLVED'
        }

        if report.status in valid_transitions and valid_transitions[report.status] == new_status:
            report.status = new_status
            report.save()
            messages.success(request, "Status berhasil diupdate!")
        else:
            messages.error(request, "Perubahan status tidak valid!")

        return redirect('home')