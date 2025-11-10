const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://FreelinzaDB:Cxr5YtPXkkhLByMk@cluster0.xq0m0kp.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Freelinza Server Is Running");
});

async function run() {
  try {
    await client.connect();
    const database = client.db("FreelinzaDB");
    const jobsCollection = database.collection("Jobs");
    const acceptedTasksCollection = database.collection("AcceptedTasks");
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      newJob.createdAt = new Date();
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    app.get("/all-jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/all-jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const job = await jobsCollection.findOne(query);
      res.send(job);
    });
    app.get("/latest-jobs", async (req, res) => {
      const cursor = jobsCollection
        .find()
        .sort({ createdAt: -1 })
        .skip(6)
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/my-accepted-tasks", async (req, res) => {
      const acceptedJob = req.body;
      const existing = await acceptedTasksCollection.findOne({
        jobId: acceptedJob.jobId,
        acceptedBy: acceptedJob.acceptedBy,
      });

      if (existing) {
        return res.send({ message: "Already accepted this job" });
      }
      const result = await acceptedTasksCollection.insertOne(acceptedJob);
      res.send(result);
    });
    app.get("/my-accepted-tasks", async (req, res) => {
      const email = req.query.email;
      const query = { acceptedBy: email };
      const result = await acceptedTasksCollection.find(query).toArray();

      res.send(result);
    });
    app.delete("/my-accepted-tasks/:id", async (req, res) => {
      const id = req.params.id;
      const result = await acceptedTasksCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Client close optional
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
