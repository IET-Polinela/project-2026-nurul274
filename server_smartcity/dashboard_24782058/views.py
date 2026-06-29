from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.db.models import Count
from main_app.models import Report


class DashboardView(TemplateView):
    template_name = 'dashboard/index.html'


# ==============================
# STATISTIK (UNTUK CHART)
# ==============================
def report_stats(request):
    status_data = (
        Report.objects.values('status')
        .annotate(total=Count('status'))
        .order_by('status')
    )

    category_data = (
        Report.objects.values('category')
        .annotate(total=Count('category'))
        .order_by('category')
    )

    return JsonResponse({
        'status': list(status_data),
        'category': list(category_data),
    })


# ==============================
# LATEST REPORTS
# ==============================
def latest_reports(request):
    reported = (
        Report.objects.filter(status='REPORTED')
        .order_by('-id')[:5]
    )

    resolved = (
        Report.objects.filter(status='RESOLVED')
        .order_by('-id')[:5]
    )

    data = {
        'reported': list(reported.values(
            'id', 'title', 'description', 'status'
        )),
        'resolved': list(resolved.values(
            'id', 'title', 'description', 'status'
        )),
    }

    return JsonResponse(data)


# ==============================
# LIVE SEARCH
# ==============================
def search_reports(request):
    query = request.GET.get('q', '').strip()

    if not query:
        return JsonResponse({'results': []})

    results = (
        Report.objects.filter(title__icontains=query)
        .values('id', 'title', 'status')[:10]
    )

    return JsonResponse({'results': list(results)})


# ==============================
# DETAIL MODAL 
# ==============================
def report_detail(request, id):
    try:
        report = Report.objects.get(id=id)

        data = {
            'id': report.id,
            'title': report.title,
            'description': report.description,
            'status': report.status,
            'category': report.category,
            'location': report.location,
        }

        return JsonResponse(data)

    except Report.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)