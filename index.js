const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// conect mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yzegd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
    const database = client.db('tasksmanagement');
    const taskCollection = database.collection('task');

    app.get('/tasks', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { employee_email: email };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });
    app.post('/tasks', async (req, res) => {
      try {
        const addItemList = req.body;
        const result = await taskCollection.insertOne(addItemList);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to add equipment' });
      }
    });

    app.put('/tasks/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: req.body,
        };

        const result = await taskCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to update equipment' });
      }
    });

    app.get('/tasks/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await taskCollection.findOne(query);
        if (!result) {
          res.status(404).send({ error: 'Equipment not found' });
        } else {
          res.send(result);
        }
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch equipment' });
      }
    });

    app.delete('/tasks/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await taskCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          res.status(404).send({ error: 'tasks not found' });
        } else {
          res.send(result);
        }
      } catch (error) {
        res.status(500).send({ error: 'Failed to delete tasks' });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Welcome to tasks manegment  API server!');
});

// Start server
app.listen(port, () => {
  console.log('Server running on port', port);
});
