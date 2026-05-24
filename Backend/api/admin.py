from django.contrib import admin
import api.models as api_models

# Register your models here.
admin.site.register(api_models.Debate)
admin.site.register(api_models.Argument)
admin.site.register(api_models.Vote)