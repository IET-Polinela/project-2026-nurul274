from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib import messages
from .models import Report


# LIST
class ReportListView(ListView):
    model = Report
    template_name = 'home.html'
    context_object_name = 'reports'


# DETAIL
class ReportDetailView(DetailView):
    model = Report
    template_name = 'detail_report.html'


# CREATE
class ReportCreateView(CreateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'add_report.html'
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil ditambahkan!")
        return super().form_valid(form)


# UPDATE
class ReportUpdateView(UpdateView):
    model = Report
    fields = ['title', 'category', 'description', 'location']
    template_name = 'edit_report.html'
    success_url = reverse_lazy('home')
    pk_url_kwarg = 'pk'

    def form_valid(self, form):
        messages.success(self.request, "Laporan berhasil diupdate!")
        return super().form_valid(form)


# DELETE
class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'delete_report.html'
    success_url = reverse_lazy('home')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, "Laporan berhasil dihapus!")
        return super().delete(request, *args, **kwargs)


# STATUS (WORKFLOW)
class ReportUpdateStatusView(View):
    def post(self, request, pk):
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