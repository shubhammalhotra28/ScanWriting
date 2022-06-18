import awsgi
from flask_cors import CORS
from flask import Flask, jsonify, request
from datetime import datetime
import argparse
import boto3
import json
import time

BASE_ROUTE = "/comprehend"
app = Flask(__name__)
CORS(app)


@app.route(BASE_ROUTE,methods=["POST"])
def postToDB():
    # get the extracted texts and save it as string
    args = request.args
    extracted_texts = str(args.get("extractedTexts"))

    # comprehend client
    comprehend_client = boto3.client('comprehend')
    # need to make this sleep to be able to get the permission through IAM
    time.sleep(2)
    # detect_sentiment returns the sentiment with sentiment scores (e.g., mixed, positive, neutral, negative) in English
    comprehend_response = comprehend_client.detect_sentiment(Text=extracted_texts, LanguageCode='en')
    
    print(comprehend_response)
    return comprehend_response
    # or 


    # print(json.dumps(comprehend_client.detect_sentiment(Text = extractedTexts, LanguageCode = 'en')))


def handler(event,context):
    return awsgi.response(app,event,context)