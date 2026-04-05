from django.shortcuts import render, redirect, get_object_or_404
from .models import Report
from .forms import ReportForm

def home(request):
    return render(request, 'main_app/home.html')


# READ
def report_list(request):
    reports = Report.objects.all()
    return render(request, 'main_app/report_list.html', {'reports': reports})


# CREATE
def add_report(request):
    if request.method == 'POST':
        form = ReportForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('report_list')
    else:
        form = ReportForm()
    return render(request, 'main_app/add_report.html', {'form': form})


# DELETE
def delete_report(request, id):
    report = get_object_or_404(Report, id=id)
    report.delete()
    return redirect('report_list')


# UPDATE
def edit_report(request, id):
    report = get_object_or_404(Report, id=id)
    form = ReportForm(request.POST or None, instance=report)

    if form.is_valid():
        form.save()
        return redirect('report_list')

    return render(request, 'main_app/add_report.html', {'form': form})