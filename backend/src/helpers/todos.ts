import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from '../utils/logger'
import { AttachmentUtils } from './attachmentUtils'

const attUtils = new AttachmentUtils()
// TODO: Implement businessLogic
const logger = createLogger('helpers-todos')
const todosAcess = new TodosAccess()

export async function createTodo(userId: string, todo: CreateTodoRequest): Promise<TodoItem> {

    const createdAt = new Date().toISOString()
    const todoId = uuid.v4()
    await attUtils.createAttachmentPresignedUrl(todoId)
    const attachmentUrl = await attUtils.getAttachmentUrl(todoId)
    
   return await todosAcess.createTodo({
    userId,
    todoId,
    createdAt,
    done: false,
    ...todo,
    attachmentUrl: attachmentUrl
   });

}

export async function getAllTodoOfUser(userId: string): Promise<TodoItem[]> {
    logger.info("Calling getAllTodoOfUser for userId: " + userId)
    return todosAcess.getAllTodoOfUser(userId)
    
}

export async function updateTodo(userId: string, todoId: string, updateTodo: UpdateTodoRequest):Promise<TodoUpdate> {
    logger.info("Calling updateTodo for userId/todoId: " + userId + "/" + todoId)
    return todosAcess.updateTodo(userId, todoId, updateTodo)
}

export async function deleteTodo(userId: string, todoId: string) {
    logger.info("Calling deleteTodo for userId/todoId: " + userId + "/" + todoId)
    return todosAcess.deleteTodo(userId, todoId)

}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<string> {
    logger.info("Calling updateAcctachmentUrl for userId/todoId: " + userId + "/" + todoId)
    return todosAcess.updateAttachmentUrl(userId, todoId, attachmentUrl)

}