import { Client } from '@elastic/elasticsearch';
import mongoose from 'mongoose';
import mongooseElastic from '@selego/mongoose-elastic';

const client = new Client({ node: "http://localhost:9200" });
async function checkElasticsearchConnection() {
  try {
    await client.ping();
    console.log('Connected to Elasticsearch');
  } catch (error) {
    console.error('Elasticsearch cluster is down!', error);
  }
}

// Call the function to check the connection
checkElasticsearchConnection();
const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: {type: String, required:true},
  email: {type: String, required: true},
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

TodoSchema.plugin(mongooseElastic, { esClient: client, index: 'todos' });

async function checkIfIndexExistsElseCreate() {


  try {
    const indexExistsResponse = await client.indices.exists({ index: 'todos' });
    console.log('Index exists response:', indexExistsResponse);

    if (!indexExistsResponse) {
      console.log('Creating index: todos');
      
      const createIndexResponse = await client.indices.create({
        index: 'todos',
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              username: { type: 'text' },
              email: { type: 'text' },
              title: { type: 'text' },
              completed: { type: 'boolean' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        },
      });

      console.log('Index created:', createIndexResponse);
    } else {
      console.log('Index already exists: todos');
    }
  } catch (error) {
    console.error('Error checking or creating index:', error);
  }
};

checkIfIndexExistsElseCreate();
TodoSchema.post('save', async function(doc) {
    try {
        await client.index({
            index: 'todos',
            id: doc._id.toString(),
            body: {
                userId: doc.userId,
                username: doc.username,
                email: doc.email,
                title: doc.title,
                completed: doc.completed,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            }
        });
        console.log('Document indexed in Elasticsearch:', doc);
    } catch (error) {
        console.error('Error indexing document:', error);
    }
});
const Todo = mongoose.model('Todo', TodoSchema);
export default Todo;
