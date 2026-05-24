from rest_framework import serializers
from .models import Debate, Argument, Vote


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = "__all__"


class ArgumentSerializer(serializers.ModelSerializer):
    vote_score = serializers.SerializerMethodField()

    class Meta:
        model = Argument
        fields = ["id", "debate", "side", "text", "author", "created_at", "vote_score"]

    def get_vote_score(self, obj):
        return sum(v.value for v in obj.votes.all())


class DebateSerializer(serializers.ModelSerializer):
    code = serializers.CharField(read_only=True)
    argument_count = serializers.SerializerMethodField()

    class Meta:
        model = Debate
        fields = ["id", "code", "topic", "status", "is_private", "created_at", "argument_count"]

    def get_argument_count(self, obj):
        return obj.arguments.count()