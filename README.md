# alexa-wunderlist

A Lambda function to be used as an Alexa skill to add items to list, get items from list, get all lists names from Wunderlist

## Configuration

Assumptions:
 * You've added the following environment variables with the appropriate values

```
WLIST_ID - your id for wunderlist
WLIST_TOKEN - your token for wunderlist
WLIST_ARN - your lambda arn
```

 * You have aws cli installed(`sudo pip install awscli`)
 * You have an AWS profile called bizob2828, `aws configure --profile bizob2828`, or change the profile name in package.json deploy script
 * You have created an Alexa skill with the skill-deets and linked to a lambda function

## Deployment
Serverless is used. To deploy complete package:

`serverless deploy`

To deploy just updates to function:

`serverless deploy function -f AlexaWunderlistServerless`

## Commands
You can get all lists by saying
`Alexa, ask wonderlist what lists I have`

You can add items to a list by saying
`Alexa ask wonderlist to add cookies to grocery list`

You can get all items on list by saying
`Alexa ask wonderlist whats on my grocery list`

