const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads folder if not exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// ================= HOME =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// ================= GET JOBS =================
app.get("/jobs", (req, res) => {

    db.query("SELECT * FROM jobs ORDER BY id DESC", (err, result) => {

        if (err) {
            console.log("GET JOB ERROR:", err);
            return res.status(500).json({
                message: "Database Error"
            });
        }

        res.json(result);
    });

});

// ================= ADD JOB =================
app.post("/add-job", (req, res) => {

    console.log("POST /add-job");
    console.log(req.body);

    const {
        title,
        company,
        location,
        salary,
        description
    } = req.body;

    if (
        !title ||
        !company ||
        !location ||
        !salary ||
        !description
    ) {

        return res.status(400).json({
            message: "All fields required"
        });

    }

    const sql = `
    INSERT INTO jobs
    (title,company,location,salary,description)
    VALUES (?,?,?,?,?)
    `;

    db.query(
        sql,
        [
            title,
            company,
            location,
            salary,
            description
        ],
        (err, result) => {

            if (err) {

                console.log("INSERT ERROR:", err);

                return res.status(500).json({
                    message: "Insert failed"
                });

            }

            console.log("JOB ADDED");

            res.json({
                message: "Job added successfully"
            });

        }
    );

});

// ================= APPLY =================
app.post("/apply", upload.single("resume"), (req, res) => {

    const {
        name,
        email,
        skills,
        jobId
    } = req.body;

    const resume = req.file
        ? req.file.filename
        : "";

    const sql = `
    INSERT INTO applications
    (name,email,skills,jobId,resume,status)
    VALUES (?,?,?,?,?,?)
    `;

    db.query(
        sql,
        [
            name,
            email,
            skills,
            jobId,
            resume,
            "Pending"
        ],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Apply Failed"
                });

            }

            res.json({
                message: "Application Submitted"
            });

        });

});

// ================= GET APPLICATIONS =================
app.get("/applications", (req, res) => {

    const sql = `
    SELECT applications.*,jobs.title
    FROM applications
    JOIN jobs
    ON applications.jobId=jobs.id
    ORDER BY applications.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        res.json(result);

    });

});

// ================= APPROVE =================
app.put("/approve/:id", (req, res) => {

    db.query(
        "UPDATE applications SET status='Approved' WHERE id=?",
        [req.params.id],
        (err) => {

            if (err) {

                return res.status(500).json({
                    message: "Approve Failed"
                });

            }

            res.json({
                message: "Application Approved"
            });

        });

});

// ================= REJECT =================
app.put("/reject/:id", (req, res) => {

    db.query(
        "UPDATE applications SET status='Rejected' WHERE id=?",
        [req.params.id],
        (err) => {

            if (err) {

                return res.status(500).json({
                    message: "Reject Failed"
                });

            }

            res.json({
                message: "Application Rejected"
            });

        });

});

// ================= DELETE =================
app.delete("/delete-application/:id", (req, res) => {

    db.query(
        "DELETE FROM applications WHERE id=?",
        [req.params.id],
        (err) => {

            if (err) {

                return res.status(500).json({
                    message: "Delete Failed"
                });

            }

            res.json({
                message: "Application Deleted"
            });

        });

});

// ================= START =================
app.listen(5000, () => {

    console.log("🚀 Server running on http://localhost:5000");

});