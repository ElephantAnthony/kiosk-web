from django.shortcuts import render

# Create your views here.
from django.views.generic import View, TemplateView
from introapp.models import Complete


class dataTemplateView(TemplateView):
    template_name = 'dataapp/main.html'

class megacoffeeView(TemplateView):
    template_name = 'dataapp/megacoffee.html'

    def get(self, request):
        completes = Complete.objects.all()
        accuracy_list = []
        totalTime_list = []
        for complete in completes:
            accuracy_list.append(int(complete.accuracy))
            totalTime_list.append(int(complete.totalTime))
        context = {'accuracy_list': accuracy_list, 'totalTime_list':totalTime_list}
        return render(request, 'dataapp/megacoffee.html', context)