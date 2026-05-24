from django.urls import path
from .views import (
    debate_list, debate_detail,
    debate_by_code, debate_arguments,
    argument_list, argument_detail,
    vote_list,
)

urlpatterns = [
    path("debates/", debate_list, name="debate-list"),
    path("debates/<int:pk>/", debate_detail, name="debate-detail"),
    path("debates/join/<str:code>/", debate_by_code, name="debate-by-code"),  # JOIN by code
    path("debates/<int:pk>/arguments/", debate_arguments, name="debate-arguments"),  # args by debate
    path("arguments/", argument_list, name="argument-list"),
    path("arguments/<int:pk>/", argument_detail, name="argument-detail"),
    path("votes/", vote_list, name="vote-list"),
]