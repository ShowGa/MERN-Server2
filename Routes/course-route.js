const router = require("express").Router();
const Course = require("../Models/index").course;
const { courseValidation } = require("../validation");

router.use((req, res, next) => {
  console.log("Course route receiving a request");
  next();
});

/*-----------------Course--------------*/
// find all courses
router.get("/", async (req, res) => {
  try {
    // populate => query object
    let courseFind = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFind);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// find courses with instructor id
router.get("/instructor/:_instructor_id", async (req, res) => {
  try {
    let { _instructor_id } = req.params;
    let coursesFind = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFind);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// default showing courses for student to enroll
router.get("/student", async (req, res) => {
  try {
    let coursesFind = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFind);
  } catch (e) {
    return res
      .status(500)
      .send("Fail to load the courses ! Please contact our customer service");
  }
});

// find courses with student id
router.get("/student/:_student_id", async (req, res) => {
  try {
    let { _student_id } = req.params;
    let coursesFind = await Course.find({ students: _student_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFind);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// find course with Name
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFind = await Course.find({ title: name })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFind);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// find course with ID
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFind = await Course.findOne({ _id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFind);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// Add new course
router.post("/", async (req, res) => {
  // courseValidation
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check identity
  if (req.user.isStudent()) {
    return res
      .status(400)
      .send(
        "Only instructor can post course ! Please login intructor account !"
      );
  }

  // post new course
  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    return res.send({
      message: "New course had been saved !",
      savedCourse,
    });
  } catch (e) {
    return res.status(500).send("Failure of creating new course");
  }
});

// Student Enroll course with student id
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    // Jwt protected => req.user with user information
    // Push user._id into the course then save
    course.students.push(req.user._id);
    await course.save();
    return res.send("Enroll successfully !");
  } catch (e) {
    return res.status(500).send(e);
  }
});

// Update course
router.patch("/:_id", async (req, res) => {
  // courseValidation
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.detail[0].message);

  // Check course existence
  let { _id } = req.params;
  try {
    let courseFind = await Course.findOne({ _id });
    if (!courseFind) {
      return res.status(400).send("Cannot find the course !");
    }
  } catch (e) {
    return res.status(500).send(e);
  }

  // Check identity then update
  if (courseFind.instructor.equals(req.use_id)) {
    let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    });
    return res.send({
      message: "Course had been updated !",
      updatedCourse,
    });
  } else {
    return res.status(403).send("Only instructor can update course !");
  }
});

// Delete course
router.delete("/:_id", async (req, res) => {
  // Check course existence
  let { _id } = req.params;
  try {
    let courseFind = await Course.findOne({ _id }).exec();
    if (!courseFind) {
      return res.status(400).send("Delete fail ! Cannot find the course !");
    }
  } catch (e) {
    return res.status(500).send(e);
  }

  // Check identity then delete
  if (courseFind.instructor.equals(req.use_id)) {
    Course.deleteOne({ _id }).exec();
    return res.send("Course had been deleted !");
  } else {
    return res.status(403).send("Only instructor can delete course !");
  }
});

module.exports = router;
