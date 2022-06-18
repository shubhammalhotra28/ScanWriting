
import awsgi
from flask_cors import CORS
from flask import Flask, jsonify, request
from datetime import datetime
import argparse


import boto3
from boto3.dynamodb.conditions import Key, Attr


BASE_ROUTE = "/images"

app = Flask(__name__)
CORS(app)

"""
    Function responsible to get images for the given 
    user email
"""
@app.route(BASE_ROUTE,methods=["GET"])
def getImages():

    args = request.args
    user_email = str(args.get("user_email"))

    # get the id of the user seeing the email from ddb table
    client = boto3.resource('dynamodb')
    # get the user_id from user table 
    table = client.Table("user-dev")
    print(table.table_status)
    
    response = table.query(IndexName='email-global-secondary-index',KeyConditionExpression=Key('email').eq(user_email))

    user_id = int(response['Items'][0].get("id")) # needs to be tested this thing

    # now, query the images table based on the user_id and return response
    table = client.Table("notesImages-dev")
    print(table.table_status)

    if args is not None:
        response = table.query(
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
        return response
    else:
        return "ERROR"



'''
    In this the method is responsible to post the title and the url 
    for a given specific user_id (fk)
    Table consist of user_id title s3 url (image), col representing textract
'''
# Method responsible for the post request
@app.route(BASE_ROUTE,methods=["POST"])
def postToDB():
    
    bucketName = "s3-to-store-images190517-dev"

    body = request.data.decode('UTF-8')
    args = request.args
    title = args.get("title")
    user_email = str(args.get('user_email'))
    fileName = body
    # storing the file / image to s3


    s3 = boto3.resource('s3')
    # s3 = boto3.resource('s3').Bucket(bucketName)
    # refer this link below for uploading
    # https://stackoverflow.com/questions/53146615/getting-file-url-after-upload-amazon-s3-python-boto3

    s3.Bucket(bucketName).upload_file(str(fileName), title+'.png')
    s3 = boto3.client('s3')
    # once stored: form the url and store the url in ddb
    # Generate the URL to get 'key-name' from 'bucket-name'
    try:
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': bucketName,
                'Key': fileName
            }
        )

    except ClientError as e:
        print(e)

    # make db client and store it 
    client = boto3.resource('dynamodb')
    # get the user_id from user table 
    table = client.Table("user-dev")

    response = table.query(IndexName='email-global-secondary-index',KeyConditionExpression=Key('email').eq(user_email))
    user_id = int(response['Items'][0].get("id")) # needs to be tested this thing
    table = client.Table("notesImages-dev")
    print(table.table_status)

    if args is not None:
        table.put_item(Item= {'title': title,'user_id': user_id ,'s3_url': url})
        return {"status":200}
    else:
        return {"status":500}



def handler(event,context):
    
    return awsgi.response(app,event,context)