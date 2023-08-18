const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("bd-crafts servcer is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.njyz70v.mongodb.net/?retryWrites=true&w=majority`;

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
const userCollection = client.db("bd-crafts").collection("users");
const postsCollection=client.db('bd-crafts').collection("posts")

// get all users
app.get('/allusers',async (req,res)=>{
    const result = await userCollection.find().toArray();
    res.send(result);
})
// get all post
app.get('/allposts',async (req,res)=>{
  const result = await postsCollection.find().toArray();
  res.send(result);
})
// post
app.post("/post", async (req, res) => {
  const body = req.body;

  const result = await postsCollection.insertOne(body);
  res.send(result);
});

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`bd-crafts server is running on port ${port}`);
});
