const mongoose = require('mongoose');



const dbConnect = () => {
    
    const MONGODB_URL= `mongodb+srv://breskitchen:bMuyQABRw34DhEeo@breskitchencluster.hqmk53c.mongodb.net/`

    mongoose.connect(MONGODB_URL).then(()=>{
        console.log('Connected to MongoDB');
    }
)}

module.exports = dbConnect;
