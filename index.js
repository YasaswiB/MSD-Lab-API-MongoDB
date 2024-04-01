const exp = require('express');
const app = exp();
const bodyParser = require('body-parser');

const mongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017';

app.use(bodyParser.json());

let sampleCollections;
mongoClient.connect(dbUrl)
.then(client => {
    const dbObj = client.db('sampleCollection');
    sampleCollections = dbObj.collection('user');
    app.set('sampleCollections', sampleCollections);
    console.log("DB Connection Successful");
})
.catch(err => console.log("Err in DB connection", err));


app.post('/register', async (req, res) => {
    //const sampleCollections = req.app.get('sampleCollections');
    // Get user data from request body
    const newUser = req.body;
    try {
        // Check for duplicate user by username
        const dbUser = await sampleCollections.findOne({ username: newUser.username });
        if (dbUser != null) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Insert new user
        await sampleCollections.insertOne(newUser);
        res.status(201).json({ message: 'New User Added' });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/data',async(req,res)=>{
    //const sampleCollections = req.app.get('sampleCollections');
    let userList = await sampleCollections.find().toArray();
    //send res
    res.send({message:"Users",payload:userList});
})

app.put('/update/:username',async(req,res)=>{
    //const sampleCollections = req.app.get('sampleCollections');
    let modifiedUser =  req.body;
    let updateUser = await sampleCollections.findOneAndUpdate({username:modifiedUser.username},{$set:{...modifiedUser}},{returnDocument:"after"});
    res.send({message:"Updated",payload: updateUser})
})

app.delete('/delete/:username',async(req,res)=>{
    //const sampleCollections = req.app.get('sampleCollections');
    const id = req.params.username;
    try {
        await sampleCollections.deleteOne({username:id});
        res.send({message:"User Deleted"});
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})
const PORT = 4000;
app.listen(PORT, () => { console.log(`listening on ${PORT}`); });
