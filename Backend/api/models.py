from django.db import models


class Debate(models.Model):

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"

    code = models.CharField(max_length=10, unique=True)
    topic = models.CharField(max_length=500)

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.OPEN
    )

    is_private = models.BooleanField(default=False)  # 👈 new

    created_at = models.DateTimeField(auto_now_add=True)


class Argument(models.Model):

    class Side(models.TextChoices):
        PRO = "pro", "Pro"
        CON = "con", "Con"

    debate = models.ForeignKey(
        Debate,
        on_delete=models.CASCADE,
        related_name="arguments"
    )

    side = models.CharField(max_length=10, choices=Side.choices)
    text = models.TextField()

    author = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)


class Vote(models.Model):

    class Value(models.IntegerChoices):
        DOWNVOTE = -1, "Downvote"
        NEUTRAL = 0, "Neutral"
        UPVOTE = 1, "Upvote"

    argument = models.ForeignKey(
        Argument,
        on_delete=models.CASCADE,
        related_name="votes"
    )

    value = models.IntegerField(choices=Value.choices, default=0)

    created_at = models.DateTimeField(auto_now_add=True)