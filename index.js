const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://FreelinzaDB:Cxr5YtPXkkhLByMk@cluster0.xq0m0kp.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const app = express();
const port = process.env.PORT || 3030
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Freelinza Server Is Running')
})
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("FreelinzaDB")
    const freelinzaCollection = database.collection("freelancers")
    app.post('/freelancers',async(req,res)=>{
        const newFreelancer = req.body
        const result = await freelinzaCollection.insertOne(newFreelancer)
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})