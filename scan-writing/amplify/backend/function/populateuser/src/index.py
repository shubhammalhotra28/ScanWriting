
import awsgi
from flask_cors import CORS
from flask import Flask, jsonify, request
from datetime import datetime
import argparse


import boto3
from boto3.dynamodb.conditions import Key, Attr



BASE_ROUTE = "/populateuser"

app = Flask(__name__)
CORS(app)



'''
    Given the email, poplate the user table
'''
# Method responsible for the post request
@app.route(BASE_ROUTE,methods=["POST"])
def postToDB():
	
    args = request.args
    user_email = str(args.get("user_email"))

    # get the id of the user seeing the email from ddb table
    client = boto3.resource('dynamodb')
    # get the user_id from user table 
    table = client.Table("user-dev")
    print(table.table_status)
    
    response = table.query(IndexName='email-global-secondary-index',KeyConditionExpression=Key('email').eq(user_email))

    if len(response['Items']) != 0:
        print("entity already exist")
        return "ALREADY EXIST"
    

    # store email in dynamodb
    table.put_item(Item={'email': user_email,'id': int(hash(user_email))})
    print("Added")
    return "ADDED"


def handler(event,context):
    
    return awsgi.response(app,event,context)
