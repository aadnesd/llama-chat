<<<<<<< HEAD
import {
  ContextChatEngine,
  LLM,
  serviceContextFromDefaults,
  SimpleDocumentStore,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { CHUNK_OVERLAP, CHUNK_SIZE, STORAGE_CACHE_DIR } from "./constants.mjs";

async function getDataSource(llm: LLM) {
=======
/* eslint-disable turbo/no-undeclared-env-vars */
import {
  ContextChatEngine,
  LLM,
  MongoDBAtlasVectorSearch,
  serviceContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { MongoClient } from "mongodb";
import { checkRequiredEnvVars, CHUNK_OVERLAP, CHUNK_SIZE } from "./shared.mjs";

async function getDataSource(llm: LLM) {
  checkRequiredEnvVars();
  const client = new MongoClient(process.env.MONGO_URI!);
>>>>>>> mongodb
  const serviceContext = serviceContextFromDefaults({
    llm,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
<<<<<<< HEAD
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
=======
  const store = new MongoDBAtlasVectorSearch({
    mongodbClient: client,
    dbName: process.env.MONGODB_DATABASE,
    collectionName: process.env.MONGODB_VECTORS,
    indexName: process.env.MONGODB_VECTOR_INDEX,
  });

  return await VectorStoreIndex.fromVectorStore(store, serviceContext);
>>>>>>> mongodb
}

export async function createChatEngine(llm: LLM) {
  const index = await getDataSource(llm);
<<<<<<< HEAD
  const retriever = index.asRetriever();
  retriever.similarityTopK = 5;

=======
  const retriever = index.asRetriever({ similarityTopK: 3 });
>>>>>>> mongodb
  return new ContextChatEngine({
    chatModel: llm,
    retriever,
  });
}
