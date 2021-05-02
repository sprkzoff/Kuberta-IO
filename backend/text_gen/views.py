from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status

from transformers import AutoTokenizer, AutoModelForMaskedLM

from .utils import TextGen
# Create your views here.

# init model
MODEL_NAME = 'airesearch/wangchanberta-base-att-spm-uncased'
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)

# Text gen instance 
text_gen = TextGen(model, tokenizer)

class  TextGenGet(APIView):

    def get(self, request, format=None):
        seed_text = '<s>' + self.request.GET.get('seed_text', '')
        n_samples = int(self.request.GET.get('n_samples', 1))
        max_len = int(self.request.GET.get('max_len', 3))
        print(seed_text,n_samples, max_len)
        try:
            res = text_gen.gen_sent(seed_text, n_samples=n_samples, max_len=max_len)
            print(res)
            return Response(res, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response('error', status=status.HTTP_500_INTERNAL_SERVER_ERROR)