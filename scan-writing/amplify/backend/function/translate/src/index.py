
import awsgi
from flask_cors import CORS
from flask import Flask, jsonify, request
from datetime import datetime
import argparse


import boto3

BASE_ROUTE = "/translate"

app = Flask(__name__)
CORS(app)

# """
#     Function responsible to get images for the given 
#     user email
#     TODO: 
# """
# @app.route(BASE_ROUTE,methods=["GET"])
# def getImages():



'''
    Given text and target language, return the response with translated texts

'''
# Method responsible for the post request
@app.route(BASE_ROUTE,methods=["POST"])
def postToDB():
	
    args = request.args
    # print('args = ',args.get("texts"))
    texts = str(args.get("texts"))
    target_language = str(args.get("language"))
    # texts = "안녕하세요"
	
    translate_client = boto3.client('translate')
	# review_text = event['text']
	
    review_text = texts
	
    translate_response = translate_client.translate_text(Text=review_text,SourceLanguageCode='auto',TargetLanguageCode=target_language)
   	
    print(translate_response)
    return translate_response['TranslatedText']



def handler(event,context):
    
    return awsgi.response(app,event,context)
