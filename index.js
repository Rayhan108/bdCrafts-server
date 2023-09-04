const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const SSLCommerzPayment = require('sslcommerz-lts')
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


const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_SECRET;
const is_live = false

async function run() {
  try {
    const usersCollection = client.db("bd-crafts").collection("users");
    const postsCollection = client.db("bd-crafts").collection("posts");
    const friendsCollection = client.db("bd-crafts").collection("friends");
    const commentsCollection = client.db("bd-crafts").collection("comments");
    const sellerFormCollection = client
      .db("bd-crafts")
      .collection("sellerForm");
    const productCollections = client.db("bd-crafts").collection("products")  

    // const indexKeys = { name: 1 };
    //     const indexOptions = { name: "userName" };
    //     const result = await usersCollection.createIndex(indexKeys, indexOptions);

    // get method

    // get all users
    app.get("/allusers", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // get all fake friend
    app.get("/allFakeFriend", async (req, res) => {
      const result = await friendsCollection.find().toArray();
      res.send(result);
    });
    // get all friend request link
    app.get("/allFriendRequestLink", async (req, res) => {
      const query = { status: "Add friend" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    // get all friend list
    app.get("/allFriend", async (req, res) => {
      const query = { status: "friend" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    // get all post
    app.get("/allposts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    });

    // get pending seller list
    app.get("/pendingSeller", async (req, res) => {
      const result = await sellerFormCollection.find().toArray();
      res.send(result);
    });

    // get particuler user posts
    app.get("/posts/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await postsCollection.find(query).toArray();
      res.send(result);
    });

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

      // get admin role
      app.get("/admin/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        const result = { admin: user?.role === "admin" };
        res.send(result);
      });
  
 // get  seller role
 app.get("/sellerRole/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  const result = { seller: user?.role === "seller" };
  res.send(result);
});







    // POST/PATCH Method

    // add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      console.log("existing user", existingUser);
      if (existingUser) {
        return res.json("user already exist ");
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // post
    app.post("/post", async (req, res) => {
      const body = req.body;
      const result = await postsCollection.insertOne(body);
      res.send(result);
    });
    // submit  seller form
    app.post("/sellerForm", async (req, res) => {
      const body = req.body;
      const result = await sellerFormCollection.insertOne(body);
      res.send(result);
    });

    //update user role to seller and delete autometically
    app.patch("/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      const updatedoc = {
        $set: {
          role: "seller",
        },
      };

      const result = await usersCollection.updateOne(query, updatedoc);

      // Delete the record from the sellerFormCollection
      const deleteFilter = { sellerEmail: email };

      const deleteResult = await sellerFormCollection.deleteOne(deleteFilter);
      // console.log({ result, deleteResult });
      res.send({ result, deleteResult });
    });

    //comment on post

    app.post("/comment", async (req, res) => {
      const body = req.body;
      const result = await commentsCollection.insertOne(body);
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

    // delete method

    app.delete("/deleteSeller/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await sellerFormCollection.deleteOne(query);
      res.send(result);
    });


    // payment SSLCommerz
    
    app.post('/order', async(req,res) =>{
      const product = await productCollections.find(({_id: new ObjectId(req.body.productID)}))
      const order = req.body;
      
      const tran_id = new ObjectId().toString();
      const data = {
        total_amount: product.price,
        currency: order.currency,
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: order.name,
        cus_email: 'customer@example.com',
        cus_add1: order.address,
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    console.log(data);
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    let GateWayPageURL =  apiResPonse.GateWayPageURL;
    res.redirect({url: GateWayPageURL});
    console.log("Redircting to", GateWayPageURL)
    })
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
