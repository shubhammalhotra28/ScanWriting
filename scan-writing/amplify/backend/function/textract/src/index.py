import awsgi
from flask_cors import CORS
from flask import Flask, jsonify, request
from boto3.dynamodb.conditions import Key
from datetime import datetime
import argparse
import boto3

# Amazon clients
textract = boto3.client('textract', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# S3 bucket where images are stored
# TODO: need to update every time new storage / project is created
bucket = "s3-to-store-images190517-dev"

BASE_ROUTE = "/textract"

app = Flask(__name__)
CORS(app)


# Method responsible for the post request
@app.route(BASE_ROUTE, methods=["POST"])
def postToDB():
    args = request.args
    title = str(args.get("title"))
    image = str(args.get("image"))
    email = str(args.get("email"))

    print('title = ',title)
    print('image = ',image)
    print('email = ',email)


    key = 'public/' + image
    url = f'https://{bucket}.s3.amazonaws.com/{key}'


    if url is None:
        return {"status": 500}

    # get the text from the image

    textract_response = textract.detect_document_text(
        Document={
            'S3Object': {
                'Bucket': bucket,
                'Name': 'public/' + image
            }
        })

    detectedText = ''

    # Print detected text
    for item in textract_response['Blocks']:
        if item['BlockType'] == 'LINE':
            detectedText += item['Text'] + '\n'

    if detectedText == '':
        return {"status": 500}

    print('detected text = ',detectedText)
    # Get user_id from email
    table = dynamodb.Table("user-dev")
    ddb_response = table.query(IndexName='email-global-secondary-index',
                               KeyConditionExpression=Key('email').eq(email))
    if ddb_response['Count'] == 0:
        return {"status": 500}
    user_id = ddb_response['Items'][0].get("id")

    table = dynamodb.Table("notesImages-dev")
    print('hello world!')
    # store image in dynamodb
    table.put_item(Item=
                   {'title': title,
                    'user_id': int(user_id),
                    'notes_translation': detectedText,
                    's3_url': url.split('?')[0]
                    })



    return jsonify(
        title = str(title),
        user_id = int(user_id), 
        text = str(detectedText),
        s3_url = url.split("?")[0]
    )

def handler(event, context):
    return awsgi.response(app, event, context)
