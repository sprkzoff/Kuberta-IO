from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status
from django.conf import settings

import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM
import os

from .utils import TextGen
# Create your views here.

# init model
MODEL_NAME = 'airesearch/wangchanberta-base-att-spm-uncased'
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)

BASE_DIR = settings.BASE_DIR

ft_model_path = os.path.join(BASE_DIR, 'text_gen/model/wc_io_w_ht.pth')

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
if torch.cuda.is_available() :
    print("Using CUDA!")
model.load_state_dict(torch.load(ft_model_path, map_location=device))

# Text gen instance
text_gen = TextGen(model, tokenizer)

class  TextGenGet(APIView):

    def get(self, request, format=None):
        seed_text = '<s>' + self.request.GET.get('seed_text', '')
        n_outputs = int(self.request.GET.get('n_outputs', 5))
        max_len = int(self.request.GET.get('max_len', 10))
        try:
            res = text_gen.gen_sent(seed_text, n_outputs=n_outputs, max_len=max_len)
            return Response(res, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response('Text gen error', status=status.HTTP_500_INTERNAL_SERVER_ERROR)