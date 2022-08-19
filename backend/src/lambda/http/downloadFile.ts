import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { AttachmentUtils } from '../../fileStorage/attachmentUtils'

const attUtils = new AttachmentUtils()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const atttachmentUrl = event.pathParameters.attachmentUrl

    if (atttachmentUrl != null) {
        const downloadLink = await attUtils.getAttachmentDownloadLink(atttachmentUrl)

        // Send attachment file to user
        return{
            statusCode: 200,
            headers : {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(downloadLink)
        }
    }
    else {
        return{
            statusCode: 400,
            headers : {
                'Access-Control-Allow-Origin': '*'
            },
            body: "Cannot download file"
        }
    }
    return
}
)

handler.use(
    cors({
        credentials: true
    })
)
