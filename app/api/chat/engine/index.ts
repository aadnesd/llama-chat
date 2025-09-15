import {
  ContextChatEngine,
  LLM,
  MongoDBAtlasVectorSearch,
  serviceContextFromDefaults,
  VectorStoreIndex,
  SimpleDocumentStore,
  storageContextFromDefaults,
} from "llamaindex";
import { MongoClient } from "mongodb";
import { checkRequiredEnvVars, CHUNK_OVERLAP, CHUNK_SIZE, STORAGE_CACHE_DIR } from "./shared.mjs";

async function getDataSource(llm: LLM) {
  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  // Try MongoDB Atlas first, fallback to local storage
  try {
    checkRequiredEnvVars();
    const client = new MongoClient(process.env.MONGO_URI!);
    const store = new MongoDBAtlasVectorSearch({
      mongodbClient: client,
      dbName: process.env.MONGODB_DATABASE!,
      collectionName: process.env.MONGODB_VECTORS!,
      indexName: process.env.MONGODB_VECTOR_INDEX!,
    });

    return await VectorStoreIndex.fromVectorStore(store, serviceContext);
  } catch (error) {
    console.log("MongoDB not configured, falling back to local storage");
    
    let storageContext = await storageContextFromDefaults({
      persistDir: `${STORAGE_CACHE_DIR}`,
    });

    const numberOfDocs = Object.keys(
      (storageContext.docStore as SimpleDocumentStore).toDict(),
    ).length;
    if (numberOfDocs === 0) {
      throw new Error(
        `StorageContext is empty - call 'npm run generate' to generate the storage first`,
      );
    }
    return await VectorStoreIndex.init({
      storageContext,
      serviceContext,
    });
  }
}

export async function createChatEngine(llm: LLM) {
  const index = await getDataSource(llm);
  const retriever = index.asRetriever({ similarityTopK: 3 });

  return new ContextChatEngine({
    chatModel: llm,
    retriever,
  });
}
