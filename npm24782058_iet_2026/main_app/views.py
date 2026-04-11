from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
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

# UPDATE
class ReportUpdateView(UpdateView):
    model = Report
    fields = ['title', 'description']
    template_name = 'form.html'
    success_url = reverse_lazy('home')
    pk_url_kwarg = 'pk'

# DELETE
class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'delete_report.html'
    success_url = reverse_lazy('home')

# STATUS (WORKFLOW)
class ReportUpdateStatusView(View):
    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')
        report.status = new_status
        report.save()
        return redirect('home')