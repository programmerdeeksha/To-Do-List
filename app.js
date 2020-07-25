const express= require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");
const app= express();
const items=["Buy Food","Cook Food","Eat Food"];
const workitems=[];
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb+srv://admin-deeksha:mongodb16@cluster0.e2aeg.mongodb.net/todoListDB",{useNewUrlParser: true});

const itemsSchema ={
  name: String
};
const listSchema={
  name: String,
  items: [itemsSchema]
};
const List= mongoose.model("List",listSchema);

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList"
})
const item2= new Item({
  name: "Hit + to add new item"
})
const item3= new Item({
  name: "<-- to delete an item"
})
const defaultitems=[item1,item2,item3];
// Item.insertMany(defaultitems,function(err){
//   if(err){
//     console.log(err);
//   }
// });










app.use(express.static("public"));
app.set('view engine', 'ejs');
app.get("/",function(req,res){
   Item.find(function(err,results){
     if(results.length===0){
       Item.insertMany(defaultitems,function(err){
         if(err){
           console.log(err);
         }
       });
res.render("list",{listTitle:"Today",newListItem:results});
     }else{
       res.render("list",{listTitle:"Today",newListItem:results});
     }
   })


  });

  app.post("/",function(req,res){
    const itemname = req.body.nextitem;
    const listname= req.body.list;
    const newitem= new Item({
      name: itemname
    });

    if(listname==="Today"){
      newitem.save();
      res.redirect("/");
    }
    else{
      List.findOne({name:listname},function(err,foundList){
        foundList.items.push(newitem);
        foundList.save();
        res.redirect("/"+ listname);

      });
    }
  });

 app.post("/delete",function(req,res){

   const checkeditem=req.body.checkbox;
   const listname= req.body.listname;

   if(listname==="Today"){
     Item.findByIdAndRemove(checkeditem,function(err){
       if(!err){
          res.redirect("/");
       }


     });
   }else{
    List.findOneAndUpdate({name: listname},{$pull: {items:{_id: checkeditem}}}, function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    });

   }

 });


app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,founditem){
    if(!err){
      if(!founditem){
        const list= new List({
          name: customListName,
          items: defaultitems
        });
        list.save();
        res.redirect("/"+customListName);
      }
       else{
         res.render("list",{listTitle:founditem.name,newListItem:founditem.items});
       }
    }

  })

})

app.listen(process.env.PORT||3000,function(){
  console.log("server is running");
});
