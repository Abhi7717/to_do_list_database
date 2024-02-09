const express=require("express")
const bodyParser=require("body-parser")
const mongoose=require("mongoose")
const app=express()
const _=require("lodash")
// const date=require(__dirname+"/date.js")

// console.log(date())

// const Items=["code","eat","sleep"];
// const WorkItems=[];

app.set("view engine","ejs")

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://abhijietkumar654:abhijietkumar654@cluster0.xbnkocn.mongodb.net/todolistDB")

const itemsSchema=
{
    name : String
}

const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your todolist !"
})

const item2=new Item({
    name: "Hit the + button to add a new item."
})

const item3=new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems=[item1,item2,item3];

const listSchema={
    name: String,
    items: [itemsSchema]
}

const List=mongoose.model("List",listSchema)



app.get("/",function(req,res){
    // res.send("Abhi")
   
    //  let day=date.getDay();


        Item.find({})   // Item.find() dosn't accept the callback so we have to use the ".then" function to make return calls.
        .then(foundItems => {
            if (foundItems.length === 0) {
              // Insert default items
               return Item.insertMany(defaultItems);
               
            } else {
              res.render("list", { today: "Today", newItem: foundItems });
            }
          })
          
    //res.send(day)
})

app.get("/:customListName",(req,res)=>{
    const customListName=_.capitalize(req.params.customListName)

    List.findOne({name: customListName})
    .then(foundList=>{
        // if(!err){
            if(!foundList)
            {
                // console.log("Doesn't exist !")
                const list= new List({
                    name:customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect("/"+customListName)
            }
            else{
                // console.log("Existes !");
                res.render("list", { today: foundList.name, newItem: foundList.items });
            }
        // }

    })

   
}) 

app.post("/",(req,res)=>{
   const  ItemName= req.body.newItem
    const listName=req.body.list;
   const item=new Item({
    name: ItemName
   })
   if(listName === "Today" ){
   item.save();
   res.redirect("/")
    }else{
        List.findOne({name: listName})
        .then(foundList=>{
            foundList.items.push(item)
            foundList.save()
            res.redirect("/"+listName)
        })
    }
})

app.post("/delete",async function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName=req.body.listName

    if(listName==="Today")
    {
        try {
            await Item.findByIdAndDelete(checkedItemId);
            console.log("Successfully deleted");
            res.redirect("/")
        } catch (err) {
            console.error(err);
        }
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}})
        .then(foundList=>{
           
                res.redirect("/"+listName)
            

        })
    }

   
    })

     
app.listen(3000, function(){
    console.log("server has started as 3000")
})