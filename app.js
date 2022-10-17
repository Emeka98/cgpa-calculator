//  jshint esversion: 6

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

//-------------------- database setup and connection---------------//
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/cgpaDB", {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
//------App creation------------//
const _ = require("lodash");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

//--------------------------------------------------///
//---------------------Create data schema-----------------//
const courseSchema = new mongoose.Schema({
  courseCode: String,
  grade: String,
  unitLoad: Number,
  gradePoint: Number,
  courseScore: Number,
  
});
//-----------------------------create data model-------------//

const Course = mongoose.model("Course", courseSchema);
const serialNumber = 1;


app.get("/", function(req, res) {
  res.render("home");
});


app.route("/course")
.get(function (req, res) {
  Course.find({}, function(err, courses){
      let totalScore = 0;
      let unitSum = 0;
      let cgpa = 0;
      for (i=0; i < courses.length; i++) {
        unitSum = unitSum + courses[i].unitLoad;
        totalScore = totalScore + courses[i].courseScore;
         cgpa = (totalScore / unitSum).toFixed(3);
      }
  

       ///////////// Remark functionality ///
      let remark;
      if (cgpa >= 4.5) {remark = "Wow! You made a first class, you must be a genius. Congrats"}
      else if (cgpa >= 3.5) {remark = "You made a second class upper division. Great result!"}
      else if (cgpa >= 3.0) {remark = "You made a second lower division!"}
      else if (cgpa > 2.0) {remark = "You made a third honours! Work harder"}
      else {remark = "You got a pass!"}

    res.render("courses", {coursesAdded: courses, 
      remark: remark, totalScore: totalScore, totalUnit: unitSum,
       serialNumber: serialNumber, currentCgpa: cgpa});
  });
  
})

.post(function (req, res){
    const grade = req.body.grade
    let point;
    if (grade === "a") {point = 5} else if (grade === "b") {point = 4} 
    else if (grade === 'c') {point = 3} 
    else if (grade === 'd') {point = 2} 
    else if (grade === 'e') {point = 1} 
    else if (grade === 'f') {point = 0} 
    else {return "Invalid Entry"}
    
    const course = new Course ({
      courseCode: _.upperCase(req.body.course),
      grade: _.upperCase(grade),
      unitLoad: req.body.unitLoad,
      gradePoint: point,
      courseScore: (req.body.unitLoad * point)
     
  });

  course.save(function(err) {
    if (!err) {
      console.log("Successfully added data to database");
    }
  });

  
  res.redirect("/course");
 
})

app.post("/delete", function(req, res) {
  Course.deleteMany({}, function(err){
    if (err) {console.log(err)}
  });

  const courseId = req.body.remove;
  Course.findByIdAndRemove(courseId, function(err) {
    if (err) {console.log(err)}
  })
  res.redirect("/course");
});

app.post("/remove", function(req, res) {

  const courseId = req.body.remove;
  Course.findByIdAndRemove(courseId, function(err) {
    if (err) {console.log(err)}
  })
  res.redirect("/course");
});

app.post("/refresh", function(req, res) {
  Course.deleteMany({}, function(err) {
    if (err) throw err;
  })
    res.redirect("/course")
})

app.listen(3000, function() {
  console.log("Server currently running on port 3000");
});
