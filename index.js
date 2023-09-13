const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const SSLCommerzPayment = require('sslcommerz-lts')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;
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
    const sellerFormCollection = client.db("bd-crafts").collection("sellerForm");
      ///tarik
    const groupsCollection = client.db("bd-crafts").collection("groups")  
    const storyCollection = client.db("bd-crafts").collection("stories")  
    ///////
    const OrderCollection = client.db("bd-crafts").collection("orders")  
    const productsCollection = client.db("bd-crafts").collection("products");
    const cartsCollection = client.db("bd-crafts").collection("carts");

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

    app.get("/myProducts", async (req, res) => {
      // console.log(req.query);
      const query = { sellerEmail: req.query.email, status: "approved" };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
      // console.log(result);
    });

    // get pending seller list
    app.get("/pendingSeller", async (req, res) => {
      const result = await sellerFormCollection.find().toArray();
      res.send(result);
    });

    // get pending products list
    app.get("/pendingProducts", async (req, res) => {
      const query = { status: "pending" };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    // get particuler user posts
    app.get("/posts/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await postsCollection.find(query).toArray();
      res.send(result);
    });
    // get all comments
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { postId: id };
      console.log(query);
      const result = await commentsCollection.find(query).toArray();
      console.log(result);
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

    // get admin role
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });
    // get user role
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { user: user?.role === "user" };
      res.send(result);
    });
    // get Buyer role
    app.get("/buyerRole/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { buyer: user?.role === "buyer" };
      res.send(result);
    });
    // get Wholeseller role
    app.get("/wholesellerRole/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { wholeseller: user?.role === "wholeseller" };
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

    // all product api
    app.get("/allProduct", async (req, res) => {
      const query = { status: "approved" };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    // get cart
    app.get("/cartsData", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();


      res.send(result);
    });

    // post on cart
    app.post("/carts", async (req, res) => {
      const item = req.body;
      //console.log(item);
      const result = await cartsCollection.insertOne(item);
      res.send(result);
    });
    //  delete cart api
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;

      const query = { id: id };
      console.log(query);
      const result = await cartsCollection.deleteOne(query);

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
    ////TARIK // createStory
    app.post("/createStory", async (req, res) => {
      const body = req.body;
      const result = await storyCollection.insertOne(body);
      res.send(result);
    });
    app.get("/createStory", async (req, res) => {
      const result = await storyCollection.find().toArray();
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

    // approve products
    app.patch("/approvedProducts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await productsCollection.updateOne(filter, updateDoc);
      res.send(result);
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
    // delete products
    app.delete("/deleteProducts/:id", async (req, res) => {
      const id = req.params.id;
      
      const query = { _id: new ObjectId(id) };
      
      const result = await productsCollection.deleteOne(query);
      
      res.send(result);
    });

    
 
    // app.get("/products", async (req, res) =>{
    //   const products = await productCollections.find().toArray();
    //   res.send(products)

    // })
    
    app.post('/order', async(req,res) =>{
      const product = await OrderCollection.findOne(({_id: new ObjectId(req.body.productID)}))
      const order = req.body;
      
      const tran_id = new ObjectId().toString();
      const data = {
        total_amount: order.price,
        currency: order.currency,
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: `https://bd-crafts-server.vercel.app/payment/success/${tran_id}`,
        fail_url: `https://bd-crafts-server.vercel.app/payment/fail/${tran_id}`,
        cancel_url: 'https://bd-crafts-server.vercel.app/login',
        ipn_url: 'https://bd-crafts-server.vercel.app/ipn',
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
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.send({url:GatewayPageURL})
        const finalOrder = {
          product,
          paidStatus: false,
          transjectionId: tran_id,
        }
        const result = OrderCollection.insertOne(finalOrder)
        console.log('Redirecting to: ', GatewayPageURL)
    });
    app.post("/payment/success/:tranID", async(req,res) =>{
      console.log(req.params.tranID)
      const result = await OrderCollection.updateOne(
        {transjectionId: req.params.tranID},
        {
          $set:{
            paidStatus:true,
          },
        }
      );
      if(result.modifiedCount > 0){
        res.redirect(`https://bd-crafts-server.vercel.app/payment/success/${req.params.tranID}`)
      };
    })
    app.post("/payment/fail/:tranID", async(req,res) =>{
     const result = OrderCollection.deleteOne({transjectionId: req.params.tranID})
     if(result.deletedCount){
      res.redirect(`https://bd-crafts-server.vercel.app/payment/fail/${req.params.tranID}`)
     }
    })

    })


    ///Search Collection

    app.get('/search/:text', async (req, res) => {
      const searchText = req.params.text;
      
      // Search in projectCollection
      const postResults = await postsCollection.find({
          $or: [
              { caption: { $regex: searchText, $options: "i" } },
              { name: { $regex: searchText, $options: "i" } }
          ]
      }).toArray();
      
      // Search in userCollection
      // const shopResults = await shopCollection.find({
      //     // Define your search criteria for the userCollection here
      // }).toArray();
  
      // Search in usersCollection
      const usersResults = await usersCollection.find({
        $or: [
          { email: { $regex: searchText, $options: "i" } },
          { name: { $regex: searchText, $options: "i" } }
      ]
      }).toArray();
  
      // Search in groupCollection
      // const groupResults = await groupsCollection.find({
      //     // Define your search criteria for the groupCollection here
      // }).toArray();
      const productResults = await productsCollection.find({
        $or: [
          { email: { $regex: searchText, $options: "i" } },
          { name: { $regex: searchText, $options: "i" } }
      ]
      }).toArray();
  
      // Combine and send all the results
      const combinedResults = {
          post: postResults,
          // shops: shopResults,
          users: usersResults,
          // groups: groupResults,
          products:productResults
      };
      
      res.send(combinedResults);
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
