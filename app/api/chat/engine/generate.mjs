import * as dotenv from "dotenv";
import {
  MongoDBAtlasVectorSearch,
  SimpleDirectoryReader,
  VectorStoreIndex,
  storageContextFromDefaults,
  serviceContextFromDefaults,
} from "llamaindex";
import { MongoClient } from "mongodb";
import { STORAGE_DIR, checkRequiredEnvVars, CHUNK_SIZE, CHUNK_OVERLAP, STORAGE_CACHE_DIR } from "./shared.mjs";

dotenv.config();

async function getRuntime(func) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

async function generateDatasourceMongoDB() {
  const mongoUri = process.env.MONGO_URI;
  const databaseName = process.env.MONGODB_DATABASE;
  const vectorCollectionName = process.env.MONGODB_VECTORS;
  const indexName = process.env.MONGODB_VECTOR_INDEX;

  // Create a new client and connect to the server
  const client = new MongoClient(mongoUri);

  // load objects from storage and convert them into LlamaIndex Document objects
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: STORAGE_DIR,
  });

  // create Atlas as a vector store
  const vectorStore = new MongoDBAtlasVectorSearch({
    mongodbClient: client,
    dbName: databaseName,
    collectionName: vectorCollectionName, // this is where your embeddings will be stored
    indexName: indexName, // this is the name of the index you will need to create
  });

  // now create an index from all the Documents and store them in Atlas
  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(documents, { storageContext });
  console.log(
    `Successfully created embeddings in the MongoDB collection ${vectorCollectionName}.`,
  );
  await client.close();
}

async function generateDatasourceLocal(serviceContext) {
  console.log(`Generating storage context...`);
  // Split documents, create embeddings and store them in the storage context
  const ms = await getRuntime(async () => {
    const storageContext = await storageContextFromDefaults({
      persistDir: STORAGE_CACHE_DIR,
    });
    const documents = await new SimpleDirectoryReader().loadData({
      directoryPath: STORAGE_DIR,
    });
    await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
      serviceContext,
    });
  });
  console.log(`Storage context successfully generated in ${ms / 1000}s.`);
}

(async () => {
  try {
    // Try MongoDB first
    checkRequiredEnvVars();
    await generateDatasourceMongoDB();
  } catch (error) {
    console.log("MongoDB not configured, falling back to local storage");
    const serviceContext = serviceContextFromDefaults({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    await generateDatasourceLocal(serviceContext);
  }
  console.log("Finished generating storage.");
})();
