//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dateDataModule = require(__dirname + "/date.ejs");
var _ = require("lodash");
//app is generated using express
//admin-ren
//alawai1
const app = express();

const totalItem = [];
const workItems = [];
// mongoose.connect("mongodb://localhost:27017/todolistDB", {
  mongoose.connect("mongodb+srv://admin-ren:alawai1@cluster0-9krl5.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
const itemsSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
  name: "Shopping at mall"
});
const item2 = new Item({
  name: "Sightseeing"
});
const item3 = new Item({
  name: "jogging"
});
const defaultArray = [item1, item2, item3];
const itm1 = new Item({
  name: "clean cat"
});

const itm2 = new Item({
  name: "dry cat"
});

const itm3 = new Item({
  name: "feed cat"
});
const itm4 = new Item({
  name: "clean dog"
});

const itm5 = new Item({
  name: "dry dog"
});

const itm6 = new Item({
  name: "feed the dog"
});

const catItems = [itm1, itm2, itm3];
const dogItems = [itm4, itm5, itm6];
const listSchema = new mongoose.Schema({
  listName: String,
  list: [itemsSchema]
});

const List = mongoose.model("list", listSchema);

const list1 = new List({
  listName: "catType",
  list: catItems
});
//list1.save();
const list2 = new List({
  listName: "dogType",
  list: dogItems
});
//list2.save();
app.use(bodyParser.urlencoded({
  extended: true
}));
//to serve as static
app.use(express.static("public"));
///set view engine of our app to embedded js
app.set("view engine", "ejs");
//in order to use ejs we need to create a folder called views(lowercase), its here that ejs view engine will look for file you are trying to render
  var dateData = dateDataModule.setDateAndDay();
app.get("/", function(req, res) {
  // res.render("home.ejs");
  // setDisplayDate();
  //var dayData = dateDataModule.getDay();

  Item.find({}, function(err, items) {
    if (err) {
      console.log(err);
    } else {

      if (items.length === 0) {

        Item.insertMany(defaultArray, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully added items to list");
          }
        });
        res.redirect("/");
      } else {

        items.forEach(item => console.log(item.name));
        res.render("list", {
          dayOfTheWeek: dateData[1],
          wkendOrWkday: dateData[2],
          totalItemInList: items,
          dateFormateTitle: dateData[0],
          pageTitle: "General Tasks!📝"
        });
      }
    }
  });
});


app.post("/", function(req, res) {
      console.log("In simple post");
      var pageType = req.body.submit;
      console.log("PAGE TYPE :: "+pageType);
      var item = req.body.inputItem;


      console.log("LOGGING dateData :::"+dateData[0]);
      const itemToAdd = new Item({
        name: item
      });
        // workItems.push(item);
        // Item.insertOne(itemToAdd,function(err){
        // if (pageType === "Work") {
        //   res.redirect("/work");
        // }
        if (pageType === dateData[1]+",") {

          itemToAdd.save(function(){
            res.redirect("/"); //so after save refresh
          });


        }
        else {
        //  const listArray = [itemToAdd];
          List.findOne({listName: pageType},function(err,list){
            if(err){
              console.log("Error in custom post!");
            }
            else{
              console.log("IN SAME FIND ONE");
              list.list.push(itemToAdd);
              list.save(function(){
                res.redirect("/"+pageType);
              });

            }

        });

          // res.redirect("/"+pageType);
            //totalItem.push(item);

          }
          // });
      });

    app.post("/delete", function(req, res) {
      console.log(req.body);
      const itemCheckedToDelete = req.body.checkbox;
      const titleName = req.body.titleName;
      console.log("listName in DELETE :: "+titleName);
      console.log("ITEM checked TO DELETE"+itemCheckedToDelete);

      Item.deleteOne({
        _id: itemCheckedToDelete
      }, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("deleted checkbox item");
        }
      });
    //   if(titleName === "Work" ){
    //   res.redirect("/Work");
    // }
     if(titleName === dateData[0]){
      res.redirect("/");
    }
    else{
      List.findOneAndUpdate({listName: titleName},{ $pull: { list:{ _id : itemCheckedToDelete}}},function(err,foundList){
         //foundList.(save();

         console.log("FOUND TO DELETE ::::"+foundList);
         if(!err){
           console.log("TITLE NAME BEFORE EXIITING"+titleName);
           foundList.save();
           res.redirect("/"+titleName);
       }
       else{
         console.log("Error in findoneupdate pull");
       }
      });
    }
    });

    app.get('/favicon.ico', (req, res) => res.status(204));

    app.get("/:listName", function(req, res) {
      console.log(req.params.listName);
      const dateData = dateDataModule.setDateAndDay();
      const listNameType = _.capitalize(req.params.listName);
     console.log("Here is req.param" + listNameType);

      List.findOne({
        listName: listNameType
      }, function(err, listObj) {
        if (!err) {
          if (listObj) {
            console.log("here is the list created in lists::" + listObj);
            console.log("LISTNAME:::::" + listObj.listName);
            console.log("lidt list is ::" + listObj.list);
            const listInside = listObj.list;

            res.render("list", {
              dayOfTheWeek: dateData[1],
              wkendOrWkday: dateData[2],
              dateFormateTitle: listObj.listName,
              totalItemInList: listObj.list,
              pageTitle: listNameType+" Tasks!📝"
            });

          } else {
            const listToAdd = new List({
              listName: listNameType,
              list: []
            });
            listToAdd.save();
            res.redirect("/" + listNameType);
            // res.render("list",{
            //   dayOfTheWeek: dateData[1],
            //   wkendOrWkday: dateData[2],
            //   dateFormateTitle: listNameType,
            //   totalItemInList: [],
            //   pageTitle:"Work Tasks!📝"
            // });
          }
        } else {
          console.log("Something went wrong in custom list");
          res.redirect("/");
          console.log("WRONG WRONG");
        }

      });

    });


    // app.post("/:listName", function(req, res) {
    //   const listNameInParam = req.params.listName;
    //   console.log("In post of LISTNAMES SPECIFIC");
    //   const listItem = req.body.inputItem;
    //   console.log(listItem);
    //
    //   const item = new Item({
    //     name: listItem
    //   });
    //
    //   const listArray = [item];

      // List.insertOne({
      //   listName: listNameInParam,
      //   list: listArray
      // }, function(err) {
      //   if (err) {
      //     console.log(err);
      //     res.redirect("/:listName");
      //   } else {
      //     console.log("no error item inserted");
      //   }
      // });

    // });




    //it(res.render) uses the view engine to render a particular page here index.html
    app.get("/w/groceries", function(req, res) {
      res.render("groceries", {
        pageTitle: "Groceries Page🍇🍈🍉🍏",
        items: "Have a wonderful time shopping!"
      });
    });


    let port = process.env.PORT;
    if (port == null || port == "") {
      port = 3000;
    }

    app.listen(port, function() {
      console.log("Listening to port, Server started Successfully");
    });

    //TEMPLATE :: Run code in html template
