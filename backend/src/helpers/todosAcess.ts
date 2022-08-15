import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('helpers-todosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE){
    }

    async getAllTodoOfUser(userId: string): Promise<TodoItem[]>{
        logger.info("Getting all todo of user: " + userId)
        const params = {
            TableName: this.todosTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            },
            ScanIndexForward: true
        }
        const result = await this.docClient.query(params).promise();

        const items = result.Items
        logger.info("List all todo got: ", JSON.stringify(items))
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Creating todo: " + JSON.stringify(todo))
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async updateTodo(userId: string, todoId: string, updateTodo: TodoUpdate):Promise<TodoUpdate> {
        logger.info("Updating todo for user: " + userId + " with data: " + todoId + " " + updateTodo)
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #todoname = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name' : updateTodo.name,
                ':dueDate' : updateTodo.dueDate,
                ':done' : updateTodo.done,
            },
            ExpressionAttributeNames: {
                "#todoname": "name"
              }
        }

        await this.docClient.update(params, function(err, res){
            if(err){
                console.log(err)
            }
            else{
                console.log(res)
            }
        }).promise()

        return updateTodo;
    }

    async deleteTodo(userId: string, todoId: string){
        logger.info("Deleting todo " + todoId + " of user " + userId)
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }

        await this.docClient.delete(params, function(err, res){
            if(err){
                console.log(err)
            }
            else{
                console.log(res)
            }
        }).promise()
        
        console.log("Deleted!")
    }

    async updateAttachmentUrl(userId: string, todoId: string, uploadUrl: string): Promise<string> {
        logger.info("Updating attachment url of todo " + todoId)
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': uploadUrl
            }
        }

        await this.docClient.update(params, function(err, res) {
            if(err){
                console.log(err)
            }
            else{
                console.log(res)
            }
        }).promise()

        return uploadUrl
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  