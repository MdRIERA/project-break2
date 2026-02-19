//db.js configuracion a la base de datos
const mongoose=require('mongoose')

const connectDB=async(mongo_uri)=>{
    try{
        await mongoose.connect(mongo_uri);
        console.log('MongoDB conectado')
    }catch(error){
        console.error('MongoDB CONNECTION ERROR',error.message);
        process.exit(1)
    }
}

module.exports=connectDB