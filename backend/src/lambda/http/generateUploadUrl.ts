import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { AttachmentUtils } from '../../helpers/attachmentUtils'
import { getUserId } from '../utils'
import { updateAttachmentUrl } from '../../helpers/todos';

const attUtils = new AttachmentUtils()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)

    var attachmentUrl = await attUtils.getAttachmentUrl(todoId)
    var presignedUrl: string

    if(attachmentUrl == null){
    const attachmentId = todoId

    presignedUrl = await attUtils.createAttachmentPresignedUrl(attachmentId)

    attachmentUrl = await attUtils.getAttachmentUrl(attachmentId)

    await updateAttachmentUrl(userId, todoId, attachmentUrl)


    }

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        presignedUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
