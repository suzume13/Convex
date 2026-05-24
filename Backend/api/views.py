from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Debate, Argument, Vote
from .serializer import DebateSerializer, ArgumentSerializer, VoteSerializer
import random
import string


def generate_code():
    """Generate a unique debate code like DBT-XY4Z9"""
    while True:
        letters = ''.join(random.choices(string.ascii_uppercase, k=3))
        digits = ''.join(random.choices(string.digits, k=4))
        code = f"DBT-{letters}{digits}"
        if not Debate.objects.filter(code=code).exists():
            return code


# ── DEBATES ──

@api_view(['GET', 'POST'])
def debate_list(request):
    if request.method == 'GET':
        debates = Debate.objects.all().order_by('-created_at')
        serializer = DebateSerializer(debates, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = DebateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(code=generate_code())
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def debate_detail(request, pk):
    debate = get_object_or_404(Debate, pk=pk)

    if request.method == 'GET':
        serializer = DebateSerializer(debate)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = DebateSerializer(
            debate, data=request.data,
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        debate.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def debate_by_code(request, code):
    """Join a debate by its code — used by the frontend Join flow"""
    debate = get_object_or_404(Debate, code=code.upper())
    serializer = DebateSerializer(debate)
    return Response(serializer.data)


@api_view(['GET'])
def debate_arguments(request, pk):
    """Get all arguments for a specific debate"""
    debate = get_object_or_404(Debate, pk=pk)
    arguments = debate.arguments.all().order_by('-created_at')
    serializer = ArgumentSerializer(arguments, many=True)
    return Response(serializer.data)


# ── ARGUMENTS ──

@api_view(['GET', 'POST'])
def argument_list(request):
    if request.method == 'GET':
        arguments = Argument.objects.all().order_by('-created_at')
        serializer = ArgumentSerializer(arguments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ArgumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def argument_detail(request, pk):
    argument = get_object_or_404(Argument, pk=pk)

    if request.method == 'GET':
        serializer = ArgumentSerializer(argument)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = ArgumentSerializer(
            argument, data=request.data,
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        argument.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── VOTES ──

@api_view(['GET', 'POST'])
def vote_list(request):
    if request.method == 'GET':
        votes = Vote.objects.all()
        serializer = VoteSerializer(votes, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = VoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)