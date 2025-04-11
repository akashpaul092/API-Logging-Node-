import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Helper function to convert a Readable stream to a string
async function streamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        stream.on("error", reject);
    });
}

// Function to upload log content to S3
export async function uploadFileToS3(filename: string, logContent: string, bucketName: string, s3Client: S3Client): Promise<void> {
    let finalLogContent = logContent;

    try {
        // Try to fetch the existing file from S3
        const getObjectCommand = new GetObjectCommand({ Bucket: bucketName, Key: filename });
        const existingFile = await s3Client.send(getObjectCommand);

        if (existingFile.Body) {
            const existingContent = await streamToString(existingFile.Body as Readable);
            finalLogContent = existingContent + logContent; // Append the new content
        }
    } catch (err: any) {
        if (err.name !== "NoSuchKey") {
            // Rethrow other errors (e.g., permission issues)
            throw err;
        }
        // If the file does not exist, `finalLogContent` remains as the new content
    }

    // Upload the log content to S3
    const putObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: finalLogContent,
        ContentType: "text/plain", // Specify content type as plain text
    });

    await s3Client.send(putObjectCommand);
}

// Function to get the latest file from S3
export async function getLatestFileFromS3(basePath: string, bucketName: string,s3Client: S3Client): Promise<{ key: string | undefined; size: number | undefined } | null> {
    const listObjectsCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: basePath,
    });

    const result = await s3Client.send(listObjectsCommand);
    const files = result.Contents || [];

    // Sort files by last modified date in descending order
    files.sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));

    if (files[0]) {
        return { key: files[0].Key, size: files[0].Size };
    }
    return null;
}
