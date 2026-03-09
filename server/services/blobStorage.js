const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const CONTAINER_NAME = "product-images";

let containerClient = null;

async function getContainerClient() {
  if (containerClient) return containerClient;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.warn("⚠️  Azure Blob Storage not configured — images will not be uploaded");
    return null;
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  // Create container if it doesn't exist (with public blob access for images)
  await containerClient.createIfNotExists({ access: "blob" });
  console.log("✅ Azure Blob Storage container ready");

  return containerClient;
}

async function uploadImage(fileBuffer, originalName, mimeType) {
  const client = await getContainerClient();
  if (!client) return null;

  const extension = originalName.split(".").pop();
  const blobName = `${uuidv4()}.${extension}`;
  const blockBlobClient = client.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return blockBlobClient.url;
}

async function deleteImage(imageUrl) {
  const client = await getContainerClient();
  if (!client || !imageUrl) return;

  try {
    const blobName = imageUrl.split("/").pop();
    const blockBlobClient = client.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.error("Error deleting blob:", error.message);
  }
}

module.exports = { uploadImage, deleteImage };
