# SCAN-WRITING
An online cloud system to help users digitize their written text notes.
 
## Prerequisites
- IAM role with permissions (Amplify full access, dynamo db access, s3 access)
- Use an ubuntu t2.2xlarge config EC2 instance
- Administrator access for the Repo, which will be used later for adding the hosting

## How to deploy it  (Follow the commands as mentioned below)
- ```sudo apt update```
- Install nodejs by running the following command:
  - ```sudo apt install nodejs```
  - ```node -v```
- Install npm by running the following command:
  - ```sudo apt install npm```
  - ```npm -v```
- Install git:
  - ```sudo apt install git```
  - ```git -v```
- Install unzip:
  - ```sudo apt install unzip```
- Install aws cli:
  - ```curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"```
  - ```unzip awscliv2.zip```
  - ```sudo ./aws/install```
- Install amplify
  - ```curl -sL https://aws-amplify.github.io/amplify-cli/install | bash && $SHELL```
- Check python3 version:
  - ```python3 --version```
  - Should be 3.8.x
- Install pipenv
  - ```sudo apt install pipenv```
- Clone the repo.
- Go to ```scanwriting/amplify/``` and delete the ```team-provider-info.json``` file.
- Go one level up in the directory tree.
- Do ```amplify init```
  - Enter your ```access key id``` and Secret ```access key``` when prompted, whcih should be created with IAM Role creation as a prereq (with policies as AWS Amplify full access). Once role is created you should have the csv file with the credentials, use that to set up the cli.
  - Add the ```google oAuth clientID``` and ```Client secret```.
- Do ```amplify push```  (This should deploy all the required resources)

### This will deploy all the backend environment for the project

## HOSTING THE FRONT END:
- Go to AWS console -> AWS Amplify
- Click on the newly created app, it should be called scan-writing
- Opening the app, click on hosting environment. 
- It would ask for connecting the repo, through, select GITHUB
- It will first authorize the aws with github, once successful, you should be able to connect the repo along with a specific branch (assuming you have the admin access for the repo)
- Select monorepo option and write (scan-writing). This is used to provide that this application will go on to root of scan-writing application, and build from that.
- Enable Full CI/CD
- DOCKER IMAGE TO BE USED: 

```
version: 1
applications:
  - backend:
      phases:
        preBuild:
            commands:
                - export BASE_PATH=$(pwd)
                - yum install -y gcc openssl-devel bzip2-devel libffi-devel python3.8-pip
                - cd /opt && wget https://www.python.org/ftp/python/3.8.2/Python-3.8.2.tgz
                - cd /opt && tar xzf Python-3.8.2.tgz 
                - cd /opt/Python-3.8.2 && ./configure --enable-optimizations
                - cd /opt/Python-3.8.2 && make altinstall
                - pip3.8 install --user pipenv
                - ln -fs /usr/local/bin/python3.8 /usr/bin/python3
                - ln -fs /usr/local/bin/pip3.8 /usr/bin/pip3
                - cd $BASE_PATH
        build:
          commands:
            - '# Execute Amplify CLI with the helper script'
            - amplifyPush --simple
    frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    appRoot: scan-writing

```

- Once done, then the build should be in queue and the entire application should be build and hosted end to end.
- Clicking on the link of the application, should help to take you to the hosted application.


## Known bugs and disclaimers

#### Some of the manual steps which needed to be followed to make the application working end to end.


### To make the application working end to end:
- We need to provide the access to the lambda functions to be able to access the speific policies, which could help them to access the resources.
- Search for all the lambdas which are created through the amplify command. As amplify automates the process, the roles created for the lambda execution are appended by some number so need to be searched in specific folders to get the exact name and attach the policies.
- Search for LambdaExecutionRole name by going into swen-514/project/cloud-project-2215-swen-514-614-section-01-team-4/scan-writing/amplify/backend/function/images/images-cloudformation-template.json.
- Attach the required policies to that specific lambda role.
- Similarly, we have to go to all the functions which comes with the project setup ie populateuser, textract, translate, images, comprehend
- Policies to be attached are as follow:
```
AmazonDynamoDBFullAccess
AWSLambdaDynamoDBExecutionRole
AWSLambdaInvocation-DynamoDB
AmazonS3FullAccess
AmazonTextractFullAccess
AmazonTextractServiceRole
AmazonS3OutpostsFullAccess
TranslateFullAccess
TranslateReadOnly
ComprehendFullAccess
ComprehendDataAccessRolePolicy
ComprehendMedicalFullAccess
ComprehendReadOnly

```
- Once attach the other manual step is to update the s3 bucket which is created by amplify push command, so go to AWS Console
- Search for s3, there should be a bucket named s3-to-store appended with some number along with the env, which should be dev, if you added followed the default prompt while setting up the application.
- Copy the s3 name and change it to the following files : 
```
cloud-project-2215-swen-514-614-section-01-team-4/scan-writing/amplify/backend/function/textract/src/index.py

```
- Once you go to this file, there is a variable named, ```bucket``` at line 16, update the value of s3 onto that
with the newly created s3 bucket Name once verified within you account, where we are trying to make the application work end to end.
- Also the bucket should be publicly accessible.
- Push to the backend environemnt by doing amplify push or you can commit to the master (assuming master of the repo is connected), it should build all the resources again and update whatever is new or edited.
- This will ensure that entire application works end to end now.


## How to test/run/access/use it
1. Click on the link, which should be available on the AWS amplify if wanted to work/test the hosted application functionality.
2. For testing the application locally, the backend environment will be using the resources hosted on AWS whereas you will be able to see the UI using localhost
3. For that go to the root of the directory in scan-writing, do ```npm install``` (assuming npm is installed in the system already)
4. Once npm install finishes, it should fetch all the required dependencies.
5. Do ```npm start```, it will launch the application on the browswer.

## License

MIT License
See LICENSE for details.
