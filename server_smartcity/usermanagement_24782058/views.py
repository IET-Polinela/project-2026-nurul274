from django.shortcuts import redirect, render
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView
from django.contrib.auth import logout
from django.db import IntegrityError
from .forms import RegisterForm


# =======================
# REGISTER
# =======================
def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)

        if form.is_valid():
            user = form.save(commit=False)

            user.is_admin = False
            user.is_member = True

            # HAPUS set_password (sudah otomatis dari UserCreationForm)

            try:
                user.save()
            except IntegrityError:
                messages.error(
                    request,
                    f'Username "{user.username}" sudah terdaftar. Silakan gunakan username lain.'
                )
                return render(request, 'register.html', {'form': form})

            messages.success(request, "Registrasi berhasil! Silakan login.")
            return redirect('login')

        else:
            messages.error(request, "Registrasi gagal! Periksa data.")

    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})


# =======================
# LOGIN
# =======================
class CustomLoginView(LoginView):
    template_name = 'login.html'

    def form_valid(self, form):
        messages.success(self.request, "Login berhasil!")
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Username atau password salah!")
        return super().form_invalid(form)

    
    def get_success_url(self):
        if self.request.user.is_admin:
            return reverse_lazy('home')  # admin ke daftar laporan
        else:
            return reverse_lazy('home')  # user ke tambah laporan


# =======================
# LOGOUT
# =======================
def CustomLogoutView(request):
    logout(request)
    messages.success(request, "Berhasil logout!")
    return redirect('login')