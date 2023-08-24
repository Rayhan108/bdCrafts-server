const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
const usersCollection = client.db("bd-crafts").collection("users");
const postsCollection=client.db('bd-crafts').collection("posts")
const friendsCollection=client.db('bd-crafts').collection("friends")
const commentsCollection=client.db('bd-crafts').collection("comments")

// const indexKeys = { name: 1 };
//     const indexOptions = { name: "userName" };
//     const result = await usersCollection.createIndex(indexKeys, indexOptions);

// add user
app.post('/users', async (req, res) => {
  const user = req.body;
  console.log(user)
  const query = { email: user.email }
  const existingUser = await usersCollection.findOne(query)
  console.log('existing user', existingUser)
  if (existingUser) {
    return res.json('user already exist ')

  }
  const result = await usersCollection.insertOne(user)
  res.send(result)
})


// get all users
app.get('/allusers',async (req,res)=>{
    const result = await usersCollection.find().toArray();
    res.send(result);
})

 // get all friend request link
 app.get("/allFriendRequestLink", async (req, res) => {
  const query = { status: "Add friend" };
  const result = await usersCollection.find(query).toArray();
  res.send(result);
});
// get all friend list
app.get("/allFriend",async(req,res)=>{
 const query = {status :"friend"};
 const result = await usersCollection.find(query).toArray();
 res.send(result) 
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
//comment on post 

    app.post("/comment", async (req, res) => {
      const body = req.body;
      const result = await commentsCollection.insertOne(body);
      res.send(result);
    });
// get particuler user posts
app.get("/posts/:email",async(req,res)=>{
  const userEmail = req.params.email;
  const query = {email:userEmail};
  const result = await postsCollection.find(query).toArray();
  res.send(result);
})
    // find friend
       
       app.get("/users/:text", async (req, res) => {
        const text = req.params.text;
  
        const result = await usersCollection
          .find({
            $or: [{ name: { $regex: text, $options: "i" } }],
          })
          .toArray();
        res.send(result);
      });
         //add friend
    app.patch("/alluser/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Add friend",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
         //confirm friend
    app.patch("/allUsersData/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "friend",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
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
