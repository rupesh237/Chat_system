from django.shortcuts import render

from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required

# Create your views here.

def index(request):
    return render(request, 'index.html')


@login_required
def chat(request):
    return render(request, 'chat.html')