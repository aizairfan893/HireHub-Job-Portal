const API = "http://localhost:5000";


// ================= LOAD JOBS =================
async function loadJobs() {

    try {

        const res = await fetch(`${API}/jobs`);
        const jobs = await res.json();

        const total = document.getElementById("totalJobs");

        if (total) {
            total.innerText = jobs.length;
        }

        const list = document.getElementById("jobList");

        list.innerHTML = "";

        jobs.forEach(job => {

            list.innerHTML += `
                <div class="job p-3 mb-3">

                    <h4>${job.title}</h4>

                    <p><b>${job.company}</b></p>

                    <p>${job.location}</p>

                    <p>💰 ${job.salary}</p>

                    <p>${job.description}</p>

                    <button
                        class="btn btn-primary mt-2"
                        onclick="applyJob(${job.id})"
                    >
                        Apply
                    </button>

                </div>
            `;
        });

    } catch (err) {
        console.log(err);
    }
}


// ================= ADD JOB =================
async function addJob() {

    const job = {
        title: document.getElementById("title").value,
        company: document.getElementById("company").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        description: document.getElementById("description").value
    };

    const res = await fetch(`${API}/add-job`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(job)
    });

    const data = await res.json();

    alert(data.message);

    loadJobs();
}


// ================= APPLY JOB =================
async function applyJob(jobId) {

    const name =
        document.getElementById("userName").value;

    const email =
        document.getElementById("userEmail").value;

    const skills =
        document.getElementById("userSkills").value;

    const resumeFile =
        document.getElementById("resume").files[0];

    if (!name || !email || !skills || !resumeFile) {

        alert("Please fill all fields");

        return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("email", email);
    formData.append("skills", skills);
    formData.append("jobId", jobId);
    formData.append("resume", resumeFile);

    const res = await fetch(`${API}/apply`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    alert(data.message);

    loadApplications();
}


// ================= LOAD APPLICATIONS =================
async function loadApplications() {

    const res = await fetch(`${API}/applications`);

    const applications = await res.json();

    const box =
        document.getElementById("applicationList");

    box.innerHTML = "";

    applications.forEach(app => {

        box.innerHTML += `
            <div class="job mb-3 p-3">

                <h5>${app.name}</h5>

                <p>${app.email}</p>

                <p><b>Skills:</b> ${app.skills}</p>

                <p><b>Job:</b> ${app.title}</p>

                <p><b>Status:</b> ${app.status}</p>

                <a
                    href="http://localhost:5000/uploads/${app.resume}"
                    target="_blank"
                    class="btn btn-info btn-sm"
                >
                    View Resume
                </a>

                <button
                    class="btn btn-success btn-sm"
                    onclick="approveApplication(${app.id})"
                >
                    Approve
                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteApplication(${app.id})"
                >
                    Delete
                </button>

            </div>
        `;
    });
}


// ================= APPROVE =================
async function approveApplication(id) {

    const res = await fetch(`${API}/approve/${id}`, {
        method: "PUT"
    });

    const data = await res.json();

    alert(data.message);

    loadApplications();
}


async function deleteApplication(id) {

    const res = await fetch(
        `${API}/delete-application/${id}`,
        {
            method: "DELETE"
        }
    );

    const data = await res.json();

    alert(data.message);

    loadApplications();
}

// ================= INIT =================
loadJobs();
loadApplications();