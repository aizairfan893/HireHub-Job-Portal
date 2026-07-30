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

// STATIC
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= CREATE UPLOADS FOLDER =================
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}


// ================= MULTER =================
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

    res.sendFile(
        path.join(__dirname, "public/index.html")
    );
});


// ================= GET JOBS =================
app.get("/jobs", (req, res) => {

    const sql =
        "SELECT * FROM jobs ORDER BY id DESC";

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(result);
    });
});


// ================= ADD JOB =================
app.post("/add-job", (req, res) => {

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
        (title, company, location, salary, description)
        VALUES (?, ?, ?, ?, ?)
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
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Insert failed"
                });
            }

            res.json({
                message: "Job added successfully"
            });
        }
    );
});


// ================= APPLY JOB =================
app.post(
    "/apply",
    upload.single("resume"),
    (req, res) => {

        const {
            name,
            email,
            skills,
            jobId
        } = req.body;

        const resume =
            req.file
                ? req.file.filename
                : "";

        if (
            !name ||
            !email ||
            !skills ||
            !jobId
        ) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const sql = `
            INSERT INTO applications
            (name, email, skills, jobId, resume, status)
            VALUES (?, ?, ?, ?, ?, ?)
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
                        message: "Apply failed"
                    });
                }

                res.json({
                    message:
                        "Application submitted successfully"
                });
            }
        );
    }
);


// ================= GET APPLICATIONS =================
app.get("/applications", (req, res) => {

    const sql = `
        SELECT
            applications.*,
            jobs.title
        FROM applications
        JOIN jobs
        ON applications.jobId = jobs.id
        ORDER BY applications.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(result);
    });
});


// ================= APPROVE =================
app.put("/approve/:id", (req, res) => {

    const sql = `
        UPDATE applications
        SET status='Approved'
        WHERE id=?
    `;

    db.query(
        sql,
        [req.params.id],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Approve failed"
                });
            }

            res.json({
                message: "Application approved"
            });
        }
    );
});


// ================= REJECT =================
app.put("/reject/:id", (req, res) => {

    const sql = `
        UPDATE applications
        SET status='Rejected'
        WHERE id=?
    `;

    db.query(
        sql,
        [req.params.id],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Reject failed"
                });
            }

            res.json({
                message: "Application rejected"
            });
        }
    );
});


// ================= DELETE =================
app.delete(
    "/delete-application/:id",
    (req, res) => {

        const sql = `
            DELETE FROM applications
            WHERE id=?
        `;

        db.query(
            sql,
            [req.params.id],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message: "Delete failed"
                    });
                }

                res.json({
                    message: "Application deleted"
                });
            }
        );
    }
);


// ================= START =================
app.listen(5000, () => {

    console.log(
        "🚀 Server running on http://localhost:5000"
    );
});