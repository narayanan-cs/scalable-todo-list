declare module '@selego/mongoose-elastic' {
  import { Schema } from 'mongoose';
  import { Client } from '@elastic/elasticsearch';

  interface ElasticOptions {
    esClient: Client; // The Elasticsearch client
    index?: string;   // Optional index name
    // You can add more options as needed based on the plugin's functionality
  }

  function plugin(schema: Schema, options?: ElasticOptions): void;

  export default plugin;
}
