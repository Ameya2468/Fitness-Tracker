const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect('mongodb://localhost:27017/user_profiles',{
    useNewUrlParser : true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    name:String,
    age:Number,
    gender:String
});

const User = mongoose.model('User',userSchema);

app.use(bodyParser.json());

app.post('/register',async(req,res) => {
    try{
        const {name,age,gender} =req.body;
        const newUser = new User({name,age,gender});
        await newUser.save();

        res.json({message:"User Registered Successfully",user:newUser});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:'Internal Server Error'});
    }
});

app.get('/profile/:userId',async(req,res) => {
    try{
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "User Not Found"});
        }

        res.json({user});
        }
    catch(error){
        console.log(error);
        res.sendStatus(500).json({error: 'Internal Server Error'});
    }
})

const weightSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    date: String,
    weight: Number
});

const Weight = mongoose.model('Weight',weightSchema);

app.post('/addWeightRecord',async(req,res) =>{
    try{
        const {userId,date,weight} = req.body;
        const user = await User.findById(userId);

        if(!user){
            res.status(404).json({error:"User not Found"})
        }

        const newWeightRecord = new Weight ({userId,date,weight});
        await newWeightRecord.save();

        res.json({message: 'Weight Record Saved Successfully',record: newWeightRecord});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

app.get('/weightHistory/:userId',async(req,res) =>{
    try{
        const userId = req.params.userId;
        const weightRecords = await Weight.find({userId});
        res.json({weightRecords});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal Server Error"});
    }
});

app.put('/updateWeightRecord/:recordId',async(req,res) =>{
    try{
        const recordId = req.params.recordId;
        const {weight} = req.body;

        const existingRecord = await Weight.findById(recordId);
        if(!existingRecord){
            return res.status(404).json({error: "Weight Record Not Found"});
        }

        existingRecord.weight = weight;
        await existingRecord.save();

        res.json({message: "Weight Record Updated Successfully",record: existingRecord});
    }
    catch(error){
        console.log(error);
        res.sendStatus(500).json({error: "Internal Server Error"});
    }
});

app.delete('/deleteWeightRecord/:recordId',async (req,res) =>{
    try{
        const recordId = req.params.recordId;
        const deletedRecord = await Weight.findByIdAndDelete(recordId);
        if(!deletedRecord){
            return res.status(404).json({error: "Weight Record Not Found"});
        }

        res.json({message:"Weight Record Deleted Successfully",record: deletedRecord});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

const exerciseSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    exerciseType: String,
    duration: Number,
    date: String
});

const Exercise = mongoose.model('Exercise',exerciseSchema);

app.post('/addExerciseLog',async(req,res) =>{
    try{
        const {userId,exerciseType,duration,date} = req.body;
        const user = await  User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User Not Found"});
        }

        const ExerciseLog = new Exercise({userId,exerciseType,duration,date});
        await ExerciseLog.save();

        res.json({message: 'Exercise Log saved Successfully',log: ExerciseLog});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/exerciseHistory/:userId',async(req,res) =>{
    try{
        const userId = req.params.userId;
        const user = User.findById(userId);
        if(!user){
            res.status(404).json({error:"User Not Found"});
        }
        const exerciseLogs = await Exercise.find({userId})
        res.json({exerciseLogs});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.put('/updateExerciseLog/:logId',async(req,res) =>{
    try{
        const logId = req.params.logId;
        const {duration} = req.body;

        const exerciseLog = await Exercise.findById(logId);
        if(!exerciseLog){
            return res.status(404).json({error: "Exercise Log Not Found"});
        }
        exerciseLog.duration = duration;
        await exerciseLog.save();

        res.json({message:"ExerciseLog Updated Successfully", log: exerciseLog});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal Server Error"});
    }
});

app.delete('/deleteExerciseLog/:logId',async(req,res) =>{
    try{
        const logId = req.params.logId;
        const deletedLog =await Exercise.findByIdAndDelete(logId);
        if(!deletedLog){
            return res.status(404).json({error: "Exercise Log Not Found"});
        }

        res.json({message:"Exercise Log Deleted Successfully",log:deletedLog});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

const mealSchema = new mongoose.Schema({
    name: String,
    calories: Number
});

const Diet = mongoose.model('Diet',new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    meals: [mealSchema]
}));

app.post('/createDietAndMeals/:userId',async(req,res)=>{
    try{
        const userId = req.params.userId;
        const {meals} = req.body;
        const newDiet = await Diet.create({userId,meals});
        res.json({message:"Diet created and meals added successfully",diet: newDiet});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:'Internal Server Error'});
    }
});

app.get('/getMealsForDiet/:dietId',async(req,res) =>{
    try{
        const dietId=req.params.dietId;
        const diet=await Diet.findById(dietId);

        if(!diet){
            return res.status(404).json({error:"Diet Not found"});
        }
       res.json({meals:diet.meals});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:'Internal Server Error'});
    }
});

app.listen(3000,() =>{
    console.log("Server is Running on port 3000");
} )